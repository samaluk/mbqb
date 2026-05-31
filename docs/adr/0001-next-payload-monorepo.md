# Use a Next.js and Payload monorepo

We will build version 1 as a lightweight `pnpm` monorepo with a single `apps/web` application that contains the public Next.js site and Payload admin/API. This keeps the public site and CMS close enough for fast delivery while preserving room for clearer domain separation later; we are not adding separate deployables or Turborepo until there is a real need.
