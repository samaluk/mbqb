import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "canchas" ADD COLUMN IF NOT EXISTS "holes" numeric;
    ALTER TABLE "canchas" ADD COLUMN IF NOT EXISTS "public_booking_url" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "canchas" DROP COLUMN IF EXISTS "holes";
    ALTER TABLE "canchas" DROP COLUMN IF EXISTS "public_booking_url";
  `)
}
