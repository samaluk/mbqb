import { getPayload } from 'payload'

import type { StaffRole } from '../src/access/roles.js'

import { loadEnvForScript } from './loadScriptEnv.js'

loadEnvForScript()
await import('../src/env.js')

const staffRolesByName: Record<string, StaffRole> = {
  admin: 'admin',
  editor: 'editor',
  'validation-manager': 'validation-manager',
}

function parseStaffRole(value: string | undefined): StaffRole {
  const role = value?.trim() || 'admin'
  const parsed = staffRolesByName[role]

  if (!parsed) {
    throw new Error(`CMS_USER_ROLE must be one of: ${Object.keys(staffRolesByName).join(', ')}`)
  }

  return parsed
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
  const role = parseStaffRole(process.env.CMS_USER_ROLE)
  const updateExisting = process.env.CMS_USER_UPDATE_EXISTING === 'true'

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
