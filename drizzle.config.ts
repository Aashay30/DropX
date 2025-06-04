/**
 * Drizzle Configuration
 *
 * This file configures Drizzle ORM to work with our Neon PostgreSQL database.
 * It's used by the Drizzle CLI for schema migrations and generating SQL.
 */

import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

/*

out: "./drizzle",
➡️ Directory where Drizzle will output generated files like:

Migration SQL files

Cached metadata

******************************

In the context of ORMs (Object-Relational Mappers), a dialect refers to the specific SQL database flavor you're using.

dialect: "postgresql",
➡️ Specifies the database dialect. Since you're using NeonDB, which is PostgreSQL-based, this is set to "postgresql".

*******************************

migrations: {
table: "__drizzle_migrations",
schema: "public",
},

➡️ Configures how and where migration history is stored:

table: The name of the table that tracks applied migrations

schema: The Postgres schema (not Drizzle schema) — usually public

*******************************  
verbose: true,
➡️ Enables detailed logging output during CLI actions (like drizzle push), useful for debugging.

********************************

strict: true,
➡️ Enforces stricter checks by Drizzle, such as validation errors during schema/migration generation.

*/ 

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Configure migrations table
  migrations: {
    table: "__drizzle_migrations",
    schema: "public",
  },
  // Additional options
  verbose: true,
  strict: true,
  
});