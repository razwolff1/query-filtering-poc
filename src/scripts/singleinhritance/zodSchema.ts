import { z } from "zod";
import { childrenTypes } from "./types.js";

// ============================================================
// Child Schemas
// ============================================================

const child1 = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  age: z.number().int(),
  nickname: z.string().nullable(),
  score: z.number(),
  verified: z.boolean().nullable(),
  type: z.literal("child_1"),
});

const child2 = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  bio: z.string().nullable(),
  heightCm: z.string(),
  weightKg: z.string().nullable(),
  registeredAt: z.date(),
  type: z.literal("child_2"),
});

const child3 = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  activeFlag: z.boolean(),
  points: z.number().int().nullable(),
  type: z.literal("child_3"),
});

const child4 = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  meta: z.string().nullable(),
  rating: z.string().nullable(),
  completed: z.boolean(),
  type: z.literal("child_4"),
});

const child5 = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable(),
  active: z.boolean().nullable(),
  type: z.literal("child_5"),
});

const child6 = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  flag: z.boolean(),
  value: z.number().int().nullable(),
  code: z.string(),
  type: z.literal("child_6"),
});

const child7 = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  info: z.string().nullable(),
  level: z.number().int(),
  valid: z.boolean(),
  subType: z.literal("child_7"),
  type: z.literal("multiChild"),
  platform: z.literal("web"),
});

const child8 = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  data: z.string().nullable(),
  count: z.number().int().nullable(),
  processed: z.boolean(),
  subType: z.literal("child_8"),
  type: z.literal("multiChild"),
  platform: z.literal("web"),
});

const child9 = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  comment: z.string().nullable(),
  score: z.number(),
  active: z.boolean().nullable(),
  subType: z.literal("child_9"),
  type: z.literal("multiChild"),
  platform: z.literal("mobile"),
});

