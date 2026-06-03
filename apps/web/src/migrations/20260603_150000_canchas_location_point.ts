import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS postgis;

    ALTER TABLE "canchas" ADD COLUMN IF NOT EXISTS "location" geometry(Point);

    UPDATE "canchas"
    SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)
    WHERE "latitude" IS NOT NULL
      AND "longitude" IS NOT NULL
      AND "location" IS NULL;

    CREATE INDEX IF NOT EXISTS "canchas_location_idx" ON "canchas" USING GIST ("location");

    ALTER TABLE "canchas" DROP COLUMN IF EXISTS "latitude";
    ALTER TABLE "canchas" DROP COLUMN IF EXISTS "longitude";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "canchas" ADD COLUMN IF NOT EXISTS "latitude" numeric;
    ALTER TABLE "canchas" ADD COLUMN IF NOT EXISTS "longitude" numeric;

    UPDATE "canchas"
    SET
      "longitude" = ST_X("location"),
      "latitude" = ST_Y("location")
    WHERE "location" IS NOT NULL;

    DROP INDEX IF EXISTS "canchas_location_idx";

    ALTER TABLE "canchas" DROP COLUMN IF EXISTS "location";
  `)
}
