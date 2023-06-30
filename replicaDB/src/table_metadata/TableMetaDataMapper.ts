import { ColumnMetaData } from "../column_metadata/ColumnMetaData";
import { RawTableMetaData } from "../interfaces/RawTableMetaData";
import { PrimaryKeyColumn } from "../primary_key_column/PrimaryKeyColumn";
import { TableMetaData } from "./TableMetaData";

export class TableMetaDataMapper {
  public static toDomain(raw: RawTableMetaData): TableMetaData {
    const columnMetaData = raw.column_metadata;
    const positionedColumnMetaData = new Array<ColumnMetaData>(
      columnMetaData.length
    );

    columnMetaData.forEach((metaData) => {
      positionedColumnMetaData[metaData.position - 1] = ColumnMetaData.create(
        metaData.name,
        metaData.type
      );
    });

    const primaryKeyColumns = raw.primary_key_columns;
    const positionedPrimaryKeyColumns = new Array<PrimaryKeyColumn>(
      primaryKeyColumns.length
    );

    primaryKeyColumns.forEach((primaryKeyColumn) => {
      positionedPrimaryKeyColumns[primaryKeyColumn.position - 1] =
        PrimaryKeyColumn.create(primaryKeyColumn.name);
    });

    return TableMetaData.create(
      raw.table_name,
      positionedColumnMetaData,
      positionedPrimaryKeyColumns
    );
  }
}
