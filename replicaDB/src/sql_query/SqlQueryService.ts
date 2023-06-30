import fs from "fs/promises";
import path from "path";
import { QueryPath } from "./QueryPath";
import { QueryType } from "./QueryType";

export class SqlQueryService {
  private static service: SqlQueryService;
  private queries: Map<string, string>;

  public static async getQuery(key: QueryType) {
    const service = await SqlQueryService.getInstance();
    return service.queries.get(key.toString());
  }

  private constructor(queries: Map<string, string>) {
    this.queries = queries;
  }

  private static async getInstance() {
    if (this.service) {
      return this.service;
    }

    const queries = await this.getQueries();
    return new SqlQueryService(queries);
  }

  private static async getQueries(): Promise<Map<string, string>> {
    const queryNames = Object.keys(QueryPath);
    const queryPaths = Object.values(QueryPath);

    const queries = new Map<string, string>();

    for (let index = 0; index < queryNames.length; index++) {
      const queryName = queryNames[index];
      const queryPath = queryPaths[index];
      const queryFullPath = path.join("resources/sql", queryPath);
      const fileContent = await fs.readFile(queryFullPath, {
        encoding: "utf-8",
      });
      queries.set(queryName, fileContent);
    }

    return queries;
  }
}
