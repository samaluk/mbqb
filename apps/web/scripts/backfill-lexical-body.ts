import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import {
  canConvertHTMLToLexicalBody,
  convertHTMLToLexicalBody,
} from '@/lib/convertHTMLToLexicalBody'

type BodyCollection = 'canchas' | 'la-biblia-articles' | 'products'

const collections: BodyCollection[] = ['canchas', 'la-biblia-articles', 'products']

async function backfillCollection(payload: Payload, collection: BodyCollection) {
  let page = 1
  let skipped = 0
  let updated = 0

  while (true) {
    const result = await payload.find({
      collection,
      depth: 0,
      limit: 100,
      locale: 'es',
      overrideAccess: true,
      page,
    })

    for (const doc of result.docs) {
      if (!doc.bodyHtml) continue
      if (!canConvertHTMLToLexicalBody(doc.bodyHtml)) {
        skipped += 1
        continue
      }

      try {
        await payload.update({
          id: doc.id,
          collection,
          data: {
            body: (await convertHTMLToLexicalBody(doc.bodyHtml)) as unknown as Record<
              string,
              unknown
            >,
          },
          locale: 'es',
          overrideAccess: true,
        })
        updated += 1
      } catch (error) {
        skipped += 1
        console.warn(`${collection}:${doc.id} skipped`, JSON.stringify(error, null, 2))
      }
    }

    if (!result.hasNextPage) break
    page += 1
  }

  return { skipped, updated }
}

async function main() {
  const payload = await getPayload({ config })

  for (const collection of collections) {
    const { skipped, updated } = await backfillCollection(payload, collection)
    console.log(`${collection}: backfilled ${updated} documents, skipped ${skipped}`)
  }

  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
