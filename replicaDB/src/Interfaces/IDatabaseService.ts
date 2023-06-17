import { RawTableMetaData } from "./RawTableMetaData";

export interface IDatabaseService {
  getRawTablesMetaData(): Promise<RawTableMetaData[]>;
  findAll(tableName: string): Promise<object[]>;
  destructor(): Promise<void>;
}
