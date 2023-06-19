import { TableMetaData } from "../TableMetaData/TableMetaData";
import { RawTableMetaData } from "./RawTableMetaData";

export interface IDatabaseService {
  getRawTablesMetaData(): Promise<RawTableMetaData[]>;
  addTables(tableMetaData: TableMetaData[]): Promise<void>;
  addRecords(
    sourceService: IDatabaseService,
    tableMetaData: TableMetaData[]
  ): Promise<void>;
  findAll(tableName: string): Promise<object[]>;
  destructor(): Promise<void>;
}
