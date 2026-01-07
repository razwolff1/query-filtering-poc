import * as schemas from "./schema.js";
import {
  ChildrenTypesWithCore,
  TChildrenTypes,
} from "./types.js";
import { core, ZodDiscriminatedUnion, ZodObject } from "zod";
import { childSchema, Filter, FilterGroup, FilterOperators, Filters, filtersSchema, TChildSchema } from "./zodSchema.js";
import {
  and,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  not,
  notIlike,
  notInArray,
  or,
  sql,
  SQL,
  WithSubquery,
} from "drizzle-orm";
import { PgTableWithColumns, WithSubqueryWithSelection } from "drizzle-orm/pg-core";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

// TODO: restrict recursive depth

export const childrenTypesToTables = {
  child_1: schemas.child1,
  child_2: schemas.child2,
  child_3: schemas.child3,
  child_4: schemas.child4,
  child_5: schemas.child5,
  child_6: schemas.child6,
  child_7: schemas.child7,
  child_8: schemas.child8,
  child_9: schemas.child9,
  child_10: schemas.child10,
}

const coreProperties = ['entityId', 'entityType', 'stepId'] as const
type CoreProperty = typeof coreProperties[number]

export const stepIds: string[] = [
  "019ae8a8-a58b-75ef-8672-6d87fa458cf6",
  "019ae8a8-a58d-72be-8577-a6f091fc024f",
  "019ae8a8-a58d-72be-8577-a9a1884aff9f",
  "019ae8a8-a58d-72be-8577-acfa4044d986",
  "019ae8a8-a58d-72be-8577-b38289e345ae",
];

export const typesPriority: TChildrenTypes[] = [
  "child_1",
  "child_2",
  "child_3",
  "child_4",
  "child_5",
  "child_6",
  "child_7",
  "child_8",
  "child_9",
  "child_10",
] as const;

const getSchemaByDiscriminatorValue = (
  schema: ZodDiscriminatedUnion,
  value: TChildrenTypes
): ZodObject => {
  for (const option of schema.options) {
    if (option instanceof ZodObject) {
      const discriminatorValue = option.shape[schema.def.discriminator].value;
      if (discriminatorValue === value) {
        return option;
      }
    } else if (option instanceof ZodDiscriminatedUnion) {
      const nestedSchema = getSchemaByDiscriminatorValue(option, value);
      if (nestedSchema) {
        return nestedSchema;
      }
    }
  }
  throw new Error(`Schema with discriminator value "${value}" not found.`);
};

export const generateFieldsToTypes = (types: TChildrenTypes[]) => {
  const typesToFields: Partial<Record<ChildrenTypesWithCore, string[] | readonly string[]>> = {};

  typesToFields['core'] = coreProperties

  types.forEach((type) => {
    const schema = getSchemaByDiscriminatorValue(childSchema, type);
    const fields = flattenSchema(schema, [
      "id",
      "type",
    ]);
    typesToFields[type] = fields;
  });

  const fieldsToTypes = Object.entries(typesToFields).reduce<
    Record<string, TChildrenTypes[]>
  >((acc, [type, fields]) => {
    fields.forEach((field) => {
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(type as TChildrenTypes);
    });
    return acc;
  }, {});

  return fieldsToTypes;
};

const flattenSchema = (
  schema: ZodObject | ZodDiscriminatedUnion,
  ignoreFields?: string[]
) => {
  const result: string[] = [];

  if (schema instanceof ZodDiscriminatedUnion) {
    childSchema.options.reduce<ZodDiscriminatedUnion["options"][0]>(
      (acc, curr) => {
        const newObject = { ...acc, ...flattenSchema(curr) };

        acc = newObject;

        return acc;
      },
      {} as ZodDiscriminatedUnion["options"][0]
    );
  } else {
    Object.entries(schema.shape).forEach(([fieldName, fieldValue]) => {
      // if(union)//todo
      if (fieldValue instanceof ZodDiscriminatedUnion) {
        childSchema.options.reduce<ZodDiscriminatedUnion["options"][0]>(
          (acc, curr) => {
            const newObject = { ...acc, ...flattenSchema(curr) };

            acc = newObject;

            return acc;
          },
          {} as ZodDiscriminatedUnion["options"][0]
        );
      } else {
        if (!ignoreFields || !ignoreFields.includes(fieldName)) {
          result.push(fieldName);
        }
      }
    });
  }

  return result;
};

