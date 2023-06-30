import { ColumnMetaData } from "../column_metadata/ColumnMetaData";
import { PrimaryKeyColumn } from "../primary_key_column/PrimaryKeyColumn";

interface TableMetaDataProps {
  tableName: string;
  columnMetaData: ColumnMetaData[];
  primaryKeyColumns: PrimaryKeyColumn[];
}

export class TableMetaData {
  public tableName: string;
  public columnMetaData: ColumnMetaData[];
  public primaryKeyColumns: PrimaryKeyColumn[];

  private constructor(props: TableMetaDataProps) {
    this.tableName = props.tableName;
    this.columnMetaData = props.columnMetaData;
    this.primaryKeyColumns = props.primaryKeyColumns;
  }

  public static create(
    tableName: string,
    columnMetaData: ColumnMetaData[],
    primaryKeyColumns: PrimaryKeyColumn[]
  ): TableMetaData {
    return new TableMetaData({ tableName, columnMetaData, primaryKeyColumns });
  }
}
