import fs from "fs";
import commandLineArgumentsParser from "minimist-lite";
import YAML from "yaml";
import { DatabaseConfig } from "./DatabaseConfig";

export class ConfigService {
  private static service: ConfigService;
  private config: Record<string, DatabaseConfig>;

  private constructor() {
    const argv = commandLineArgumentsParser(process.argv.slice(2));
    const fileContent = fs.readFileSync(argv.f, { encoding: "utf-8" });
    this.config = YAML.parse(fileContent);
  }

  private static getInstance() {
    if (this.service) {
      return this.service;
    }

    return new ConfigService();
  }

  public static getConfig(key: string) {
    const service = ConfigService.getInstance();
    return service.config[key];
  }
}