type Table = PgTableWithColumns<any> | WithSubqueryWithSelection<any, any>
type FilterBuilder = (
  table: Table,
  column: string,
  value?: any
) => SQL | undefined;

const filterBuilders: Record<
  FilterOperators,
  FilterBuilder
> = {
  ne: (table, column, value) => {
    return ne(table[column], value);
  },
  contains: (table, column, value) => {
    return ilike(table[column], `%${value}%`);
  },
  notContains: (table, column, value) => {
    return notIlike(table[column], `%${value}%`);
  },
  isEmpty: (table, column) => {
    return or(isNull(table[column]), eq(table[column], ""));
  },
  isNotEmpty: (table, column) => {
    return and(not(isNull(table[column])), not(eq(table[column], "")));
  },
  eq: (table, column, value) => {
    return eq(table[column], value);
  },
  gt: (table, column, value) => {
    return gt(table[column], value);
  },
  lt: (table, column, value) => {
    return lt(table[column], value);
  },
  gte: (table, column, value) => {
    return gte(table[column], value);
  },
  lte: (table, column, value) => {
    return lte(table[column], value);
  },
  in: (table, column, value) => {
    return inArray(table[column], value)
  },
  nin: (table, column, value) => {
    return notInArray(table[column], value)
  },
  isExists: (table, column) => {
    return isNotNull(table[column]);
  },
  isNotExists: (table, column) => {
    return isNull(table[column]);
  },
};

const isFieldPartOfTable = (table: Table, field: string) => {
  if(table instanceof WithSubquery){
    return field in table._.selectedFields
  }

  return field in table
}

const buildFieldCondition = (
  table: Table,
  field: string,
  filter: Filter
) => {
  if(!filter) return undefined
  
  const builder = filterBuilders[filter.operator];

  if (!builder || !isFieldPartOfTable(table, field)) return undefined;

  return builder(table, field, filter.value);
};

const buildFilterGroupCondition = (
  group: FilterGroup,
  table: Table,
  coreTable: Table,
  parentKey: 'and' | 'or'
): SQL | undefined => {
  const conditions: (SQL | undefined)[] = [];

  for (const [key, filter] of Object.entries(group)) {
    if (key === "and" || key === "or") continue;
    if (!filter || Array.isArray(filter)) continue;

    let tableToFilter = table
    if(coreProperties.includes(key as CoreProperty)){
      tableToFilter = coreTable
    }

    const condition = buildFieldCondition(
      tableToFilter,
      key,
      filter
    );

    conditions.push(condition);
  }

  if (group.and) {
    const nested = group.and
      .map((groupFilter) => buildFilterGroupCondition(groupFilter, table, coreTable, 'and'))

    const condition = nested.length ? and(...nested) :  undefined

    if (condition) {
      conditions.push(condition);
    }
  }

  if (group.or) {
    const nested = group.or
      .map((groupFilter) => buildFilterGroupCondition(groupFilter, table, coreTable, 'or'))

    const condition = nested.length ? or(...nested) :  undefined
    if (condition) {
      conditions.push(condition);
    }
  }

  if (!conditions.length) {
    return undefined;
  }

  if(parentKey === 'and' && conditions.some(filter => typeof filter === 'undefined')) return undefined

  return conditions.length === 1
    ? conditions[0]
    : and(...conditions);
};



const buildWhereFromFilters = (
  filters: Filters | undefined,
  table: Table,
  coreTable: Table
): SQL | undefined => {
  if (!filters) return undefined;

  if ("and" in filters) {
    const conditions = filters.and
      .map((group) => buildFilterGroupCondition(group, table, coreTable, 'and'))

    return conditions.length && conditions.every(condition => typeof condition !== 'undefined') ? and(...conditions) : undefined;
  }

  if ("or" in filters) {
    const conditions = filters.or
      .map((group) => buildFilterGroupCondition(group, table, coreTable, 'or'))

    return conditions.length && conditions.some(condition => typeof condition !== 'undefined') ? or(...conditions) : undefined;
  }

  return undefined;
};


