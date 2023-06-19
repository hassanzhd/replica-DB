import { RowDataPacket } from "mysql2";
import { RawColumnMetaData } from "./RawColumnMetaData";
import { QueryResult } from "pg";

export interface RawTableMetaData {
  table_name: string;
  column_metadata: RawColumnMetaData[];
}

export interface MySqlRawTableMetaData
  extends RawTableMetaData,
    RowDataPacket {}

export interface PostgresRawTableMetaData
  extends RawTableMetaData,
    QueryResult {}
