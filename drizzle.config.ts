import 'dotenv/config'
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'postgresql',
  schema: './dist/scripts/singleinhritance/schema.js',
  dbCredentials: {
    url: process.env.DB_URL || ''
  }
})
