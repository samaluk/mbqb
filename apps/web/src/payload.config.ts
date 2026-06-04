import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { env } from '@/env'

import { ActiveMemberships } from './collections/ActiveMemberships'
import { Canchas } from './collections/Canchas'
import { LaBibliaArticles } from './collections/LaBibliaArticles'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { HomePage } from './globals/HomePage'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    livePreview: {
      breakpoints: [
        {
          height: 667,
          label: 'Mobile',
          name: 'mobile',
          width: 375,
        },
      ],
    },
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, ActiveMemberships, Canchas, LaBibliaArticles, Products],
  globals: [SiteSettings, HomePage],
  localization: {
    defaultLocale: 'es',
    fallback: true,
    locales: [
      {
        code: 'es',
        label: 'Español',
      },
      {
        code: 'en',
        label: 'English',
      },
    ],
  },
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  serverURL: env.NEXT_PUBLIC_SERVER_URL,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionString: env.DATABASE_URL,
    },
    push: env.NODE_ENV !== 'production' && env.CI !== 'true',
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      clientUploads: true,
      enabled: Boolean(env.BLOB_READ_WRITE_TOKEN),
      collections: {
        media: true,
      },
      token: env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
