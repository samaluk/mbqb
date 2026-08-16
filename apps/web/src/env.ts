import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    CI: z.string().optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    POSTGRES_URL: z.string().min(1),
    TEST_POSTGRES_URL: z.string().optional(),
    PAYLOAD_SECRET: z.string().min(1),
    PREVIEW_SECRET: z.string().min(1),
    NEXT_RUNTIME: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SERVER_URL: z.string().url(),
  },
  runtimeEnv: {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    CI: process.env.CI,
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_URL: process.env.POSTGRES_URL,
    TEST_POSTGRES_URL: process.env.TEST_POSTGRES_URL,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    PREVIEW_SECRET: process.env.PREVIEW_SECRET,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true' || process.env.VITEST === 'true',
})
