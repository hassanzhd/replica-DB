import { TypeCompatibilityService } from "../src/type_comptability/TypeCompatibilityService";

describe("TypeCompatibilityService", () => {
  test("get instance of service", () => {
    const service = TypeCompatibilityService.getInstance();
    expect(service).not.toBeNull();
  });

  test("get common type mapping for bigint with postgres as source and mysql as destination", () => {
    const service = TypeCompatibilityService.getInstance();
    const typeMapping = service.getTypeMapping("postgres.mysql", "bigint");
    expect(typeMapping).toBe("bigint");
  });

  test("get common type mapping for varchar(30) with postgres as source and mysql as destination", () => {
    const service = TypeCompatibilityService.getInstance();
    const typeMapping = service.getTypeMapping("postgres.mysql", "varchar(30)");
    expect(typeMapping).toBe("varchar(30)");
  });

  test("get type mapping for bigserial with postgres as source and mysql as destination", () => {
    const service = TypeCompatibilityService.getInstance();
    const typeMapping = service.getTypeMapping("postgres.mysql", "bigserial");
    expect(typeMapping).toBe("bigint");
  });

  test("get type mapping for uuid with postgres as source and mysql as destination", () => {
    const service = TypeCompatibilityService.getInstance();
    const typeMapping = service.getTypeMapping("postgres.mysql", "uuid");
    expect(typeMapping).toBe("varchar(36)");
  });

  test("get type mapping for abcd with postgres as source and mysql as destination", () => {
    const service = TypeCompatibilityService.getInstance();
    expect(() => service.getTypeMapping("postgres.mysql", "abcd")).toThrowError(
      "Could not find provided source type"
    );
  });
});
