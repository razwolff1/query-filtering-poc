import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { varchar } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';

const pool = new Pool({connectionString: process.env.DB_URL})

export const getDb = <T extends Record<string, unknown>>(schema: any) =>  drizzle<T>(pool, {schema })

export const WithIdPk = {
  id: varchar('id')
    .primaryKey()
    .default(sql.raw(`gen_random_uuid()`))
}