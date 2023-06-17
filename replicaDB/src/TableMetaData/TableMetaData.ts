import { ColumnMetaData } from "../ColumnMetaData/ColumnMetaData";

interface TableMetaDataProps {
  tableName: string;
  columnMetaData: ColumnMetaData[];
}

export class TableMetaData {
  public tableName: string;
  public columnMetaData: ColumnMetaData[];

  private constructor(props: TableMetaDataProps) {
    this.tableName = props.tableName;
    this.columnMetaData = props.columnMetaData;
  }

  public static create(
    tableName: string,
    columnMetaData: ColumnMetaData[]
  ): TableMetaData {
    return new TableMetaData({ tableName, columnMetaData });
  }
}
