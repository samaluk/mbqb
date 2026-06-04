import { loadLocalEnv } from './scripts/loadScriptEnv'

process.env.VITEST = 'true'
loadLocalEnv()

if (process.env.INTEGRATION_TEST === 'true') {
  const testPostgresUrl = process.env.TEST_POSTGRES_URL?.trim()

  if (!testPostgresUrl) {
    throw new Error(
      'Integration tests require TEST_POSTGRES_URL. Point it at an isolated test database; test:int will not use POSTGRES_URL.',
    )
  }

  process.env.POSTGRES_URL = testPostgresUrl
}

if (!process.env.PAYLOAD_SECRET?.trim()) {
  process.env.PAYLOAD_SECRET = 'development-secret'
}

if (!process.env.PREVIEW_SECRET?.trim()) {
  process.env.PREVIEW_SECRET = 'development-preview-secret'
}
