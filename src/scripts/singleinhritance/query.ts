import * as schemas from "./schema.js";
import { computeAppliedCoreFilter, extractCoreFilters, getBaseQuery, getQuery } from "./utils.js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { childSchema, Filters } from "./zodSchema.js";

interface QueryOrdersParams {
  db: NodePgDatabase<typeof schemas>;
  stepIds: string[];
  limit?: number;
  lastId?: string;
  filters?: Filters;
}

export const queryOrders = async ({
  db,
  stepIds,
  limit = 1000,
  lastId,
  filters,
}: QueryOrdersParams) => {
  const {
    stepId: filterStepIds,
    entityType: filterEntityTypes,
    entityId: filterEntityIds,
  } = extractCoreFilters(filters);

  const appliedStepIds = filterStepIds ? computeAppliedCoreFilter(filterStepIds, stepIds) : stepIds;

  const { baseQuery, types } = await getBaseQuery(db, appliedStepIds, filterEntityTypes, lastId);

  if (!baseQuery || !types.length) return [];

  const query = getQuery(db, baseQuery, types, filters);

  if (!query) return [];

  const computedLimit = filterEntityIds?.include?.size ?? limit;

  const results = await query.limit(computedLimit).execute();

  return results.map((r) => ({
    ...r,
    data: childSchema.parse({ ...r.data, type: r.entityType }),
  }));
};
