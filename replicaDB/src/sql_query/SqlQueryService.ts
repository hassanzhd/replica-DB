import fs from "fs/promises";
import path from "path";
import { QueryPath } from "./QueryPath";
import { QueryType } from "./QueryType";

export class SqlQueryService {
  private static service: SqlQueryService;
  private queries: Map<number, string>;

  public static async getQuery(key: QueryType) {
    const service = await SqlQueryService.getInstance();
    return service.queries.get(key);
  }

  private constructor(queries: Map<number, string>) {
    this.queries = queries;
  }

  private static async getInstance() {
    if (this.service) {
      return this.service;
    }

    const queries = await this.getQueries();
    return new SqlQueryService(queries);
  }

  private static async getQueries(): Promise<Map<number, string>> {
    const queryNames = Object.keys(QueryPath);
    const queryPaths = Object.values(QueryPath);

    const queries = new Map<number, string>();

    for (let index = 0; index < queryNames.length; index++) {
      const queryNumber = queryNames[index];
      const queryPath = queryPaths[index];
      const basePath = require.main != undefined ? require.main.path : "";
      const queryFullPath = path.join(basePath, "resources/sql", queryPath);
      const fileContent = await fs.readFile(queryFullPath, {
        encoding: "utf-8",
      });
      queries.set(parseInt(queryNumber), fileContent);
    }

    return queries;
  }
}
