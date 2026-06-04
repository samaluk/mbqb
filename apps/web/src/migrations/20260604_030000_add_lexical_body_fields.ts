import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "canchas_locales" ADD COLUMN IF NOT EXISTS "body" jsonb;
    ALTER TABLE "_canchas_v_locales" ADD COLUMN IF NOT EXISTS "version_body" jsonb;

    ALTER TABLE "la_biblia_articles_locales" ADD COLUMN IF NOT EXISTS "body" jsonb;
    ALTER TABLE "_la_biblia_articles_v_locales" ADD COLUMN IF NOT EXISTS "version_body" jsonb;

    ALTER TABLE "products_locales" ADD COLUMN IF NOT EXISTS "body" jsonb;
    ALTER TABLE "_products_v_locales" ADD COLUMN IF NOT EXISTS "version_body" jsonb;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "canchas_locales" DROP COLUMN IF EXISTS "body";
    ALTER TABLE "_canchas_v_locales" DROP COLUMN IF EXISTS "version_body";

    ALTER TABLE "la_biblia_articles_locales" DROP COLUMN IF EXISTS "body";
    ALTER TABLE "_la_biblia_articles_v_locales" DROP COLUMN IF EXISTS "version_body";

    ALTER TABLE "products_locales" DROP COLUMN IF EXISTS "body";
    ALTER TABLE "_products_v_locales" DROP COLUMN IF EXISTS "version_body";
  `)
}
