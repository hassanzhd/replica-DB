import { RowDataPacket } from "mysql2";
import { RawColumnMetaData } from "./RawColumnMetaData";
import { QueryResult } from "pg";
import { RawPrimaryKeyColumn } from "./RawPrimaryKeyColumn";

export interface RawTableMetaData {
  table_name: string;
  column_metadata: RawColumnMetaData[];
  primary_key_columns: RawPrimaryKeyColumn[]
}

export interface MySqlRawTableMetaData
  extends RawTableMetaData,
    RowDataPacket {}

export interface PostgresRawTableMetaData
  extends RawTableMetaData,
    QueryResult {}
