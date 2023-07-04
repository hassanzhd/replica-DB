import { ConfigService } from "../config/ConfigService";
import { DatabaseEngine } from "../databases_engine/DatabaseEngine";
import { MySqlService } from "../mysql/MySqlService";
import { PostgresService } from "../postgres/PostgresService";

export class DatabaseServiceFactory {
  public static async getDatabaseService(targetName: string) {
    let service = undefined;
    const config = await ConfigService.getConfig(targetName);

    if (config.engine == DatabaseEngine.postgres) {
      service = await PostgresService.getInstance(config);
      return service;
    }

    service = await MySqlService.getInstance(config);
    return service;
  }
}
