import { queryOrders } from "./scripts/singleinhritance/query.js";
import * as schemas from "./scripts/singleinhritance/schema.js";
import { stepIds } from "./scripts/singleinhritance/utils.js";
import { getDb } from "./utils/db.js";

const db = getDb<typeof schemas>(schemas);

const result = await queryOrders({
  db,
  stepIds,
  limit: 10000,
  filters: {
    and: [
      { entityType: { operator: "eq", value: "child_3" } },
      {
        or: [
          { description: { operator: "eq", value: "test" } },
          { age: { operator: "eq", value: 20 } },
        ],
      },
    ],
  },
});
