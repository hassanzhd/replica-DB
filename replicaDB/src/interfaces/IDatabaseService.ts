import { DatabaseEngine } from "../databases_engine/DatabaseEngine";
import { TableMetaData } from "../table_metadata/TableMetaData";
import { RawTableMetaData } from "./RawTableMetaData";

export interface IDatabaseService {
  engine: DatabaseEngine;
  getRawTablesMetaData(): Promise<RawTableMetaData[]>;
  addTables(tableMetaData: TableMetaData[]): Promise<void>;
  addRecords(
    sourceService: IDatabaseService,
    tableMetaData: TableMetaData[]
  ): Promise<void>;
  findAll(tableName: string): Promise<object[]>;
  getSourceDestinationKey(destinationEngine: DatabaseEngine): string;
  destructor(): Promise<void>;
}
