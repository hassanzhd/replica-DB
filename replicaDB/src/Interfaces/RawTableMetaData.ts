import { RowDataPacket } from "mysql2";
import { RawColumnMetaData } from "./RawColumnMetaData";
import { QueryResult } from "pg";

export interface RawTableMetaData {
  tableName: string;
  columnMetaData: RawColumnMetaData[];
}

export interface MySqlRawTableMetaData
  extends RawTableMetaData,
    RowDataPacket {}

export interface PostgresRawTableMetaData
  extends RawTableMetaData,
    QueryResult {}
