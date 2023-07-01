import { Client, QueryResult } from "pg";
import { TableMetaData } from "../table_metadata/TableMetaData";
import { ColumnMetaData } from "../column_metadata/ColumnMetaData";
import { chunk as chunkArray } from "lodash";
import { IDatabaseService } from "../interfaces/IDatabaseService";
import {
  PostgresRawTableMetaData,
  RawTableMetaData,
} from "../interfaces/RawTableMetaData";
import { DatabaseConfig } from "../config/DatabaseConfig";
import { SqlQueryService } from "../sql_query/SqlQueryService";
import { QueryType } from "../sql_query/QueryType";
import { PrimaryKeyColumn } from "../primary_key_column/PrimaryKeyColumn";

interface ConnectionProps {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

export class PostgresService implements IDatabaseService {
  private client: Client;
  private static service: PostgresService;

  private constructor(client: Client) {
    this.client = client;
  }

  public static async getInstance(config: DatabaseConfig) {
    if (PostgresService.service) {
      return PostgresService.service;
    }

    const connectionString = this.getConnectionString(config);
    const client = new Client({
      connectionString: connectionString,
    });
    await client.connect();
    return new PostgresService(client);
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

  public async getRawTablesMetaData(): Promise<RawTableMetaData[]> {
    const query = await SqlQueryService.getQuery(
      QueryType.GetPostgresTableMetaData
    );

    if (query != undefined) {
      const { rows } = await this.client.query<PostgresRawTableMetaData>(query);
      return rows;
    }

    throw new Error("Couldnot retrieve query.");
  }

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

  private getPrimaryKeyDefinition(primaryKeyColumn: PrimaryKeyColumn) {
    return primaryKeyColumn.name;
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
