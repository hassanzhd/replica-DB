import { ColumnMetaData } from "../ColumnMetaData/ColumnMetaData";
import { RawTableMetaData } from "../Interfaces/RawTableMetaData";
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

    return TableMetaData.create(raw.table_name, columnMetaData);
  }
}
