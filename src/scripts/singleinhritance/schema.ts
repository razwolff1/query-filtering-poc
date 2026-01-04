import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import { childrenTypes } from "./types.js";

const essentialFileds = {
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1024 }).notNull(),
};

export const child1 = pgTable(
  "single_child1",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    ...essentialFileds,
    age: integer("age").notNull(),
    nickname: text("nickname"), // nullable
    score: numeric("score").notNull(),
    verified: boolean("verified"), // nullable
  },
  (table) => [index().on(table.id)]
);

export const child2 = pgTable(
  "single_child2",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    ...essentialFileds,
    bio: text("bio"), // nullable
    heightCm: numeric("height_cm").notNull(),
    weightKg: numeric("weight_kg"),
    registeredAt: timestamp("registered_at").notNull(),
  },
  (table) => [index().on(table.id)]
);

// Repeat for child3 -> child10 with mixed nullable/not-null and types
export const child3 = pgTable(
  "single_child3",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    ...essentialFileds,
    title: text("title").notNull(),
    summary: text("summary"), // nullable
    activeFlag: boolean("active_flag").notNull(),
    points: integer("points"),
  },
  (table) => [index().on(table.id)]
);

export const child4 = pgTable(
  "single_child4",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    ...essentialFileds,
    meta: text("meta"), // nullable JSON string
    rating: numeric("rating"),
    completed: boolean("completed").notNull().default(false),
  },
  (table) => [index().on(table.id)]
);

export const child5 = pgTable(
  "single_child5",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    ...essentialFileds,
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"), // nullable
    active: boolean("active"),
  },
  (table) => [index().on(table.id)]
);

export const child6 = pgTable(
  "single_child6",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    ...essentialFileds,
    code: text("code").notNull(),
    value: numeric("value"),
    flag: boolean("flag").notNull(),
  },
  (table) => [index().on(table.id)]
);

export const child7 = pgTable(
  "single_child7",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    ...essentialFileds,
    info: text("info"),
    level: integer("level").notNull(),
    valid: boolean("valid"),
  },
  (table) => [index().on(table.id)]
);

export const child8 = pgTable(
  "single_child8",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    ...essentialFileds,
    data: text("data"),
    count: integer("count").notNull(),
    processed: boolean("processed").notNull(),
  },
  (table) => [index().on(table.id)]
);

export const child9 = pgTable(
  "single_child9",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    ...essentialFileds,
    comment: text("comment"),
    score: numeric("score").notNull(),
    active: boolean("active"),
  },
  (table) => [index().on(table.id)]
);

export const child10 = pgTable(
  "single_child10",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    ...essentialFileds,

    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    nickname: text("nickname"),
    bio: text("bio"),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),

    age: integer("age").notNull(),
    heightCm: numeric("height_cm").notNull(),
    weightKg: numeric("weight_kg"),
    points: integer("points"),
    rating: numeric("rating"),
    score: numeric("score").notNull(),

    // Boolean fields
    active: boolean("active").notNull().default(true),
    verified: boolean("verified"), // nullable
    completed: boolean("completed").notNull().default(false),
    subscribed: boolean("subscribed"),
    flag1: boolean("flag1"),
    flag2: boolean("flag2"),
    flag3: boolean("flag3"),

    // Date fields
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at"),
    registeredAt: timestamp("registered_at").notNull(),
    lastLogin: timestamp("last_login"),

    // Additional fields for complexity
    code: varchar("code", { length: 50 }).notNull(),
    meta: text("meta"), // JSON string nullable
    referenceId: varchar("reference_id"), // nullable
  },
  (table) => [index().on(table.id)]
);

export const historySchema = pgTable(
  "single_history",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    entityId: uuid("entity_id").notNull(),
    entityType: text("entity_type", { enum: childrenTypes }).notNull(),
    stepId: uuid("step_id").notNull(),
    relevanceStart: timestamp("relevance_start").notNull(),
    relevanceEnd: timestamp("relevance_end").notNull(),
  },
  (table) => [
    index("idx_history_stepid").on(table.stepId),
    index().on(table.stepId, table.entityType),
    index("idx_history_type").on(table.entityType, table.entityId),
    index("idx_history_entityId").on( table.stepId, table.entityType, table.entityId),
    index().on(table.id)

    // index("relevanceIndx").on(table.relevanceStart, table.relevanceEnd),
  ]
);

export const stepsToTypes = pgTable('steps_to_types', {
  stepId: uuid('step_id').notNull(),
  type: text('entity_type', { enum: childrenTypes }).notNull()
}, (table) => [
  index().on(table.stepId, table.type),
  primaryKey({ columns: [table.stepId, table.type ]})
]);

export type CreateHistorySchema = typeof historySchema.$inferInsert;

// Child 1
export type Child1Create = InferInsertModel<typeof child1>;
export type Child1Select = InferSelectModel<typeof child1>;

// Child 2
export type Child2Create = InferInsertModel<typeof child2>;
export type Child2Select = InferSelectModel<typeof child2>;

// Child 3
export type Child3Create = InferInsertModel<typeof child3>;
export type Child3Select = InferSelectModel<typeof child3>;

// Child 4
export type Child4Create = InferInsertModel<typeof child4>;
export type Child4Select = InferSelectModel<typeof child4>;

// Child 5
export type Child5Create = InferInsertModel<typeof child5>;
export type Child5Select = InferSelectModel<typeof child5>;

// Child 6
export type Child6Create = InferInsertModel<typeof child6>;
export type Child6Select = InferSelectModel<typeof child6>;

// Child 7
export type Child7Create = InferInsertModel<typeof child7>;
export type Child7Select = InferSelectModel<typeof child7>;

// Child 8
export type Child8Create = InferInsertModel<typeof child8>;
export type Child8Select = InferSelectModel<typeof child8>;

// Child 9
export type Child9Create = InferInsertModel<typeof child9>;
export type Child9Select = InferSelectModel<typeof child9>;

// Child 10
export type Child10Create = InferInsertModel<typeof child10>;
export type Child10Select = InferSelectModel<typeof child10>;
