import { loadLocalEnv } from './scripts/loadScriptEnv'

process.env.VITEST = 'true'
loadLocalEnv()

if (!process.env.PAYLOAD_SECRET?.trim()) {
  process.env.PAYLOAD_SECRET = 'development-secret'
}

if (!process.env.PREVIEW_SECRET?.trim()) {
  process.env.PREVIEW_SECRET = 'development-preview-secret'
}
