import { benchmark } from "../../utils/benchmark.js";
import { getDb } from "../../utils/db.js";
import * as schemas from "./schema.js";
import { runBenchmarkSuite } from "../../utils/testSuite.js";
import { stepIds } from "./utils.js";
import { queryOrders } from "./query.js";
import { Filters } from "./zodSchema.js";
import { seedHistoryAndChildren } from "./seed.js";

const run = async () => {
  const db = getDb<typeof schemas>(schemas);
  // await seedHistoryAndChildren(10_000_000, db, 10_000);
  await benchmark(
    "find all entities where stepId equals step1 from all childrens",
    db,
    async () => {
      const filters: Filters = {
        or: [
          {
            and: [
              {
                description: { value: "a", operator: "contains" },
                age: { value: 1000, operator: "gte" },
              },
            ],
          },
          {
            and: [
              {
                description: { value: "a", operator: "notContains" },
                heightCm: { value: 10, operator: "gte" },
              },
            ],
          },
          {
            stepId: {
              value: "019ae8a8-a58d-72be-8577-acfa4044d986",
              operator: "ne",
            },
          },
        ],
      };

      const result = await queryOrders({ db, stepIds, limit: 10000, filters });

      return result;
    },
    100
  );
};

await runBenchmarkSuite([run]);
