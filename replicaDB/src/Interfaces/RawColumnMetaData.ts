import { RowDataPacket } from "mysql2";
import { ColumnMetaData } from "../column_metadata/ColumnMetaData";

export interface RawColumnMetaData extends RowDataPacket, ColumnMetaData {
    position: number;
}