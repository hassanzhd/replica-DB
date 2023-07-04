import mysql, { RowDataPacket } from "mysql2/promise";
import {
  MySqlRawTableMetaData,
  RawTableMetaData,
} from "../interfaces/RawTableMetaData";
import { IDatabaseService } from "../interfaces/IDatabaseService";
import { TableMetaData } from "../table_metadata/TableMetaData";
import { ColumnMetaData } from "../column_metadata/ColumnMetaData";
import { chunk as chunkArray } from "lodash";
import { DatabaseConfig } from "../config/DatabaseConfig";
import { SqlQueryService } from "../sql_query/SqlQueryService";
import { QueryType } from "../sql_query/QueryType";
import { PrimaryKeyColumn } from "../primary_key_column/PrimaryKeyColumn";
import { DatabaseEngine } from "../databases_engine/DatabaseEngine";

export class MySqlService implements IDatabaseService {
  private static service: MySqlService;
  private client: mysql.Connection;
  public engine: DatabaseEngine = DatabaseEngine.mysql;

  private constructor(client: mysql.Connection) {
    this.client = client;
  }

  public static async getInstance(config: DatabaseConfig) {
    if (MySqlService.service) {
      return MySqlService.service;
    }

    const mysqlClient = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port,
      multipleStatements: true,
    });

    await mysqlClient.connect();
    return new MySqlService(mysqlClient);
  }

  public async getRawTablesMetaData(): Promise<RawTableMetaData[]> {
    const databaseName = this.client.config.database;
    const query = await SqlQueryService.getQuery(
      QueryType.GetMySqlTableMetaData
    );

    if (query != undefined) {
      const [rows] = await this.client.query<MySqlRawTableMetaData[]>(query, [
        databaseName,
        databaseName,
      ]);
      return rows;
    }

    throw new Error("Couldnot retrieve query.");
  }

  public async addTables(tableMetaData: TableMetaData[]) {
    const createTableQueryStrings: string[] = tableMetaData.map(
      this.getCreateTableQueryString.bind(this)
    );
    const createTableQuery = createTableQueryStrings.join("\n");

    try {
      await this.client.query(createTableQuery);
      console.log(
        `Successfully created ${createTableQueryStrings.length} tables.`
      );
    } catch (error) {
      const typedError = error as Error;
      console.error(typedError.message);
    }
  }

  public async addRecords(
    sourceService: IDatabaseService,
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
        console.log(
          `Successfully added ${rows.length} records to ${metaData.tableName}.`
        );
      } catch (error) {
        const typedError = error as Error;
        console.error(typedError.message);
      }
    }
  }

  public async findAll(tableName: string): Promise<object[]> {
    const queryString = `SELECT * FROM ${tableName}`;
    const [rows] = await this.client.query<RowDataPacket[]>(queryString);
    return rows;
  }

  public getSourceDestinationKey(destinationEngine: DatabaseEngine) {
    return this.engine + '.' + destinationEngine;
  }

  public async destructor() {
    await this.client.end();
  }

  private getCreateTableQueryString(tableMetaData: TableMetaData) {
    const createString = `CREATE TABLE IF NOT EXISTS ${tableMetaData.tableName} `;
    const columnDefinitions: string[] = tableMetaData.columnMetaData.map(
      this.getColumnDefinition.bind(this)
    );
    let columnDefinitionString = "(";
    columnDefinitionString += `${columnDefinitions.join(", ")}`;
    const primaryKeyColumns = tableMetaData.primaryKeyColumns;
    if (primaryKeyColumns.length != 0) {
      columnDefinitionString += ", PRIMARY KEY (";
      const primaryKeyDefinitionString = primaryKeyColumns
        .map(this.getPrimaryKeyDefinition.bind(this))
        .join(", ");
      columnDefinitionString += `${primaryKeyDefinitionString})`;
    }

    columnDefinitionString += ")";
    return createString + columnDefinitionString + ";";
  }

  private getColumnDefinition(columnMetaData: ColumnMetaData) {
    return `${columnMetaData.name} ${columnMetaData.type}`;
  }

  private getPrimaryKeyDefinition(primaryKeyColumn: PrimaryKeyColumn) {
    return primaryKeyColumn.name;
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