type WhereConditions = Partial<{
  [K in keyof typeof childrenTypesToTables]: SQL | undefined
}>

export const buildFilters = (filters: Filters | undefined, types: TChildrenTypes[], coreTable: Table) => {
  const whereConditions: WhereConditions = {}

  if(!filters) return {}

  for(const type of types){
    const typeTable = childrenTypesToTables[type]
      whereConditions[type] = buildWhereFromFilters(filters, typeTable, coreTable)
  }

  return whereConditions
}

type CoreConstraint = {
  include?: Set<any>;
  exclude?: Set<any>;
};

type CoreConstraints = Partial<Record<typeof coreProperties[number], CoreConstraint>>;


const mergeAnd = (a?: CoreConstraint, b?: CoreConstraint): CoreConstraint | undefined => {
  if (!a) return b;
  if (!b) return a;

  const include =
    a.include && b.include
      ? new Set([...a.include].filter((v) => b.include!.has(v)))
      : a.include ?? b.include;

  const exclude = new Set([...(a.exclude ?? []), ...(b.exclude ?? [])]);

  return { include, exclude };
};

const mergeOr = (a?: CoreConstraint, b?: CoreConstraint): CoreConstraint | undefined => {
  if (!a || !b) return undefined;

  const include =
    a.include && b.include
      ? new Set([...a.include, ...b.include])
      : undefined;

  const exclude =
    a.exclude && b.exclude
      ? new Set([...a.exclude].filter((v) => b.exclude!.has(v)))
      : undefined;

  return { include, exclude };
};


const extractFromField = (filter: Filter): CoreConstraint | undefined => {
  switch (filter?.operator) {
    case "eq":
      return { include: new Set([filter.value]) };

    case "in":
      return { include: new Set(filter.value) };

    case "ne":
      return { exclude: new Set([filter.value]) };

    case "nin":
      return { exclude: new Set(filter.value) };

    default:
      return undefined;
  }
};


const extractCoreFromGroup = (
  group: FilterGroup,
): CoreConstraints | undefined => {
  let result: CoreConstraints = {};

  for (const [key, value] of Object.entries(group)) {
    if (key === "and" || key === "or") continue;
    if (!value || Array.isArray(value)) continue;
    if (!coreProperties.includes(key as CoreProperty)) continue;

    const coreKey = key as CoreProperty

    const constraint = extractFromField(value);
    if (!constraint) return undefined;

    const merged = mergeAnd(result[coreKey], constraint)

    if(merged){
      result[coreKey] = merged
    }
  }

  if (group.and) {
    for (const g of group.and) {
      const nested = extractCoreFromGroup(g);
      if (!nested) return undefined;

      for (const key of Object.keys(nested)) {
          const coreKey = key as CoreProperty

        const merged = mergeAnd(result[coreKey], nested[coreKey]);
        if(merged){
          result[coreKey] = merged
        }
      }
    }
  }

  if (group.or) {
    let orResult: CoreConstraints | undefined;

    for (const g of group.or) {
      const nested = extractCoreFromGroup(g);
      if (!nested) continue;
      
      if (!orResult) {
        orResult = nested;
      } else {
        for (const key of Object.keys(orResult)) {
          const coreKey = key as CoreProperty

          const merged = mergeOr(orResult[coreKey], nested[coreKey]);
          if(merged){
            orResult[coreKey] = merged
          }
        }
      }
    }

    if (!orResult) return undefined;
    result = orResult;
  }

  return result;
};


