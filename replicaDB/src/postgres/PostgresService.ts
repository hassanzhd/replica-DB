import fs from "fs";
import commandLineArgumentsParser from "minimist-lite";
import YAML from "yaml";
import { Client, QueryResult } from "pg";
import { TableMetaData } from "../TableMetaData/TableMetaData";
import { ColumnMetaData } from "../ColumnMetaData/ColumnMetaData";
import { chunk as chunkArray } from "lodash";
import { MySqlService } from "../mysql/MySqlService";
import { IDatabaseService } from "../Interfaces/IDatabaseService";
import { RawTableMetaData } from "../Interfaces/RawTableMetaData";

interface ConnectionProps {
  user: string;
  password: string;
  host: string;
  port: string;
  database: string;
}

export class PostgresService implements IDatabaseService {
  private client: Client;
  private static service: PostgresService;

  private constructor(client: Client) {
    this.client = client;
  }
  
  public static async getInstance() {
    if (PostgresService.service) {
      return PostgresService.service;
    }

    const argv = commandLineArgumentsParser(process.argv.slice(2));
    const fileContent = fs.readFileSync(argv.f, { encoding: "utf-8" });
    const { destination } = YAML.parse(fileContent);

    const connectionString = this.getConnectionString(destination);
    const client = new Client({
      connectionString: connectionString,
    });
    await client.connect();
    return new PostgresService(client);
  }

  public async addTables(tableMetaData: TableMetaData[]) {
    const insertQueryStrings: string[] = tableMetaData.map(
      this.getCreateTableQueryString.bind(this)
    );
    const insertQuery = insertQueryStrings.join("\n");

    try {
      await this.client.query(insertQuery);
    } catch (error) {
      const typedError = error as Error;
      console.error(typedError.message);
    }
  }

  public async addRecords(
    sourceService: MySqlService,
    tableMetaData: TableMetaData[]
  ) {
    for (let i = 0; i < tableMetaData.length; i++) {
      const metaData = tableMetaData[i];
      const rows = await sourceService.findAll(metaData.tableName);
      const insertValuesQueryStrings = this.getInsertValuesQueryStrings(
        metaData,
        new Array(...rows)
      );
      const insertValuesQueryString = insertValuesQueryStrings.join("\n");

      try {
        await this.client.query(insertValuesQueryString);
      } catch (error) {
        const typedError = error as Error;
        console.error(typedError.message);
      }
    }
  }

  // public async getRawTablesMetaData(): Promise<RawTableMetaData[]> {
  //   const databaseName = this.client.database;
  //   const { rows } = await this.client.query<RawTableMetaData>(
  //     `SELECT
  //         ic.TABLE_NAME AS tableName,
  //         JSON_ARRAYAGG(JSON_OBJECT("name", ic.COLUMN_NAME, "type", ic.COLUMN_TYPE, "position", ic.ORDINAL_POSITION)) AS columnMetaData
  //       FROM
  //         INFORMATION_SCHEMA.COLUMNS ic
  //       WHERE
  //           ic.TABLE_SCHEMA = "${databaseName}"
  //       GROUP BY
  //           ic.TABLE_NAME`
  //   );

  //   return rows; 
  // }
  
  public async findAll(tableName: string): Promise<object[]> {
    const queryString = `SELECT * FROM ${tableName}`;
    const { rows } = await this.client.query<QueryResult>(queryString);
    return rows;
  }


  public async destructor() {
    await this.client.end();
  }

  private static getConnectionString(props: ConnectionProps) {
    return (
      "postgres://" +
      `${props.user}:${props.password}` +
      `@${props.host}:${props.port}` +
      `/${props.database}`
    );
  }

  private getColumnDefinition(columnMetaData: ColumnMetaData) {
    return `${columnMetaData.name} ${columnMetaData.type}`;
  }

  private getCreateTableQueryString(tableMetaData: TableMetaData) {
    const createString = `CREATE TABLE IF NOT EXISTS ${tableMetaData.tableName} `;
    const columnDefinitions: string[] = tableMetaData.columnMetaData.map(
      this.getColumnDefinition.bind(this)
    );
    const columnDefinitonString = `(${columnDefinitions.join(", ")})`;
    return createString + columnDefinitonString + ";";
  }

  private getInsertValuesQueryStrings(
    tableMetaData: TableMetaData,
    rows: object[]
  ) {
    const insertIntoString = `INSERT INTO ${
      tableMetaData.tableName
    } (${tableMetaData.columnMetaData
      .map((metaData) => metaData.name)
      .join(", ")}) VALUES`;

    const chunkedRowsArray = chunkArray(rows, 1000);

    const insertValuesQueryStrings = chunkedRowsArray.map((chunkedRows) => {
      const valuesString = chunkedRows
        .map((chunkedRow) => Object.values(chunkedRow))
        .map((values) => {
          return values.map((value) => {
            if (typeof value == "string") {
              return `'${value}'`;
            }
            return value;
          });
        })
        .map((values) => {
          return `(${values.join(", ")})`;
        })
        .join(", ");
      return `${insertIntoString} ${valuesString};`;
    });

    return insertValuesQueryStrings;
  }
}
