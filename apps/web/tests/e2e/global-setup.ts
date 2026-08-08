import { loadTestEnv } from '../../scripts/loadScriptEnv'
import { seedE2eFixtures } from '../../scripts/seed-e2e-fixtures'

export default async function globalSetup() {
  loadTestEnv()
  await seedE2eFixtures()
}