export const extractCoreFilters = (
  filters: Filters | undefined,
): CoreConstraints => {
  let constraints: CoreConstraints | undefined;

  if(!filters) return {}

  if ("and" in filters) {
    constraints = {};
    for (const g of filters.and) {
      const res = extractCoreFromGroup(g);
      if (!res) return {};

      for (const key of Object.keys(res)) {
        const coreKey = key as CoreProperty

        const merged = mergeAnd(constraints[coreKey], res[coreKey]);
        if(merged)
        constraints[coreKey] = merged
      }
    }
  }

  if ("or" in filters) {
    for (const g of filters.or) {
      const res = extractCoreFromGroup(g);
      if (!res) continue;

      constraints = constraints
        ? Object.fromEntries(
            Object.entries(constraints).map(([key, constraint]) => {
              const coreKey = key as CoreProperty

              const merged = mergeOr(constraint, res[coreKey])
              
              if(!merged) return [coreKey, {}]

              return [
              coreKey,
              merged
            ]
            })
          )
        : res;
    }
  }

  if (!constraints) return {};

  return constraints
};

export const computeAppliedCoreFilter = <T>(constraint: CoreConstraint, array: T[]) => {
  const {include, exclude} = constraint
  if(include?.size && !exclude?.size){
    return array.filter(element => include.has(element))
  }

  if(!include?.size && exclude?.size){
    return array.filter(element => !exclude?.has(element))
  }

  return array
}

export const getRelevantTypes = (types: TChildrenTypes[], whereConditions: WhereConditions, filters?: Filters) => {
  if(Object.values(whereConditions).every(condition => typeof condition === 'undefined')){
    return filters && Object.keys(filters).length ? [] : types
  }

  return types.filter(type => typeof whereConditions[type] !== 'undefined')
}

export const getBaseQuery = async (db: NodePgDatabase<typeof schemas>, stepIds: string[], filterEntityTypes?: CoreConstraint, lastId?: string) => {

    const orderHistory = await db
      .selectDistinct({ type: schemas.stepsToTypes.type })
      .from(schemas.stepsToTypes)
      .where(inArray(schemas.stepsToTypes.stepId, stepIds));
  
    const permittedTypes = orderHistory.map((r) => r.type);
    const appliedTypes = filterEntityTypes
      ? computeAppliedCoreFilter(filterEntityTypes, permittedTypes)
      : permittedTypes;
  
    const orderedPermittedTypes = appliedTypes.sort(
      (a, b) => typesPriority.indexOf(a) - typesPriority.indexOf(b)
    );
  
    if (orderedPermittedTypes.length === 0) return {types: [], baseQuery: undefined};
  
    const baseQuery = db.$with("ordered_history").as(
      db
        .select()
        .from(schemas.historySchema)
        .where(
          and(
            lastId ? gt(schemas.historySchema.id, lastId) : sql`TRUE`,
            inArray(schemas.historySchema.stepId, stepIds)
          )
        )
        .orderBy(schemas.historySchema.id)
    );

    return {types: orderedPermittedTypes, baseQuery}
}

export const getQuery = (db: NodePgDatabase<typeof schemas>, baseQuery: WithSubqueryWithSelection<any, any>, types: TChildrenTypes[], filters?: Filters) => {
  const whereConditions = buildFilters(
    filters,
    types,
    baseQuery
  );
  const relevantTypes = getRelevantTypes(types, whereConditions, filters);
  if (!relevantTypes.length) return undefined;

  const dataCase = sql<TChildSchema>`
  CASE
    ${sql.join(
      relevantTypes.map((type) => {
        const table = childrenTypesToTables[type];
        return sql`
          WHEN ${baseQuery.entityType} = ${type}
          THEN to_json(${table}.*)
        `;
      }),
      sql` `
    )}
  END
`;

  let query = db
    .with(baseQuery)
    .select({
      stepId: baseQuery.stepId,
      entityType: baseQuery.entityType,
      relevanceStart: baseQuery.relevanceStart,
      relevanceEnd: baseQuery.relevanceEnd,
      data: dataCase,
    })
    .from(baseQuery)
    .$dynamic();

  for (const type of relevantTypes) {
    const table = childrenTypesToTables[type];

    query = query.leftJoin(
      table,
      and(
        eq(table.id, baseQuery.entityId),
        eq(baseQuery.entityType, type),
        whereConditions[type] ?? sql`TRUE`
      )
    );
  }

  query = query.where(
    or(
      ...relevantTypes.map((type) => {
        const table = childrenTypesToTables[type];
        return isNotNull(table.id);
      })
    )
  );

  return query
}
