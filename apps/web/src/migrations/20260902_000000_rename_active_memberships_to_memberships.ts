import { createHmac } from 'node:crypto'

import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const upRenameStatements = [
  sql`ALTER TABLE public._active_memberships_v
    DROP CONSTRAINT IF EXISTS _active_memberships_v_parent_id_active_memberships_id_fk`,
  sql`ALTER TABLE public.payload_locked_documents_rels
    DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_active_memberships_fk`,
  sql`ALTER TABLE public.active_memberships RENAME TO memberships`,
  sql`ALTER TABLE public.memberships RENAME COLUMN rut TO identifier`,
  sql`ALTER TABLE public.memberships RENAME COLUMN normalized_rut TO normalized_identifier`,
  sql`ALTER TABLE public.memberships RENAME COLUMN rut_lookup_hash TO lookup_hash`,
  sql`ALTER SEQUENCE public.active_memberships_id_seq RENAME TO memberships_id_seq`,
  sql`ALTER INDEX public.active_memberships_pkey RENAME TO memberships_pkey`,
  sql`ALTER INDEX public.active_memberships_created_at_idx RENAME TO memberships_created_at_idx`,
  sql`ALTER INDEX public.active_memberships_normalized_rut_idx RENAME TO memberships_normalized_identifier_idx`,
  sql`ALTER INDEX public.active_memberships_rut_lookup_hash_idx RENAME TO memberships_lookup_hash_idx`,
  sql`ALTER INDEX public.active_memberships_updated_at_idx RENAME TO memberships_updated_at_idx`,
  sql`ALTER TABLE public._active_memberships_v RENAME TO _memberships_v`,
  sql`ALTER TABLE public._memberships_v RENAME COLUMN version_rut TO version_identifier`,
  sql`ALTER TABLE public._memberships_v
    RENAME COLUMN version_normalized_rut TO version_normalized_identifier`,
  sql`ALTER TABLE public._memberships_v RENAME COLUMN version_rut_lookup_hash TO version_lookup_hash`,
  sql`ALTER SEQUENCE public._active_memberships_v_id_seq RENAME TO _memberships_v_id_seq`,
  sql`ALTER INDEX public._active_memberships_v_pkey RENAME TO _memberships_v_pkey`,
  sql`ALTER INDEX public._active_memberships_v_created_at_idx RENAME TO _memberships_v_created_at_idx`,
  sql`ALTER INDEX public._active_memberships_v_parent_idx RENAME TO _memberships_v_parent_idx`,
  sql`ALTER INDEX public._active_memberships_v_updated_at_idx RENAME TO _memberships_v_updated_at_idx`,
  sql`ALTER INDEX public._active_memberships_v_version_version_created_at_idx
    RENAME TO _memberships_v_version_version_created_at_idx`,
  sql`ALTER INDEX public._active_memberships_v_version_version_normalized_rut_idx
    RENAME TO _memberships_v_version_version_normalized_identifier_idx`,
  sql`ALTER INDEX public._active_memberships_v_version_version_rut_lookup_hash_idx
    RENAME TO _memberships_v_version_version_lookup_hash_idx`,
  sql`ALTER INDEX public._active_memberships_v_version_version_updated_at_idx
    RENAME TO _memberships_v_version_version_updated_at_idx`,
  sql`ALTER TABLE public.payload_locked_documents_rels
    RENAME COLUMN active_memberships_id TO memberships_id`,
  sql`ALTER INDEX public.payload_locked_documents_rels_active_memberships_id_idx
    RENAME TO payload_locked_documents_rels_memberships_id_idx`,
  sql`ALTER TABLE ONLY public._memberships_v
    ADD CONSTRAINT _memberships_v_parent_id_memberships_id_fk
    FOREIGN KEY (parent_id) REFERENCES public.memberships(id) ON DELETE SET NULL`,
  sql`ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_memberships_fk
    FOREIGN KEY (memberships_id) REFERENCES public.memberships(id) ON DELETE CASCADE`,
]

