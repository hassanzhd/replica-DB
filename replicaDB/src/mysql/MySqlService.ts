import mysql, { RowDataPacket } from "mysql2/promise";
import { ConfigService } from "../Config/ConfigService";
import { RawTableMetaData } from "../Interfaces/RawTableMetaData";
import { IDatabaseService } from "../Interfaces/IDatabaseService";

export class MySqlService implements IDatabaseService {
  private static service: MySqlService;
  private client: mysql.Connection;

  private constructor(client: mysql.Connection) {
    this.client = client;
  }

  public static async getInstance() {
    if (MySqlService.service) {
      return MySqlService.service;
    }

    const source = ConfigService.getConfig("source");
    const mysqlClient = await mysql.createConnection({
      host: source.host,
      user: source.user,
      password: source.password,
      database: source.database,
      port: source.port,
    });

    await mysqlClient.connect();
    return new MySqlService(mysqlClient);
  }

  public async getRawTablesMetaData(): Promise<RawTableMetaData[]> {
    const databaseName = this.client.config.database;
    const [rows] = await this.client.query<RawTableMetaData[]>(
      `SELECT
          ic.TABLE_NAME AS tableName,
          JSON_ARRAYAGG(JSON_OBJECT("name", ic.COLUMN_NAME, "type", ic.COLUMN_TYPE, "position", ic.ORDINAL_POSITION)) AS columnMetaData
        FROM
          INFORMATION_SCHEMA.COLUMNS ic
        WHERE
            ic.TABLE_SCHEMA = "${databaseName}"
        GROUP BY
            ic.TABLE_NAME`
    );

    return rows;
  }

  public async findAll(tableName: string): Promise<object[]> {
    const queryString = `SELECT * FROM ${tableName}`;
    const [rows] = await this.client.query<RowDataPacket[]>(queryString);
    return rows;
  }

  public async destructor() {
    await this.client.end();
  }
}
