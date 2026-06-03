import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "canchas" ADD COLUMN IF NOT EXISTS "latitude" numeric;
    ALTER TABLE "canchas" ADD COLUMN IF NOT EXISTS "longitude" numeric;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "canchas" DROP COLUMN IF EXISTS "latitude";
    ALTER TABLE "canchas" DROP COLUMN IF EXISTS "longitude";
  `)
}
