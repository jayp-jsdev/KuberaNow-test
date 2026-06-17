/**
 * One-time migration: normalize existing `articles` documents (and their version
 * docs) that were saved under the OLD schema so they match the new Sanity-aligned
 * Payload schema.
 *
 * Safe to re-run (idempotent): each transform checks the current value type first.
 *
 *   node scripts/migrate-articles.mjs
 */
import 'dotenv/config'
import mongoose from 'mongoose'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Missing DATABASE_URL in environment')
  process.exit(1)
}

const isObjectId = (v) => v && typeof v === 'object' && v._bsontype === 'ObjectId'

function lexicalFromText(text) {
  const trimmed = String(text || '').trim()
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: trimmed
        ? [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              textFormat: 0,
              textStyle: '',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: trimmed,
                  version: 1,
                },
              ],
            },
          ]
        : [],
    },
  }
}

/** Build $set / $unset operations to bring one (sub)document up to the new schema. */
function buildOps(target, tagMap) {
  const set = {}
  const unset = {}

  // image: ObjectId (old single upload) -> group { mediaType, imageAsset }
  if (isObjectId(target.image)) {
    set.image = { mediaType: 'image', imageAsset: target.image }
  }

  // category (ObjectId) -> categories ([ObjectId])
  if (isObjectId(target.category)) {
    if (!Array.isArray(target.categories) || target.categories.length === 0) {
      set.categories = [target.category]
    }
    unset.category = ''
  }

  // tags: ObjectId[] (old relationship) -> string[] (titles)
  if (Array.isArray(target.tags) && target.tags.some(isObjectId)) {
    const titles = target.tags
      .map((t) => (isObjectId(t) ? tagMap.get(t.toString()) || null : t))
      .filter((t) => typeof t === 'string' && t.length > 0)
    set.tags = titles
  }

  // alsoReadArticles: ObjectId[] -> articleHyperlink (single)
  if (Array.isArray(target.alsoReadArticles) && target.alsoReadArticles.length > 0) {
    if (!target.articleHyperlink) {
      set.articleHyperlink = target.alsoReadArticles[0]
    }
    unset.alsoReadArticles = ''
  }

  // summary: plain string -> Lexical richText
  if (typeof target.summary === 'string') {
    set.summary = lexicalFromText(target.summary)
  }

  // quotes: object array -> textarea string (+ quotesCredits)
  if (Array.isArray(target.quotes)) {
    const first = target.quotes.find((q) => q && typeof q === 'object')
    set.quotes = first?.quote || ''
    if (first?.attribution) set.quotesCredits = first.attribution
  }

  // youtubeVideoUrl -> youtubeLink
  if (typeof target.youtubeVideoUrl === 'string') {
    if (!target.youtubeLink) set.youtubeLink = target.youtubeVideoUrl
    unset.youtubeVideoUrl = ''
  }

  // pinnedOnPages: removed field
  if ('pinnedOnPages' in target) unset.pinnedOnPages = ''

  return { set, unset }
}

async function run() {
  await mongoose.connect(url)
  const db = mongoose.connection.db

  // Build a lookup of tag ObjectId -> title (Tags collection still exists in the DB)
  const tagMap = new Map()
  try {
    const tags = await db.collection('tags').find({}).toArray()
    for (const tag of tags) tagMap.set(tag._id.toString(), tag.title)
  } catch {
    /* tags collection may not exist; ignore */
  }

  let mainUpdated = 0
  let versionsUpdated = 0

  // 1) Main articles collection
  const articles = await db.collection('articles').find({}).toArray()
  for (const doc of articles) {
    const { set, unset } = buildOps(doc, tagMap)
    const update = {}
    if (Object.keys(set).length) update.$set = set
    if (Object.keys(unset).length) update.$unset = unset
    if (Object.keys(update).length) {
      await db.collection('articles').updateOne({ _id: doc._id }, update)
      mainUpdated++
    }
  }

  // 2) Versions collection (data lives under `version.*`)
  const hasVersions = await db.listCollections({ name: '_articles_versions' }).toArray()
  if (hasVersions.length) {
    const versions = await db.collection('_articles_versions').find({}).toArray()
    for (const doc of versions) {
      const v = doc.version
      if (!v || typeof v !== 'object') continue
      const { set, unset } = buildOps(v, tagMap)
      const update = {}
      if (Object.keys(set).length) {
        update.$set = {}
        for (const [k, val] of Object.entries(set)) update.$set[`version.${k}`] = val
      }
      if (Object.keys(unset).length) {
        update.$unset = {}
        for (const k of Object.keys(unset)) update.$unset[`version.${k}`] = ''
      }
      if (Object.keys(update).length) {
        await db.collection('_articles_versions').updateOne({ _id: doc._id }, update)
        versionsUpdated++
      }
    }
  }

  console.log(`Migrated ${mainUpdated} article(s) and ${versionsUpdated} version doc(s).`)

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
