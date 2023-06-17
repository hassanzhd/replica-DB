import { RowDataPacket } from "mysql2";
import { ColumnMetaData } from "../ColumnMetaData/ColumnMetaData";

export interface RawColumnMetaData extends RowDataPacket, ColumnMetaData {
    position: number;
}