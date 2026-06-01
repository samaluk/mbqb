import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_legacy_pages_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_legacy_pages_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "legacy_pages_id";

    DROP TABLE IF EXISTS "legacy_pages_locales" CASCADE;
    DROP TABLE IF EXISTS "legacy_pages" CASCADE;
    DROP TYPE IF EXISTS "enum_legacy_pages_legacy_kind";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_legacy_pages_legacy_kind" AS ENUM('page', 'hub', 'bogeyficador');

    CREATE TABLE IF NOT EXISTS "legacy_pages" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" varchar NOT NULL,
      "legacy_kind" "enum_legacy_pages_legacy_kind" DEFAULT 'page' NOT NULL,
      "source_url" varchar NOT NULL,
      "source_updated_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "legacy_pages_locales" (
      "title" varchar NOT NULL,
      "body_html" varchar NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    ALTER TABLE "legacy_pages_locales"
      ADD CONSTRAINT "legacy_pages_locales_parent_id_fk"
      FOREIGN KEY ("_parent_id")
      REFERENCES "public"."legacy_pages"("id")
      ON DELETE cascade
      ON UPDATE no action;

    CREATE UNIQUE INDEX IF NOT EXISTS "legacy_pages_slug_idx"
      ON "legacy_pages" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "legacy_pages_updated_at_idx"
      ON "legacy_pages" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "legacy_pages_created_at_idx"
      ON "legacy_pages" USING btree ("created_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "legacy_pages_locales_locale_parent_id_unique"
      ON "legacy_pages_locales" USING btree ("_locale", "_parent_id");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "legacy_pages_id" integer;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_legacy_pages_fk"
      FOREIGN KEY ("legacy_pages_id")
      REFERENCES "public"."legacy_pages"("id")
      ON DELETE cascade
      ON UPDATE no action;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_legacy_pages_id_idx"
      ON "payload_locked_documents_rels" USING btree ("legacy_pages_id");
  `)
}
