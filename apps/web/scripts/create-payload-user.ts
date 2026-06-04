import { getPayload } from 'payload'

import { loadEnvForScript } from './loadScriptEnv.js'

loadEnvForScript()
await import('../src/env.js')

type StaffRole = 'admin' | 'editor' | 'validation-manager'

const validRoles = new Set<StaffRole>(['admin', 'editor', 'validation-manager'])

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
