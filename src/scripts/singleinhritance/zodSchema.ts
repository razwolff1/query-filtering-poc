import { createSelectSchema } from "drizzle-zod";
import { boolean, z } from "zod";
import { historySchema } from "./schema.js";
import { childrenTypes } from "./types.js";
import { childrenTypesToTables } from "./utils.js";

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

const multiChildSchema = z.discriminatedUnion("subType", [
  child7,
  child8,
  child9,
  child10,
]);

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

type FieldType = "string" | "date" | "number" | "uuid" | "boolean" | "entityType";

const fieldSchemaByType = {
  string: z.string(),
  date: z.date(),
  number: z.number(),
  uuid: z.uuidv7(),
  boolean: z.boolean(),
  entityType: z.enum(childrenTypes)
} as const;

const possibleOperatorsByFieldType = {
  string: z.enum(["eq", "ne", "contains", "notContains", "isEmpty", "isNotEmpty"]),
  number: z.enum(["eq", "ne", "gt", "gte", "lt", "lte", "isExists", "isNotExists"]),
  date: z.enum(["eq", "ne", "gt", "gte", "lt", "lte", "isExists", "isNotExists"]),
  uuid: z.enum(["eq", "ne", "isExists", "isNotExists"]),
  boolean: z.enum(["eq", "ne", "isExists", "isNotExists"]),
  entityType: z.enum(["eq", "ne"]),
} as const;

const arrayOperatorsSchema = z.enum(["in", "nin"]);

type FieldOperator =
  z.infer<
    (typeof possibleOperatorsByFieldType)[keyof typeof possibleOperatorsByFieldType]
  >;

type ArrayOperator = z.infer<typeof arrayOperatorsSchema>;

export type FilterOperators = FieldOperator | ArrayOperator;

const getFilterSchema = (fieldType: FieldType) => {
  let fieldSchema = fieldSchemaByType[fieldType];
  const possibleOperators = possibleOperatorsByFieldType[fieldType];

  const arraySchema = z.object({
    value: z.array(fieldSchema),
    operator: arrayOperatorsSchema,
  });

  const singleValueSchema = z.object({
    value: fieldSchema.optional(),
    operator: possibleOperators,
  });

  return z
    .discriminatedUnion("operator", [arraySchema, singleValueSchema])
    .optional();
};

export type Filter = z.infer<ReturnType<typeof getFilterSchema>>

const filterGroupSchema = z.object({
  get and() {
    return z.array(filterGroupSchema).optional();
  },
  get or() {
    return z.array(filterGroupSchema).optional();
  },
  entityId: getFilterSchema("uuid"),
  name: getFilterSchema("string"),
  description: getFilterSchema("string"),
  age: getFilterSchema('number'),
  verified: getFilterSchema('boolean'),
  lastLogin: getFilterSchema('date'),
  stepId: getFilterSchema('uuid'),
  heightCm: getFilterSchema('number'),
  nonExist: getFilterSchema('number')
});

export const filtersSchema = z.union([
  z.object({ and: z.array(filterGroupSchema) }),
  z.object({ or: z.array(filterGroupSchema) }),
]);

export type FilterGroup = z.infer<typeof filterGroupSchema>
export type Filters = z.infer<typeof filtersSchema>