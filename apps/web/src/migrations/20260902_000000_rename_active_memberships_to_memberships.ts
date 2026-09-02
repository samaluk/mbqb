import { createHash, createHmac } from 'node:crypto'

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
  sql`ALTER TABLE public.site_settings
    ADD COLUMN IF NOT EXISTS member_identifier_type character varying DEFAULT 'generic'`,
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
  sql`ALTER TABLE public.site_settings
    DROP COLUMN IF EXISTS member_identifier_type`,
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

function cleanRut(input: string): string {
  return input.replace(/[.\-\s]/g, '').toUpperCase()
}

const CHECK_DIGITS = '0K987654321'
const RUT_PATTERN = /^(\d{1,8})([0-9K])$/

function calculateCheckDigit(body: string): string {
  let multiplier = 2
  let sum = 0

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  return CHECK_DIGITS[sum % 11] ?? '0'
}

function parseRutParts(input: string): { body: string; checkDigit: string } | null {
  const match = RUT_PATTERN.exec(cleanRut(input))
  if (!match) return null

  const [, body, checkDigit] = match
  return checkDigit === calculateCheckDigit(body) ? { body, checkDigit } : null
}

function normalizeRutLegacy(input: string): string | null {
  const parts = parseRutParts(input)
  if (!parts) return null
  return `${parts.body}-${parts.checkDigit}`
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
    const rutParts = parseRutParts(row.identifier)
    let identifier = row.identifier
    let normalizedIdentifier: string | null = null

    if (rutParts) {
      identifier = `${rutParts.body}${rutParts.checkDigit}`
      normalizedIdentifier = identifier.toLowerCase()
    } else {
      normalizedIdentifier = normalizeIdentifier(row.identifier)
    }

    if (!normalizedIdentifier) continue

    const lookupHash = createLookupHash(normalizedIdentifier, secret)

    await db.execute(sql`
      UPDATE public.memberships
      SET identifier = ${identifier},
          normalized_identifier = ${normalizedIdentifier},
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
    const rutParts = parseRutParts(row.version_identifier)
    let versionIdentifier = row.version_identifier
    let versionNormalizedIdentifier: string | null = null

    if (rutParts) {
      versionIdentifier = `${rutParts.body}${rutParts.checkDigit}`
      versionNormalizedIdentifier = versionIdentifier.toLowerCase()
    } else {
      versionNormalizedIdentifier = normalizeIdentifier(row.version_identifier)
    }

    if (!versionNormalizedIdentifier) continue

    const lookupHash = createLookupHash(versionNormalizedIdentifier, secret)

    await db.execute(sql`
      UPDATE public._memberships_v
      SET version_identifier = ${versionIdentifier},
          version_normalized_identifier = ${versionNormalizedIdentifier},
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

type ActiveMembershipRow = {
  id: number
  rut: string
}

type ActiveMembershipVersionRow = {
  id: number
  version_rut: string
}

function createLegacyRutLookupHash(normalizedRut: string, secret: string) {
  return createHash('sha256').update(`${secret}:${normalizedRut}`).digest('hex')
}

async function rollbackMembershipRows(db: MigrateDownArgs['db'], secret: string) {
  const result = await db.execute<ActiveMembershipRow>(
    sql`SELECT id, rut FROM public.active_memberships`,
  )

  for (const row of result.rows) {
    const normalizedRut = normalizeRutLegacy(row.rut) ?? row.rut.trim().toLowerCase()
    if (!normalizedRut) continue

    const rutLookupHash = createLegacyRutLookupHash(normalizedRut, secret)

    await db.execute(sql`
      UPDATE public.active_memberships
      SET normalized_rut = ${normalizedRut},
          rut_lookup_hash = ${rutLookupHash}
      WHERE id = ${row.id}
    `)
  }
}

async function rollbackMembershipVersionRows(db: MigrateDownArgs['db'], secret: string) {
  const result = await db.execute<ActiveMembershipVersionRow>(
    sql`SELECT id, version_rut FROM public._active_memberships_v`,
  )

  for (const row of result.rows) {
    const normalizedRut = normalizeRutLegacy(row.version_rut) ?? row.version_rut.trim().toLowerCase()
    if (!normalizedRut) continue

    const rutLookupHash = createLegacyRutLookupHash(normalizedRut, secret)

    await db.execute(sql`
      UPDATE public._active_memberships_v
      SET version_normalized_rut = ${normalizedRut},
          version_rut_lookup_hash = ${rutLookupHash}
      WHERE id = ${row.id}
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const statement of downRenameStatements) {
    await db.execute(statement)
  }

  const secret = getPayloadSecret()
  await rollbackMembershipRows(db, secret)
  await rollbackMembershipVersionRows(db, secret)
}
