import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  child1,
  child2,
  child3,
  child4,
  child5,
  child6,
  child7,
  child8,
  child9,
  child10,
  Child1Create,
  Child2Create,
  Child3Create,
  Child4Create,
  Child5Create,
  Child6Create,
  Child7Create,
  Child8Create,
  Child9Create,
  Child10Create,
  CreateHistorySchema,
  historySchema,
} from "./schema.js";
import { addMilliseconds, differenceInMilliseconds } from "date-fns";
import { chunk, mapValues } from "remeda";
import { stepIds } from "./utils.js";

export function calculateMaxInsertBatchSize(data: any[]) {
  const MAX_PARAMETERS = Math.pow(2, 16) - 2;

  if (data.length === 0) return 0;

  const parametersPerRecord = Object.keys(data[0]).length;

  const maxRecords = Math.floor(MAX_PARAMETERS / parametersPerRecord);

  return Math.min(data.length, maxRecords);
}

const randomInt = (min: number, max: number) =>
  Math.round(Math.floor(Math.random() * (max - min + 1)) + min);
const randomBool = () => Math.random() < 0.5;
const randomText = (len: number) =>
  Math.random()
    .toString(36)
    .substring(2, 2 + len);
const randomDate = (start: Date, end: Date) => {
  const diff = differenceInMilliseconds(end, start);
  const offset = Math.random() * diff;
  return addMilliseconds(start, offset);
};

const buildEssential = () => ({
  name: randomText(10),
  description: randomText(20),
});

const childrens = [
  {
    table: child1,
    type: "child_1",
    build: () =>
      ({
        ...buildEssential(),
        nickname: randomBool() ? randomText(20) : null,
        age: randomInt(150, 200),
        score: String(randomInt(1, 5)),
        verified: randomBool(),
      } as Child1Create),
  },
  {
    table: child2,
    type: "child_2",
    build: () =>
      ({
        ...buildEssential(),
        bio: randomBool() ? randomText(20) : null,
        heightCm: String(randomInt(150, 200)),
        weightKg: randomBool() ? String(randomInt(50, 120)) : null,
        registeredAt: randomDate(new Date(2020, 0, 1), new Date()),
      } as Child2Create),
  },
  {
    table: child3,
    type: "child_3",
    build: () =>
      ({
        ...buildEssential(),
        title: `Title ${randomInt(1, 100)}`,
        summary: randomBool() ? randomText(15) : null,
        activeFlag: randomBool(),
        points: randomBool() ? randomInt(0, 100) : null,
      } as Child3Create),
  },
  {
    table: child4,
    type: "child_4",
    build: () =>
      ({
        ...buildEssential(),
        meta: randomBool() ? JSON.stringify({ key: randomText(5) }) : null,
        rating: randomBool() ? String(randomInt(1, 5)) : null,
        completed: randomBool(),
      } as Child4Create),
  },
  {
    table: child5,
    type: "child_5",
    build: () =>
      ({
        ...buildEssential(),
        startDate: randomDate(new Date(2020, 0, 1), new Date()),
        endDate: randomBool()
          ? randomDate(new Date(2020, 0, 1), new Date())
          : null,
        active: randomBool() ? randomBool() : null,
      } as Child5Create),
  },
  {
    table: child6,
    type: "child_6",
    build: () =>
      ({
        ...buildEssential(),
        code: `CODE-${randomInt(1, 100)}`,
        value: String(randomInt(10, 1000)),
        flag: randomBool(),
      } as Child6Create),
  },
  {
    table: child7,
    type: "child_7",
    build: () =>
      ({
        ...buildEssential(),
        info: randomBool() ? randomText(10) : null,
        level: randomInt(1, 5),
        valid: randomBool() ? randomBool() : null,
      } as Child7Create),
  },
  {
    table: child8,
    type: "child_8",
    build: () =>
      ({
        ...buildEssential(),
        data: randomBool() ? randomText(12) : null,
        count: randomInt(1, 20),
        processed: randomBool(),
      } as Child8Create),
  },
  {
    table: child9,
    type: "child_9",
    build: () =>
      ({
        ...buildEssential(),
        comment: randomBool() ? randomText(15) : null,
        score: String(randomInt(1, 100)),
        active: randomBool() ? randomBool() : null,
      } as Child9Create),
  },
  {
    table: child10,
    type: "child_10",
    build: () =>
      ({
        ...buildEssential(),
        firstName: randomText(6),
        lastName: randomText(8),
        nickname: randomBool() ? randomText(5) : null,
        bio: randomBool() ? randomText(20) : null,
        address: randomText(15),
        city: randomText(6),
        country: randomText(6),
        email: `${randomText(5)}@example.com`,
        age: randomInt(18, 70),
        heightCm: String(randomInt(150, 200)),
        weightKg: randomBool() ? String(randomInt(50, 120)) : null,
        points: randomBool() ? randomInt(0, 100) : null,
        rating: randomBool() ? String(randomInt(1, 5)) : null,
        score: randomInt(50, 100) + String(Math.random()),
        active: randomBool(),
        verified: randomBool() ? randomBool() : null,
        completed: randomBool(),
        subscribed: randomBool() ? randomBool() : null,
        flag1: randomBool(),
        flag2: randomBool(),
        flag3: randomBool(),
        createdAt: randomDate(new Date(2020, 0, 1), new Date()),
        updatedAt: randomBool()
          ? randomDate(new Date(2020, 0, 1), new Date())
          : null,
        registeredAt: randomDate(new Date(2020, 0, 1), new Date()),
        lastLogin: randomBool()
          ? randomDate(new Date(2020, 0, 1), new Date())
          : null,
        code: `CODE-${randomText(5)}`,
        meta: randomBool() ? JSON.stringify({ key: randomText(5) }) : null,
        referenceId: randomBool() ? randomText(20) : null,
      } as Child10Create),
  },
] as const;

const stepCounters = Array(5).fill(0);

export const seedHistoryAndChildren = async <T extends Record<string, unknown>>(
  count: number,
  db: NodePgDatabase<T>,
  batchSize = 1000
) => {
  let childIdx = 0;

  for (let i = 0; i < count; i += batchSize) {
    const end = Math.min(i + batchSize, count);
    const size = end - i;

    const c = childrens[childIdx];

    if (c) {
      const records = Array.from({ length: size }, () => c.build());

      const maxBatch = calculateMaxInsertBatchSize(records);
      const chunks = chunk(records, maxBatch);

      const inserted: { id: string }[] = [];

      for (const part of chunks) {
        const rows = await db.insert(c.table).values(part).returning({
          id: c.table.id,
        });
        inserted.push(...rows);
      }

      const stepIndex =
        stepCounters.findIndex((x) => x < count / stepCounters.length) || 0;
      stepCounters[stepIndex] += size;

      const stepId = stepIds[stepIndex]

      if(!stepId) throw new Error('stepId cannot be undefined')

      const history: CreateHistorySchema[] = inserted.map((r) => ({
        entityId: r.id,
        entityType: c.type,
        stepId: stepId,
        relevanceStart: randomDate(new Date(2020, 0, 1), new Date()),
        relevanceEnd: randomDate(new Date(2024, 0, 1), new Date(2026, 0, 1)),
      }));

      await db.insert(historySchema).values(history);

      console.log(`Inserted ${c.type} rows: ${i}/${count}`);

      childIdx = (childIdx + 1) % childrens.length;
    }
  }
};
