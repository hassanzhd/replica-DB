import fs from "fs/promises";
import commandLineArgumentsParser from "minimist-lite";
import YAML from "yaml";
import { DatabaseConfig } from "./DatabaseConfig";

export class ConfigService {
  private static service: ConfigService;
  private config: Record<string, DatabaseConfig>;

  public static async getConfig(key: string) {
    const service = await ConfigService.getInstance();
    return service.config[key];
  }

  private constructor(config: Record<string, DatabaseConfig>) {
    this.config = config;
  }

  private static async getInstance() {
    if (this.service) {
      return this.service;
    }
    const argv = commandLineArgumentsParser(process.argv.slice(2));
    const fileContent = await fs.readFile(argv.f, { encoding: "utf-8" });
    const config = YAML.parse(fileContent);
    return new ConfigService(config);
  }
}
