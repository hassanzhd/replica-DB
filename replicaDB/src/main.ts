import { TableMetaDataMapper } from "./TableMetaData/TableMetaDataMapper";
import { PostgresService } from "./postgres/PostgresService";
import { MySqlService } from "./mysql/MySqlService";

async function main() {
  const postgresClient = await PostgresService.getInstance();
  const mysqlService = await MySqlService.getInstance();

  const rawTablesMetaData = await mysqlService.getRawTablesMetaData();
  const tableMetaData = rawTablesMetaData.map((rawTableMetaData) =>
    TableMetaDataMapper.toDomain(rawTableMetaData)
  );

  await postgresClient.addTables(tableMetaData);
  await postgresClient.addRecords(mysqlService, tableMetaData);

  await mysqlService.destructor();
  await postgresClient.destructor();
}

main();
