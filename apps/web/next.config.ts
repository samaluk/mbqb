import './src/env'

import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  experimental: {
    // TypeScript 7 has no JS compiler API; use the project-local tsc CLI.
    // https://nextjs.org/docs/app/api-reference/config/typescript#using-typescript-7
    useTypeScriptCli: true,
  },
  async redirects() {
    return [
      {
        destination: '/canchas',
        permanent: true,
        source: '/pages/canchas-pay-and-play',
      },
      {
        destination: '/canchas',
        permanent: true,
        source: '/pages/canchas-privadas',
      },
      {
        destination: '/bogeyficador',
        permanent: true,
        source: '/pages/el-bogeyficador',
      },
      {
        destination: '/el-canal',
        permanent: true,
        source: '/pages/el-canal',
      },
      {
        destination: '/la-biblia',
        permanent: true,
        source: '/pages/la-biblia',
      },
      {
        destination: '/convenios',
        permanent: true,
        source: '/pages/nuestos-convenios',
      },
      {
        destination: '/sobre-nosotros',
        permanent: true,
        source: '/pages/sobre-nosotros',
      },
    ]
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname, '../..'),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
