import SchemaBuilder from "@pothos/core";
import type { Db } from "@/db";
import type { User } from "@/db/schema";

export type Context = {
  db: Db;
  user: User | null;
};

export const builder = new SchemaBuilder<{ Context: Context }>({});
