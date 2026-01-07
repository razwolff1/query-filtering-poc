import { performance } from "perf_hooks";
import { sql } from "drizzle-orm";
import { exec } from "child_process";
import { appendFileSync } from "fs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { getFileName } from "./testSuite.js";

const measure = async (name: string, queryFn: () => Promise<any>) => {
  const start = performance.now();
  
  try {
    const result = await queryFn();
    const end = performance.now();

    return {
      name,
      time: (end - start) / 1000,
      rows: Array.isArray(result) ? result.length : 1,
      success: true
    };
  } catch (err) {
    const end = performance.now();
    return {
      name,
      time: (end - start) / 1000,
      error:  err,
      success: false
    };
  }
}

const runTest = async (label: string, iterations: number, fn:() => Promise<any>) => {
  let times: number[] = [];
  let failed: number = 0

  for (let i = 0; i < iterations; i++) {
    const result = await measure(label, fn);
    if (result.success) times.push(result.time);
    else failed += 1
  }

  times.sort((a,b) => a-b);

  return {
    label,
    avg: times.reduce((a,b)=>a+b) / times.length,
    min: times[0],
    max: times[times.length-1],
    count: times.length,
    failed
  };
}

const getDockerStats = () => {
  return new Promise((resolve) => {
    exec(`docker stats ${process.env.CONTAINER_NAME} --no-stream --format "{{json .}}"`, (err, out) => {
      resolve(JSON.parse(out));
    });
  });
}

export const benchmark = async <T extends Record<string, unknown>>(name: string, db: NodePgDatabase<T>,testFn: () => Promise<any>, iterations: number = 1) => {
  console.log(`Running benchmark for: ${name}`);

  const perf = await runTest(name, iterations, testFn);

  const pgStats = await db.execute(sql`
    SELECT sum(blks_hit)*100/sum(blks_read+blks_hit) AS hit_ratio
    FROM pg_stat_database;
  `);

  const docker = await getDockerStats();

  const results = {
    perf,
    postgres: pgStats,
    docker
  }

  const resultsFile = getFileName()
  
  appendFileSync(`outputs/${resultsFile}`, `${name}: ${JSON.stringify(results, null, 2)}\n`);

  return results
}

