// An in-memory D1 for the Worker tests: Node's SQLite with every migration in
// worker/migrations/ applied in order, so the tests run against the real schema.
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import type { D1Database, D1PreparedStatement } from "./config.ts";

const migrations = new URL("./migrations/", import.meta.url);

export function memoryD1(): D1Database & { sqlite: DatabaseSync } {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON"); // D1 enforces foreign keys
  for (const file of readdirSync(migrations)
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    sqlite.exec(readFileSync(new URL(file, migrations), "utf8"));
  }
  const statement = (sql: string, values: SQLInputValue[]): D1PreparedStatement => ({
    bind: (...next: unknown[]) => statement(sql, next as SQLInputValue[]),
    first: async <T>() => (sqlite.prepare(sql).get(...values) as T | undefined) ?? null,
    run: async () => sqlite.prepare(sql).run(...values),
  });
  return { prepare: (sql) => statement(sql, []), sqlite };
}