const downRenameStatements = [
  sql`ALTER TABLE public._memberships_v
    DROP CONSTRAINT IF EXISTS _memberships_v_parent_id_memberships_id_fk`,
  sql`ALTER TABLE public.payload_locked_documents_rels
    DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_memberships_fk`,
  sql`ALTER TABLE public.memberships RENAME TO active_memberships`,
  sql`ALTER TABLE public.active_memberships RENAME COLUMN identifier TO rut`,
  sql`ALTER TABLE public.active_memberships RENAME COLUMN normalized_identifier TO normalized_rut`,
  sql`ALTER TABLE public.active_memberships RENAME COLUMN lookup_hash TO rut_lookup_hash`,
  sql`ALTER SEQUENCE public.memberships_id_seq RENAME TO active_memberships_id_seq`,
  sql`ALTER INDEX public.memberships_pkey RENAME TO active_memberships_pkey`,
  sql`ALTER INDEX public.memberships_created_at_idx RENAME TO active_memberships_created_at_idx`,
  sql`ALTER INDEX public.memberships_normalized_identifier_idx RENAME TO active_memberships_normalized_rut_idx`,
  sql`ALTER INDEX public.memberships_lookup_hash_idx RENAME TO active_memberships_rut_lookup_hash_idx`,
  sql`ALTER INDEX public.memberships_updated_at_idx RENAME TO active_memberships_updated_at_idx`,
  sql`ALTER TABLE public._memberships_v RENAME TO _active_memberships_v`,
  sql`ALTER TABLE public._active_memberships_v RENAME COLUMN version_identifier TO version_rut`,
  sql`ALTER TABLE public._active_memberships_v
    RENAME COLUMN version_normalized_identifier TO version_normalized_rut`,
  sql`ALTER TABLE public._active_memberships_v RENAME COLUMN version_lookup_hash TO version_rut_lookup_hash`,
  sql`ALTER SEQUENCE public._memberships_v_id_seq RENAME TO _active_memberships_v_id_seq`,
  sql`ALTER INDEX public._memberships_v_pkey RENAME TO _active_memberships_v_pkey`,
  sql`ALTER INDEX public._memberships_v_created_at_idx RENAME TO _active_memberships_v_created_at_idx`,
  sql`ALTER INDEX public._memberships_v_parent_idx RENAME TO _active_memberships_v_parent_idx`,
  sql`ALTER INDEX public._memberships_v_updated_at_idx RENAME TO _active_memberships_v_updated_at_idx`,
  sql`ALTER INDEX public._memberships_v_version_version_created_at_idx
    RENAME TO _active_memberships_v_version_version_created_at_idx`,
  sql`ALTER INDEX public._memberships_v_version_version_normalized_identifier_idx
    RENAME TO _active_memberships_v_version_version_normalized_rut_idx`,
  sql`ALTER INDEX public._memberships_v_version_version_lookup_hash_idx
    RENAME TO _active_memberships_v_version_version_rut_lookup_hash_idx`,
  sql`ALTER INDEX public._memberships_v_version_version_updated_at_idx
    RENAME TO _active_memberships_v_version_version_updated_at_idx`,
  sql`ALTER TABLE public.payload_locked_documents_rels
    RENAME COLUMN memberships_id TO active_memberships_id`,
  sql`ALTER INDEX public.payload_locked_documents_rels_memberships_id_idx
    RENAME TO payload_locked_documents_rels_active_memberships_id_idx`,
  sql`ALTER TABLE ONLY public._active_memberships_v
    ADD CONSTRAINT _active_memberships_v_parent_id_active_memberships_id_fk
    FOREIGN KEY (parent_id) REFERENCES public.active_memberships(id) ON DELETE SET NULL`,
  sql`ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_active_memberships_fk
    FOREIGN KEY (active_memberships_id) REFERENCES public.active_memberships(id) ON DELETE CASCADE`,
]

type MembershipRow = {
  id: number
  identifier: string
}

type MembershipVersionRow = {
  id: number
  version_identifier: string
}

function getPayloadSecret() {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is required to run membership migrations')
  }

  return secret
}

function normalizeIdentifier(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  return trimmed.toLowerCase()
}

function createLookupHash(normalizedIdentifier: string, secret: string) {
  return createHmac('sha256', secret).update(normalizedIdentifier).digest('hex')
}

async function rehashMembershipRows(db: MigrateUpArgs['db'], secret: string) {
  const result = await db.execute<MembershipRow>(sql`SELECT id, identifier FROM public.memberships`)

  for (const row of result.rows) {
    const normalizedIdentifier = normalizeIdentifier(row.identifier)
    if (!normalizedIdentifier) continue

    const lookupHash = createLookupHash(normalizedIdentifier, secret)

    await db.execute(sql`
      UPDATE public.memberships
      SET normalized_identifier = ${normalizedIdentifier},
          lookup_hash = ${lookupHash}
      WHERE id = ${row.id}
    `)
  }
}

async function rehashMembershipVersionRows(db: MigrateUpArgs['db'], secret: string) {
  const result = await db.execute<MembershipVersionRow>(
    sql`SELECT id, version_identifier FROM public._memberships_v`,
  )

  for (const row of result.rows) {
    const normalizedIdentifier = normalizeIdentifier(row.version_identifier)
    if (!normalizedIdentifier) continue

    const lookupHash = createLookupHash(normalizedIdentifier, secret)

    await db.execute(sql`
      UPDATE public._memberships_v
      SET version_normalized_identifier = ${normalizedIdentifier},
          version_lookup_hash = ${lookupHash}
      WHERE id = ${row.id}
    `)
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const statement of upRenameStatements) {
    await db.execute(statement)
  }

  const secret = getPayloadSecret()
  await rehashMembershipRows(db, secret)
  await rehashMembershipVersionRows(db, secret)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const statement of downRenameStatements) {
    await db.execute(statement)
  }
}
