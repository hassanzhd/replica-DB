import { ConfigService } from "./Config/ConfigService";
import { TableMetaDataMapper } from "./TableMetaData/TableMetaDataMapper";
import { PostgresService } from "./postgres/PostgresService";
import { MySqlService } from "./mysql/MySqlService";
import { IDatabaseService } from "./Interfaces/IDatabaseService";

async function getDatabaseService(
  targetName: string
): Promise<IDatabaseService> {
  let service = undefined;
  const config = await ConfigService.getConfig(targetName);

  if (config.engine == "postgres") {
    service = await PostgresService.getInstance(config);
    return service;
  }

  service = await MySqlService.getInstance(config);
  return service;
}

async function main() {
  const sourceService = await getDatabaseService("source");
  const destinationService = await getDatabaseService("destination");

  const rawTablesMetaData = await sourceService.getRawTablesMetaData();
  const tableMetaData = rawTablesMetaData.map((rawTableMetaData) =>
    TableMetaDataMapper.toDomain(rawTableMetaData)
  );

  await destinationService.addTables(tableMetaData);
  await destinationService.addRecords(sourceService, tableMetaData);

  await destinationService.destructor();
  await sourceService.destructor();
}

main();
