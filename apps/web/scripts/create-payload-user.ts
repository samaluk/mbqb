import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { getPayload } from 'payload'

type StaffRole = 'admin' | 'editor' | 'validation-manager'

const validRoles = new Set<StaffRole>(['admin', 'editor', 'validation-manager'])

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const defaultProductionEnvPath = path.resolve(dirname, '../../../.vercel/.env.production.local')

const envPath =
  process.env.DOTENV_CONFIG_PATH ||
  (process.env.DATABASE_URL?.trim()
    ? undefined
    : existsSync(defaultProductionEnvPath)
      ? defaultProductionEnvPath
      : undefined)

if (envPath) {
  dotenv.config({ path: envPath })
}

if (process.env.DATABASE_URL_UNPOOLED?.trim()) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED
}

const localEnvPath = path.resolve(dirname, '../.env')
if (existsSync(localEnvPath)) {
  if (envPath) {
    const localEnv = dotenv.parse(readFileSync(localEnvPath))
    if (!process.env.PAYLOAD_SECRET?.trim() && localEnv.PAYLOAD_SECRET?.trim()) {
      process.env.PAYLOAD_SECRET = localEnv.PAYLOAD_SECRET
    }
  } else {
    dotenv.config({ path: localEnvPath, override: true })
  }
}

const getRequiredEnv = (name: string) => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

const main = async () => {
  const email = getRequiredEnv('CMS_USER_EMAIL').toLowerCase()
  const password = getRequiredEnv('CMS_USER_PASSWORD')
  const role = (process.env.CMS_USER_ROLE?.trim() || 'admin') as StaffRole
  const updateExisting = process.env.CMS_USER_UPDATE_EXISTING === 'true'

  if (!validRoles.has(role)) {
    throw new Error(`CMS_USER_ROLE must be one of: ${[...validRoles].join(', ')}`)
  }

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  const existingUsers = await payload.find({
    collection: 'users',
    limit: 1,
    where: {
      email: {
        equals: email,
      },
    },
  })

  const existingUser = existingUsers.docs[0]

  if (existingUser) {
    if (!updateExisting) {
      throw new Error(
        `User ${email} already exists. Set CMS_USER_UPDATE_EXISTING=true to update its password and role.`,
      )
    }

    await payload.update({
      collection: 'users',
      id: existingUser.id,
      data: {
        password,
        role,
      },
    })

    console.log(`Updated Payload user ${email} with role ${role}.`)
    return
  }

  await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      role,
    },
  })

  console.log(`Created Payload user ${email} with role ${role}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
