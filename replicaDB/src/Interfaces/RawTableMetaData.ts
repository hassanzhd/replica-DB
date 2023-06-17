import { RowDataPacket } from "mysql2";
import { RawColumnMetaData } from "./RawColumnMetaData";

export interface RawTableMetaData extends RowDataPacket {
    tableName: string;
    columnMetaData: RawColumnMetaData[];
}