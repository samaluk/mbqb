import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'validation-manager');
CREATE TABLE "users_sessions" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp(3) with time zone,
	"expires_at" timestamp(3) with time zone NOT NULL
);

CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" "enum_users_role" DEFAULT 'admin' NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"email" varchar NOT NULL,
	"reset_password_token" varchar,
	"reset_password_expiration" timestamp(3) with time zone,
	"salt" varchar,
	"hash" varchar,
	"login_attempts" numeric DEFAULT 0,
	"lock_until" timestamp(3) with time zone
);

CREATE TABLE "active_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"rut" varchar NOT NULL,
	"normalized_rut" varchar NOT NULL,
	"rut_lookup_hash" varchar NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "_active_memberships_v" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"version_rut" varchar NOT NULL,
	"version_normalized_rut" varchar NOT NULL,
	"version_rut_lookup_hash" varchar NOT NULL,
	"version_is_active" boolean DEFAULT true NOT NULL,
	"version_notes" varchar,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "payload_kv" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"data" jsonb NOT NULL
);

CREATE TABLE "payload_locked_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"global_slug" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "payload_locked_documents_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"users_id" integer,
	"media_id" integer,
	"active_memberships_id" integer,
	"canchas_id" integer,
	"la_biblia_articles_id" integer,
	"products_id" integer
);

CREATE TABLE "payload_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar,
	"value" jsonb,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "payload_preferences_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"users_id" integer
);

CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_name" varchar DEFAULT 'Mas Bogeys Que Birdies' NOT NULL,
	"instagram_url" varchar,
	"whatsapp_url" varchar,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_active_memberships_v" ADD CONSTRAINT "_active_memberships_v_parent_id_active_memberships_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."active_memberships"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_active_memberships_fk" FOREIGN KEY ("active_memberships_id") REFERENCES "public"."active_memberships"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_canchas_fk" FOREIGN KEY ("canchas_id") REFERENCES "public"."canchas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_la_biblia_articles_fk" FOREIGN KEY ("la_biblia_articles_id") REFERENCES "public"."la_biblia_articles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
CREATE UNIQUE INDEX "active_memberships_normalized_rut_idx" ON "active_memberships" USING btree ("normalized_rut");
CREATE UNIQUE INDEX "active_memberships_rut_lookup_hash_idx" ON "active_memberships" USING btree ("rut_lookup_hash");
CREATE INDEX "active_memberships_updated_at_idx" ON "active_memberships" USING btree ("updated_at");
CREATE INDEX "active_memberships_created_at_idx" ON "active_memberships" USING btree ("created_at");
CREATE INDEX "_active_memberships_v_parent_idx" ON "_active_memberships_v" USING btree ("parent_id");
CREATE INDEX "_active_memberships_v_version_version_normalized_rut_idx" ON "_active_memberships_v" USING btree ("version_normalized_rut");
CREATE INDEX "_active_memberships_v_version_version_rut_lookup_hash_idx" ON "_active_memberships_v" USING btree ("version_rut_lookup_hash");
CREATE INDEX "_active_memberships_v_version_version_updated_at_idx" ON "_active_memberships_v" USING btree ("version_updated_at");
CREATE INDEX "_active_memberships_v_version_version_created_at_idx" ON "_active_memberships_v" USING btree ("version_created_at");
CREATE INDEX "_active_memberships_v_created_at_idx" ON "_active_memberships_v" USING btree ("created_at");
CREATE INDEX "_active_memberships_v_updated_at_idx" ON "_active_memberships_v" USING btree ("updated_at");
CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
CREATE INDEX "payload_locked_documents_rels_active_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("active_memberships_id");
CREATE INDEX "payload_locked_documents_rels_canchas_id_idx" ON "payload_locked_documents_rels" USING btree ("canchas_id");
CREATE INDEX "payload_locked_documents_rels_la_biblia_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("la_biblia_articles_id");
CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
DROP TABLE "users_sessions" CASCADE;
DROP TABLE "users" CASCADE;
DROP TABLE "active_memberships" CASCADE;
DROP TABLE "_active_memberships_v" CASCADE;
DROP TABLE "payload_kv" CASCADE;
DROP TABLE "payload_locked_documents" CASCADE;
DROP TABLE "payload_locked_documents_rels" CASCADE;
DROP TABLE "payload_preferences" CASCADE;
DROP TABLE "payload_preferences_rels" CASCADE;
DROP TABLE "site_settings" CASCADE;
DROP TYPE "public"."enum_users_role";
  `)
}
