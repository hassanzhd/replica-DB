import { IDatabaseService } from "../interfaces/IDatabaseService";
import { ColumnMetaData } from "../column_metadata/ColumnMetaData";
import { RawTableMetaData } from "../interfaces/RawTableMetaData";
import { PrimaryKeyColumn } from "../primary_key_column/PrimaryKeyColumn";
import { TableMetaData } from "./TableMetaData";
import { TypeCompatibilityService } from "../type_comptability/TypeCompatibilityService";

export class TableMetaDataMapper {
  private sourceService: IDatabaseService;
  private destinationService: IDatabaseService;

  public constructor(
    sourceService: IDatabaseService,
    destinationService: IDatabaseService
  ) {
    this.sourceService = sourceService;
    this.destinationService = destinationService;
  }

  public toDomain(raw: RawTableMetaData): TableMetaData {
    const columnMetaData = raw.column_metadata;
    const positionedColumnMetaData = new Array<ColumnMetaData>(
      columnMetaData.length
    );
    const typeCompatibilityService = TypeCompatibilityService.getInstance();

    columnMetaData.forEach((metaData) => {
      const typeMapping = typeCompatibilityService.getTypeMapping(
        this.sourceService.getSourceDestinationKey(
          this.destinationService.engine
        ),
        metaData.type
      );

      positionedColumnMetaData[metaData.position - 1] = ColumnMetaData.create(
        metaData.name,
        typeMapping
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
