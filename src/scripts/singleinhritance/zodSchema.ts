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
// Type-Level Filter Definitions
// ============================================================

/**
 * Filter type for a single value - infers value type from the schema
 */
type FilterForValue<T> =
  | { operator: "eq" | "ne"; value: T }
  | { operator: "in" | "nin"; value: T[] }
  | { operator: "gt" | "gte" | "lt" | "lte"; value: T }
  | { operator: "contains" | "notContains"; value: T }
  | { operator: "isEmpty" | "isNotEmpty" | "isExists" | "isNotExists" };

/**
 * Extract the non-nullable inferred type from a Zod schema
 */
type InferValue<T> = T extends z.ZodType<infer O> ? NonNullable<O> : never;

/**
 * Helper type for Zod object schemas
 */
type ZodObjectSchema = z.ZodObject<z.core.$ZodLooseShape>;

/**
 * Filter group type derived from a Zod object schema
 */
type FilterGroupFromSchema<T extends ZodObjectSchema> = {
  [K in keyof T["shape"]]?: FilterForValue<InferValue<T["shape"][K]>>;
} & {
  and?: FilterGroupFromSchema<T>[];
  or?: FilterGroupFromSchema<T>[];
};

/**
 * Top-level filters type - must start with 'and' or 'or'
 */
type FiltersFromSchema<T extends ZodObjectSchema> =
  | { and: FilterGroupFromSchema<T>[] }
  | { or: FilterGroupFromSchema<T>[] };

// ============================================================
// Runtime Filter Schema Creator
// ============================================================

/**
 * Create a filter schema from any value Zod schema.
 * The value type is automatically inferred from the schema.
 */
function createFilter<T extends z.ZodType>(valueSchema: T) {
  // Unwrap to base schema for value validation
  const baseSchema = unwrapSchema(valueSchema);

  return z
    .union([
      z.object({ operator: z.literal("eq"), value: baseSchema }),
      z.object({ operator: z.literal("ne"), value: baseSchema }),
      z.object({ operator: z.literal("in"), value: z.array(baseSchema) }),
      z.object({ operator: z.literal("nin"), value: z.array(baseSchema) }),
      z.object({ operator: z.literal("gt"), value: baseSchema }),
      z.object({ operator: z.literal("gte"), value: baseSchema }),
      z.object({ operator: z.literal("lt"), value: baseSchema }),
      z.object({ operator: z.literal("lte"), value: baseSchema }),
      z.object({ operator: z.literal("contains"), value: baseSchema }),
      z.object({ operator: z.literal("notContains"), value: baseSchema }),
      z.object({ operator: z.literal("isEmpty") }),
      z.object({ operator: z.literal("isNotEmpty") }),
      z.object({ operator: z.literal("isExists") }),
      z.object({ operator: z.literal("isNotExists") }),
    ])
    .optional();
}

/**
 * Unwrap nullable/optional/default wrappers to get base schema
 */
function unwrapSchema(schema: z.ZodType): z.ZodType {
  const def = (schema as any)._zod?.def;
  if (!def) return schema;

  if (def.type === "nullable" || def.type === "optional") {
    return unwrapSchema((schema as any).unwrap());
  }
  if (def.type === "default" && def.innerType) {
    return unwrapSchema(def.innerType);
  }
  return schema;
}

// ============================================================
// Main API
// ============================================================

/**
 * Creates a filters schema from a Zod object.
 * Use with .pick().extend() for clean field selection.
 *
 * @example
 * const filtersSchema = createFiltersSchema(
 *   child1.pick({ name: true, age: true }).extend({
 *     entityId: z.string().uuid(),
 *   })
 * );
 */
export function createFiltersSchema<T extends ZodObjectSchema>(schema: T) {
  const filterGroupSchema = createFilterGroupSchema(schema);

  return z.union([
    z.object({ and: z.array(filterGroupSchema) }),
    z.object({ or: z.array(filterGroupSchema) }),
  ]) as z.ZodType<FiltersFromSchema<T>>;
}

/**
 * Creates a filter group schema from a Zod object.
 * Includes recursive and/or support.
 */
export function createFilterGroupSchema<T extends ZodObjectSchema>(schema: T) {
  type FilterGroup = FilterGroupFromSchema<T>;

  // Create filter for each field in the schema
  const filterFields: Record<string, z.ZodType> = {};
  for (const [key, fieldSchema] of Object.entries(schema.shape)) {
    filterFields[key] = createFilter(fieldSchema as z.ZodType);
  }

  const filterGroupSchema = z.lazy(() =>
    z.object({
      ...filterFields,
      and: z.array(filterGroupSchema).optional(),
      or: z.array(filterGroupSchema).optional(),
    }),
  ) as z.ZodType<FilterGroup>;

  return filterGroupSchema;
}

// ============================================================
// Default Filter Schema
// ============================================================

const defaultFilterSchema = child1
  .pick({ name: true, description: true, age: true, verified: true })
  .extend({
    entityId: z.string().uuid(),
    stepId: z.string().uuid(),
    lastLogin: z.date(),
    heightCm: z.number(),
    entityType: z.enum(childrenTypes),
  });

export const filterGroupSchema = createFilterGroupSchema(defaultFilterSchema);
export const filtersSchema = createFiltersSchema(defaultFilterSchema);

export type FilterGroup = z.infer<typeof filterGroupSchema>;
export type Filters = z.infer<typeof filtersSchema>;

// ============================================================
// Legacy Types (for utils.ts compatibility)
// ============================================================

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

type FilterValue = string | number | boolean | Date;

export type Filter =
  | { operator: "eq" | "ne"; value: FilterValue }
  | { operator: "contains" | "notContains"; value: FilterValue }
  | { operator: "gt" | "gte" | "lt" | "lte"; value: FilterValue }
  | { operator: "in" | "nin"; value: FilterValue[] }
  | { operator: "isEmpty" | "isNotEmpty" | "isExists" | "isNotExists"; value?: undefined }
  | undefined;

// Export type utilities
export type { FilterGroupFromSchema, FiltersFromSchema };
