import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

import { applyProductionDatabaseUrl } from '../scripts/databaseUrl.js'

// Neon/Vercel often expose POSTGRES_URL* or DATABASE_URL_UNPOOLED, not DATABASE_URL.
applyProductionDatabaseUrl()

export const env = createEnv({
  server: {
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    CI: z.string().optional(),
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PAYLOAD_SECRET: z.string().min(1),
    PREVIEW_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_SERVER_URL: z.string().url(),
  },
  runtimeEnv: {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    CI: process.env.CI,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    PREVIEW_SECRET: process.env.PREVIEW_SECRET,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === 'true' || process.env.VITEST === 'true',
})
