import { DatabaseServiceFactory } from "../database_service/DatabaseServiceFactory";
import { TableMetaDataMapper } from "../table_metadata/TableMetaDataMapper";

export class ReplicaService {
  private static service: ReplicaService;
  private readonly SOURCE_KEY;
  private readonly DESTINATION_KEY;

  private constructor() {
    this.SOURCE_KEY = "source";
    this.DESTINATION_KEY = "destination";
  }

  public static getInstance() {
    if (this.service) {
      return this.service;
    }

    return new ReplicaService();
  }

  public async replicate() {
    const sourceService = await DatabaseServiceFactory.getDatabaseService(
      this.SOURCE_KEY
    );
    const destinationService = await DatabaseServiceFactory.getDatabaseService(
      this.DESTINATION_KEY
    );

    const rawTablesMetaData = await sourceService.getRawTablesMetaData();
    const tableMetaData = rawTablesMetaData.map((rawTableMetaData) => {
      const tableDataMapper = new TableMetaDataMapper(
        sourceService,
        destinationService
      );
      return tableDataMapper.toDomain(rawTableMetaData);
    });

    await destinationService.addTables(tableMetaData);
    await destinationService.addRecords(sourceService, tableMetaData);

    await destinationService.destructor();
    await sourceService.destructor();
  }
}
