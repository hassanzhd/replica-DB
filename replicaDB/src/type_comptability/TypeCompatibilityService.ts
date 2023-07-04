import { TypeMapping } from "./TypeMapping";
import { toPairs } from "lodash";

export class TypeCompatibilityService {
  private static service: TypeCompatibilityService;
  private typeMappings: Record<string, Record<string, string | string[]>>;

  private constructor(
    typeMappings: Record<string, Record<string, string | string[]>>
  ) {
    this.typeMappings = typeMappings;
  }

  public static getInstance() {
    if (TypeCompatibilityService.service) {
      return TypeCompatibilityService.service;
    }

    const typeMappings: Record<string, Record<string, string | string[]>> = {};
    const typeMappingsKV = toPairs(TypeMapping);

    typeMappingsKV.forEach((typeMappingKV) => {
      const [sourceName, destinations] = typeMappingKV;
      const destinationsKV = toPairs(destinations);

      destinationsKV.forEach((destinationKV) => {
        const [destinationName, mappingTypes] = destinationKV;
        const sourceDestinationKey = `${sourceName}.${destinationName}`;
        const destinationSourceKey = `${destinationName}.${sourceName}`;

        const symmetric = mappingTypes.symmetric;
        if (symmetric) {
          const symmetricKV = toPairs(symmetric);

          symmetricKV.forEach((typeKV) => {
            const [sourceType, destinationType] = typeKV;

            if (!typeMappings[sourceDestinationKey]) {
              typeMappings[sourceDestinationKey] = {};
            }

            if (!typeMappings[destinationSourceKey]) {
              typeMappings[destinationSourceKey] = {};
            }

            typeMappings[sourceDestinationKey][sourceType] = destinationType;
            typeMappings[destinationSourceKey][destinationType] = sourceType;
          });
        }

        const assymetric = mappingTypes.assymetric;
        if (assymetric) {
          const assymetricKV = toPairs(assymetric);

          assymetricKV.forEach((typeKV) => {
            const [sourceType, destinationType] = typeKV;

            typeMappings[sourceDestinationKey][sourceType] = destinationType;
          });
        }

        const common = mappingTypes.common;
        if (common) {
          typeMappings[sourceDestinationKey]["common"] = [...common];
          typeMappings[destinationSourceKey]["common"] = [...common];
        }
      });
    });

    return new TypeCompatibilityService(typeMappings);
  }

  public getTypeMapping(sourceDestinationKey: string, sourceType: string) {
    const commonTypeMappings =
      this.typeMappings[sourceDestinationKey]["common"];

    if (sourceType.includes("(")) {
      const [sourceTypeName] = sourceType.split("(");

      if (commonTypeMappings.includes(sourceTypeName)) {
        return sourceType;
      }
    }

    if (commonTypeMappings.includes(sourceType)) {
      return sourceType;
    }

    const typeMapping = this.typeMappings[sourceDestinationKey][sourceType];
    if (typeMapping && typeof typeMapping == "string") {
      return typeMapping;
    }

    throw new Error("Could not find provided source type");
  }
}