const child10 = z.object({
  subType: z.literal("child_10"),
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  nickname: z.string().nullable(),
  bio: z.string().nullable(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  email: z.string(),
  age: z.number(),
  heightCm: z.number(),
  weightKg: z.number().nullable(),
  points: z.number().int().nullable(),
  rating: z.number().nullable(),
  score: z.number(),
  active: z.boolean().default(true),
  verified: z.boolean(),
  completed: z.boolean().default(false),
  subscribed: z.boolean().nullable(),
  flag1: z.boolean().nullable(),
  flag2: z.boolean().nullable(),
  flag3: z.boolean().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  registeredAt: z.date(),
  lastLogin: z.date().nullable(),
  code: z.string(),
  meta: z.string(),
  referenceId: z.string().nullable(),
  type: z.literal("multiChild"),
  platform: z.literal("mobile"),
});

const multiChildSchema = z.discriminatedUnion("subType", [child7, child8, child9, child10]);

export const childSchema = z.discriminatedUnion("type", [
  child1,
  child2,
  child3,
  child4,
  child5,
  child6,
  multiChildSchema,
]);

export type TChildSchema = z.infer<typeof childSchema>;

// ============================================================
// Filter Types by Field Type (Type-Level)
// ============================================================

type StringFilter =
  | { operator: "eq" | "ne" | "contains" | "notContains"; value: string }
  | { operator: "in" | "nin"; value: string[] }
  | { operator: "isEmpty" | "isNotEmpty" };

type NumberFilter =
  | { operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte"; value: number }
  | { operator: "in" | "nin"; value: number[] }
  | { operator: "isExists" | "isNotExists" };

type BooleanFilter =
  | { operator: "eq" | "ne"; value: boolean }
  | { operator: "isExists" | "isNotExists" };

type DateFilter =
  | { operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte"; value: Date }
  | { operator: "in" | "nin"; value: Date[] }
  | { operator: "isExists" | "isNotExists" };

/**
 * Enum filter with value narrowed to the actual enum options
 */
type EnumFilter<T extends string> =
  | { operator: "eq" | "ne"; value: T }
  | { operator: "in" | "nin"; value: T[] };

// ============================================================
// Type-Level Utilities for Zod Introspection (Zod 4 Compatible)
// ============================================================

/**
 * Get the inferred type from any Zod schema, handling nullable/optional/default
 */
type InferredType<T> = T extends z.ZodType<infer O> ? NonNullable<O> : never;

/**
 * Check if a type is a string literal union (for enum-like behavior)
 */
type IsStringLiteral<T> = T extends string ? (string extends T ? false : true) : false;

/**
 * Maps an inferred value type to the appropriate filter type.
 * If the type is a string literal (enum), it uses EnumFilter with narrowed values.
 */
type ValueToFilter<T> = T extends boolean
  ? BooleanFilter
  : T extends Date
    ? DateFilter
    : T extends number
      ? NumberFilter
      : T extends string
        ? IsStringLiteral<T> extends true
          ? EnumFilter<T>
          : StringFilter
        : never;

/**
 * Maps a Zod schema to the appropriate filter type by inferring its value type
 */
type ZodTypeToFilter<T> = ValueToFilter<InferredType<T>>;

// ============================================================
// Filter Group Types (Type-Level)
// ============================================================

/**
 * Creates a filter group type from a Zod shape.
 * Each field becomes an optional filter with the appropriate type.
 * Includes recursive and/or for nested filter groups.
 */
type FilterGroupFromShape<T extends z.core.$ZodLooseShape> = {
  [K in keyof T]?: ZodTypeToFilter<T[K]>;
} & {
  and?: FilterGroupFromShape<T>[];
  or?: FilterGroupFromShape<T>[];
};

/**
 * Top-level filters type - must start with either 'and' or 'or'
 */
type FiltersFromShape<T extends z.core.$ZodLooseShape> =
  | { and: FilterGroupFromShape<T>[] }
  | { or: FilterGroupFromShape<T>[] };

// ============================================================
// Runtime Utilities for Zod Schema Detection
// ============================================================

type FieldType = "string" | "number" | "boolean" | "date" | "enum" | "literal";

/**
 * Unwrap nullable, optional, and default wrappers at runtime
 */
function unwrapZodSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  // Check for nullable
  if ("unwrap" in schema && typeof schema.unwrap === "function") {
    const def = (schema as any)._zod?.def;
    if (def?.type === "nullable" || def?.type === "optional") {
      return unwrapZodSchema(schema.unwrap());
    }
  }

  // Check for default
  const def = (schema as any)._zod?.def;
  if (def?.type === "default" && def?.innerType) {
    return unwrapZodSchema(def.innerType);
  }

  return schema;
}

/**
 * Detect the field type from a Zod schema at runtime
 */
function detectFieldType(schema: z.ZodTypeAny): { type: FieldType; meta?: any } | null {
  const unwrapped = unwrapZodSchema(schema);
  const def = (unwrapped as any)._zod?.def;

  if (!def) return null;

  switch (def.type) {
    case "enum":
      return { type: "enum", meta: { values: def.entries } };
    case "literal":
      return { type: "literal", meta: { value: def.value } };
    case "string":
      return { type: "string" };
    case "number":
      return { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "date":
      return { type: "date" };
    default:
      return null;
  }
}

// ============================================================
// Runtime Filter Schema Generators
// ============================================================

const stringNoValueOperators = z.enum(["isEmpty", "isNotEmpty"]);
const numberArrayOperators = z.enum(["in", "nin"]);
const numberNoValueOperators = z.enum(["isExists", "isNotExists"]);
const booleanNoValueOperators = z.enum(["isExists", "isNotExists"]);
const dateArrayOperators = z.enum(["in", "nin"]);
const dateNoValueOperators = z.enum(["isExists", "isNotExists"]);
const enumOperators = z.enum(["eq", "ne"]);
const enumArrayOperators = z.enum(["in", "nin"]);

/**
 * Create a filter schema for a string field
 */
function createStringFilterSchema() {
  return z.union([
    z.object({
      operator: z.enum(["eq", "ne", "contains", "notContains"]),
      value: z.string(),
    }),
    z.object({
      operator: z.enum(["in", "nin"]),
      value: z.array(z.string()),
    }),
    z.object({
      operator: stringNoValueOperators,
    }),
  ]);
}

/**
 * Create a filter schema for a number field
 */
function createNumberFilterSchema() {
  return z.union([
    z.object({
      operator: z.enum(["eq", "ne", "gt", "gte", "lt", "lte"]),
      value: z.number(),
    }),
    z.object({
      operator: numberArrayOperators,
      value: z.array(z.number()),
    }),
    z.object({
      operator: numberNoValueOperators,
    }),
  ]);
}

/**
 * Create a filter schema for a boolean field
 */
function createBooleanFilterSchema() {
  return z.union([
    z.object({
      operator: z.enum(["eq", "ne"]),
      value: z.boolean(),
    }),
    z.object({
      operator: booleanNoValueOperators,
    }),
  ]);
}

/**
 * Create a filter schema for a date field
 */
function createDateFilterSchema() {
  return z.union([
    z.object({
      operator: z.enum(["eq", "ne", "gt", "gte", "lt", "lte"]),
      value: z.date(),
    }),
    z.object({
      operator: dateArrayOperators,
      value: z.array(z.date()),
    }),
    z.object({
      operator: dateNoValueOperators,
    }),
  ]);
}

/**
 * Create a filter schema for an enum field
 * The value is restricted to the enum options
 */
function createEnumFilterSchema<T extends [string, ...string[]]>(enumValues: T) {
  const enumSchema = z.enum(enumValues);
  return z.union([
    z.object({
      operator: enumOperators,
      value: enumSchema,
    }),
    z.object({
      operator: enumArrayOperators,
      value: z.array(enumSchema),
    }),
  ]);
}

/**
 * Create a filter schema for a literal field
 * Treats the literal value as a single-option enum
 */
function createLiteralFilterSchema<T extends string>(literalValue: T) {
  const literalSchema = z.literal(literalValue);
  return z.union([
    z.object({
      operator: enumOperators,
      value: literalSchema,
    }),
    z.object({
      operator: enumArrayOperators,
      value: z.array(literalSchema),
    }),
  ]);
}

/**
 * Create a filter schema for a given Zod schema
 */
function createFilterSchemaForZodType(schema: z.ZodTypeAny): z.ZodTypeAny | null {
  const detected = detectFieldType(schema);

  if (!detected) return null;

  switch (detected.type) {
    case "string":
      return createStringFilterSchema();
    case "number":
      return createNumberFilterSchema();
    case "boolean":
      return createBooleanFilterSchema();
    case "date":
      return createDateFilterSchema();
    case "enum":
      if (detected.meta?.values) {
        const values = Object.values(detected.meta.values) as [string, ...string[]];
        return createEnumFilterSchema(values);
      }
      return null;
    case "literal":
      if (typeof detected.meta?.value === "string") {
        return createLiteralFilterSchema(detected.meta.value);
      }
      return null;
    default:
      return null;
  }
}

// ============================================================
// Main API: createFiltersFromSchema
// ============================================================

/**
 * Creates filter schema entries from a Zod object shape.
 * Use this with the spread operator to add schema-derived filters to a filter group.
 *
 * @example
 * const filterGroupSchema = z.object({
 *   ...createFiltersFromSchema(child1.pick({ name: true, age: true }).shape),
 *   // Add custom filters
 *   entityId: createStringFilterSchema(),
 * });
 */
export function createFiltersFromSchema<T extends z.core.$ZodLooseShape>(
  shape: T
): { [K in keyof T]: z.ZodOptional<z.ZodTypeAny> } {
  const result: Record<string, z.ZodOptional<z.ZodTypeAny>> = {};

  for (const [key, schema] of Object.entries(shape)) {
    const filterSchema = createFilterSchemaForZodType(schema as z.ZodTypeAny);
    if (filterSchema) {
      result[key] = filterSchema.optional();
    }
  }

  return result as { [K in keyof T]: z.ZodOptional<z.ZodTypeAny> };
}

/**
 * Creates a complete filter group schema with and/or support from a Zod object shape.
 * Returns the Zod schema with proper TypeScript type inference.
 *
 * @example
 * const filterGroupSchema = createFilterGroupSchema(
 *   child1.pick({ name: true, age: true, type: true }).shape
 * );
 */
export function createFilterGroupSchema<T extends z.core.$ZodLooseShape>(shape: T) {
  type FilterGroup = FilterGroupFromShape<T>;

  const filterFields = createFiltersFromSchema(shape);

  // Create the filter group schema with recursive and/or
  const filterGroupSchema: z.ZodType<FilterGroup> = z.lazy(() =>
    z.object({
      ...filterFields,
      and: z.array(filterGroupSchema).optional(),
      or: z.array(filterGroupSchema).optional(),
    })
  ) as z.ZodType<FilterGroup>;

  return filterGroupSchema;
}

/**
 * Creates a complete filters schema (top-level with and/or) from a Zod object shape.
 *
 * @example
 * const filtersSchema = createFiltersSchema(
 *   child1.pick({ name: true, age: true, type: true }).shape
 * );
 * type Filters = z.infer<typeof filtersSchema>;
 */
export function createFiltersSchema<T extends z.core.$ZodLooseShape>(shape: T) {
  // type Filters = 

  const filterGroupSchema = createFilterGroupSchema(shape);

  const filtersSchema: z.ZodType<FiltersFromShape<T>> = z.union([
    z.object({ and: z.array(filterGroupSchema) }),
    z.object({ or: z.array(filterGroupSchema) }),
  ])

  return filtersSchema;
}

// ============================================================
// Default Filter Schema (for backward compatibility)
// ============================================================

// Define the shape for default filters
const defaultFilterShape = {
  ...child1.pick({ name: true, description: true, age: true, verified: true }).shape,
  entityId: z.string().uuid(),
  stepId: z.string().uuid(),
  lastLogin: z.date(),
  heightCm: z.number(),
  entityType: z.enum(childrenTypes),
};

// Create the filter group schema
export const filterGroupSchema = createFilterGroupSchema(defaultFilterShape);

// Create the top-level filters schema
export const filtersSchema = createFiltersSchema(defaultFilterShape);

// Export types
export type FilterGroup = z.infer<typeof filterGroupSchema>;
export type Filters = z.infer<typeof filtersSchema>;

// Re-export utilities for custom filter creation
export {
  createStringFilterSchema,
  createNumberFilterSchema,
  createBooleanFilterSchema,
  createDateFilterSchema,
  createEnumFilterSchema,
  createLiteralFilterSchema,
};

// Export type utilities for use in other modules
export type { FilterGroupFromShape, FiltersFromShape, ZodTypeToFilter };

// ============================================================
// Legacy Types (for backward compatibility with utils.ts)
// ============================================================

/**
 * Union of all possible filter operators
 */
export type FilterOperators =
  | "eq"
  | "ne"
  | "contains"
  | "notContains"
  | "isEmpty"
  | "isNotEmpty"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "nin"
  | "isExists"
  | "isNotExists";

/**
 * Generic filter type for a single field
 * Used in utils.ts for building SQL conditions
 * Discriminated union that preserves operator-specific value types
 */
export type Filter =
  | { operator: "eq" | "ne"; value: string | number | boolean | Date }
  | { operator: "contains" | "notContains"; value: string }
  | { operator: "gt" | "gte" | "lt" | "lte"; value: number | Date }
  | { operator: "in" | "nin"; value: (string | number | boolean | Date)[] }
  | { operator: "isEmpty" | "isNotEmpty" | "isExists" | "isNotExists"; value?: undefined }
  | undefined;
