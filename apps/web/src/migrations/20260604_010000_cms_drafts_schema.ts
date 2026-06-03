import type { MigrateUpArgs } from '@payloadcms/db-postgres'
import { MigrateDownArgs, sql } from '@payloadcms/db-postgres'

async function createCanchasVersionTables(db: MigrateUpArgs['db']) {
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS postgis`)

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "_canchas_v" (
        "id" serial PRIMARY KEY NOT NULL,
        "parent_id" integer,
        "version_slug" varchar,
        "version_access_type" "enum__canchas_v_version_access_type" DEFAULT 'unknown',
        "version_region" varchar,
        "version_city" varchar,
        "version_holes" numeric,
        "version_public_booking_url" varchar,
        "version_location" geometry(Point),
        "version_source_url" varchar,
        "version_source_updated_at" timestamp(3) with time zone,
        "version_updated_at" timestamp(3) with time zone,
        "version_created_at" timestamp(3) with time zone,
        "version__status" "enum__canchas_v_version_status" DEFAULT 'draft',
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "snapshot" boolean,
        "published_locale" "enum__canchas_v_published_locale",
        "latest" boolean,
        "autosave" boolean
      );

      CREATE TABLE IF NOT EXISTS "_canchas_v_locales" (
        "version_title" varchar,
        "version_summary" varchar,
        "version_body_html" varchar,
        "id" serial PRIMARY KEY NOT NULL,
        "_locale" "_locales" NOT NULL,
        "_parent_id" integer NOT NULL
      );

      DO $$ BEGIN
        ALTER TABLE "_canchas_v" ADD CONSTRAINT "_canchas_v_parent_id_canchas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."canchas"("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "_canchas_v_locales" ADD CONSTRAINT "_canchas_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_canchas_v"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      CREATE INDEX IF NOT EXISTS "_canchas_v_parent_idx" ON "_canchas_v" USING btree ("parent_id");
      CREATE INDEX IF NOT EXISTS "_canchas_v_version_version_slug_idx" ON "_canchas_v" USING btree ("version_slug");
      CREATE INDEX IF NOT EXISTS "_canchas_v_version_version_updated_at_idx" ON "_canchas_v" USING btree ("version_updated_at");
      CREATE INDEX IF NOT EXISTS "_canchas_v_version_version_created_at_idx" ON "_canchas_v" USING btree ("version_created_at");
      CREATE INDEX IF NOT EXISTS "_canchas_v_version_version__status_idx" ON "_canchas_v" USING btree ("version__status");
      CREATE INDEX IF NOT EXISTS "_canchas_v_created_at_idx" ON "_canchas_v" USING btree ("created_at");
      CREATE INDEX IF NOT EXISTS "_canchas_v_updated_at_idx" ON "_canchas_v" USING btree ("updated_at");
      CREATE INDEX IF NOT EXISTS "_canchas_v_snapshot_idx" ON "_canchas_v" USING btree ("snapshot");
      CREATE INDEX IF NOT EXISTS "_canchas_v_published_locale_idx" ON "_canchas_v" USING btree ("published_locale");
      CREATE INDEX IF NOT EXISTS "_canchas_v_latest_idx" ON "_canchas_v" USING btree ("latest");
      CREATE INDEX IF NOT EXISTS "_canchas_v_autosave_idx" ON "_canchas_v" USING btree ("autosave");
      CREATE UNIQUE INDEX IF NOT EXISTS "_canchas_v_locales_locale_parent_id_unique" ON "_canchas_v_locales" USING btree ("_locale","_parent_id");
    `)
  } catch (error) {
    console.warn(
      'Skipping canchas draft version tables because PostGIS is unavailable:',
      error,
    )
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_canchas_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__canchas_v_version_access_type" AS ENUM('pay-and-play', 'private', 'restricted', 'unknown');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__canchas_v_version_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__canchas_v_published_locale" AS ENUM('es', 'en');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_la_biblia_articles_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__la_biblia_articles_v_version_category" AS ENUM('primeros-pasos', 'reglas-y-etiqueta', 'equipo', 'canchas', 'tecnica-basica', 'diccionario-golfistico', 'cultura-golf');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__la_biblia_articles_v_version_difficulty" AS ENUM('principiante', 'intermedio', 'avanzado');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__la_biblia_articles_v_version_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__la_biblia_articles_v_published_locale" AS ENUM('es', 'en');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__products_v_version_stock_status" AS ENUM('available', 'unavailable');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('es', 'en');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_home_page_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__home_page_v_version_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__home_page_v_published_locale" AS ENUM('es', 'en');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    ALTER TABLE "canchas" ADD COLUMN IF NOT EXISTS "_status" "enum_canchas_status" DEFAULT 'published';
    ALTER TABLE "la_biblia_articles" ADD COLUMN IF NOT EXISTS "_status" "enum_la_biblia_articles_status" DEFAULT 'published';
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "_status" "enum_products_status" DEFAULT 'published';
    ALTER TABLE "home_page" ADD COLUMN IF NOT EXISTS "_status" "enum_home_page_status" DEFAULT 'published';

    UPDATE "canchas" SET "_status" = 'published' WHERE "_status" IS NULL;
    UPDATE "la_biblia_articles" SET "_status" = 'published' WHERE "_status" IS NULL;
    UPDATE "products" SET "_status" = 'published' WHERE "_status" IS NULL;
    UPDATE "home_page" SET "_status" = 'published' WHERE "_status" IS NULL;

    ALTER TABLE "canchas" ALTER COLUMN "_status" SET DEFAULT 'draft';
    ALTER TABLE "la_biblia_articles" ALTER COLUMN "_status" SET DEFAULT 'draft';
    ALTER TABLE "products" ALTER COLUMN "_status" SET DEFAULT 'draft';
    ALTER TABLE "home_page" ALTER COLUMN "_status" SET DEFAULT 'draft';

    CREATE INDEX IF NOT EXISTS "canchas__status_idx" ON "canchas" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "la_biblia_articles__status_idx" ON "la_biblia_articles" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "products__status_idx" ON "products" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "home_page__status_idx" ON "home_page" USING btree ("_status");
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_la_biblia_articles_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_slug" varchar,
      "version_category" "enum__la_biblia_articles_v_version_category" DEFAULT 'equipo',
      "version_difficulty" "enum__la_biblia_articles_v_version_difficulty" DEFAULT 'principiante',
      "version_reviewed_at" timestamp(3) with time zone,
      "version_source_url" varchar,
      "version_source_updated_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__la_biblia_articles_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" "enum__la_biblia_articles_v_published_locale",
      "latest" boolean,
      "autosave" boolean
    );

    CREATE TABLE IF NOT EXISTS "_la_biblia_articles_v_locales" (
      "version_title" varchar,
      "version_body_html" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "_products_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_slug" varchar,
      "version_price_c_l_p" numeric,
      "version_stock_status" "enum__products_v_version_stock_status" DEFAULT 'available',
      "version_image_url" varchar,
      "version_source_url" varchar,
      "version_source_updated_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__products_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" "enum__products_v_published_locale",
      "latest" boolean,
      "autosave" boolean
    );

    CREATE TABLE IF NOT EXISTS "_products_v_locales" (
      "version_title" varchar,
      "version_body_html" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "_home_page_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "version_hero_video_id" integer,
      "version_hero_video_alt" varchar DEFAULT 'Video destacado de Mas Bogeys Que Birdies',
      "version__status" "enum__home_page_v_version_status" DEFAULT 'draft',
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" "enum__home_page_v_published_locale",
      "latest" boolean,
      "autosave" boolean
    );
  `)

  await createCanchasVersionTables(db)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "_la_biblia_articles_v" ADD CONSTRAINT "_la_biblia_articles_v_parent_id_la_biblia_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."la_biblia_articles"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "_la_biblia_articles_v_locales" ADD CONSTRAINT "_la_biblia_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_la_biblia_articles_v"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_hero_video_id_media_id_fk" FOREIGN KEY ("version_hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "_la_biblia_articles_v_parent_idx" ON "_la_biblia_articles_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_la_biblia_articles_v_version_version_slug_idx" ON "_la_biblia_articles_v" USING btree ("version_slug");
    CREATE INDEX IF NOT EXISTS "_la_biblia_articles_v_version_version_updated_at_idx" ON "_la_biblia_articles_v" USING btree ("version_updated_at");
    CREATE INDEX IF NOT EXISTS "_la_biblia_articles_v_version_version_created_at_idx" ON "_la_biblia_articles_v" USING btree ("version_created_at");
    CREATE INDEX IF NOT EXISTS "_la_biblia_articles_v_version_version__status_idx" ON "_la_biblia_articles_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_la_biblia_articles_v_created_at_idx" ON "_la_biblia_articles_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_la_biblia_articles_v_updated_at_idx" ON "_la_biblia_articles_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_la_biblia_articles_v_snapshot_idx" ON "_la_biblia_articles_v" USING btree ("snapshot");
    CREATE INDEX IF NOT EXISTS "_la_biblia_articles_v_published_locale_idx" ON "_la_biblia_articles_v" USING btree ("published_locale");
    CREATE INDEX IF NOT EXISTS "_la_biblia_articles_v_latest_idx" ON "_la_biblia_articles_v" USING btree ("latest");
    CREATE INDEX IF NOT EXISTS "_la_biblia_articles_v_autosave_idx" ON "_la_biblia_articles_v" USING btree ("autosave");
    CREATE UNIQUE INDEX IF NOT EXISTS "_la_biblia_articles_v_locales_locale_parent_id_unique" ON "_la_biblia_articles_v_locales" USING btree ("_locale","_parent_id");

    CREATE INDEX IF NOT EXISTS "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
    CREATE INDEX IF NOT EXISTS "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
    CREATE INDEX IF NOT EXISTS "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
    CREATE INDEX IF NOT EXISTS "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_products_v_snapshot_idx" ON "_products_v" USING btree ("snapshot");
    CREATE INDEX IF NOT EXISTS "_products_v_published_locale_idx" ON "_products_v" USING btree ("published_locale");
    CREATE INDEX IF NOT EXISTS "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
    CREATE INDEX IF NOT EXISTS "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
    CREATE UNIQUE INDEX IF NOT EXISTS "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");

    CREATE INDEX IF NOT EXISTS "_home_page_v_version_version_hero_video_idx" ON "_home_page_v" USING btree ("version_hero_video_id");
    CREATE INDEX IF NOT EXISTS "_home_page_v_version_version__status_idx" ON "_home_page_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_home_page_v_created_at_idx" ON "_home_page_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_home_page_v_updated_at_idx" ON "_home_page_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_home_page_v_snapshot_idx" ON "_home_page_v" USING btree ("snapshot");
    CREATE INDEX IF NOT EXISTS "_home_page_v_published_locale_idx" ON "_home_page_v" USING btree ("published_locale");
    CREATE INDEX IF NOT EXISTS "_home_page_v_latest_idx" ON "_home_page_v" USING btree ("latest");
    CREATE INDEX IF NOT EXISTS "_home_page_v_autosave_idx" ON "_home_page_v" USING btree ("autosave");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_home_page_v" CASCADE;
    DROP TABLE IF EXISTS "_products_v_locales" CASCADE;
    DROP TABLE IF EXISTS "_products_v" CASCADE;
    DROP TABLE IF EXISTS "_la_biblia_articles_v_locales" CASCADE;
    DROP TABLE IF EXISTS "_la_biblia_articles_v" CASCADE;
    DROP TABLE IF EXISTS "_canchas_v_locales" CASCADE;
    DROP TABLE IF EXISTS "_canchas_v" CASCADE;

    ALTER TABLE "home_page" DROP COLUMN IF EXISTS "_status";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "_status";
    ALTER TABLE "la_biblia_articles" DROP COLUMN IF EXISTS "_status";
    ALTER TABLE "canchas" DROP COLUMN IF EXISTS "_status";

    DROP TYPE IF EXISTS "public"."enum__home_page_v_published_locale";
    DROP TYPE IF EXISTS "public"."enum__home_page_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_home_page_status";
    DROP TYPE IF EXISTS "public"."enum__products_v_published_locale";
    DROP TYPE IF EXISTS "public"."enum__products_v_version_status";
    DROP TYPE IF EXISTS "public"."enum__products_v_version_stock_status";
    DROP TYPE IF EXISTS "public"."enum_products_status";
    DROP TYPE IF EXISTS "public"."enum__la_biblia_articles_v_published_locale";
    DROP TYPE IF EXISTS "public"."enum__la_biblia_articles_v_version_status";
    DROP TYPE IF EXISTS "public"."enum__la_biblia_articles_v_version_difficulty";
    DROP TYPE IF EXISTS "public"."enum__la_biblia_articles_v_version_category";
    DROP TYPE IF EXISTS "public"."enum_la_biblia_articles_status";
    DROP TYPE IF EXISTS "public"."enum__canchas_v_published_locale";
    DROP TYPE IF EXISTS "public"."enum__canchas_v_version_status";
    DROP TYPE IF EXISTS "public"."enum__canchas_v_version_access_type";
    DROP TYPE IF EXISTS "public"."enum_canchas_status";
  `)
}
