import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import type { Payload } from 'payload'

export function getAdAnalyticsDailyCollection(payload: Payload) {
  const adapter = payload.db as unknown as MongooseAdapter
  const model = adapter.collections?.['ad-analytics-daily']

  if (model?.collection) {
    return model.collection
  }

  if (!adapter?.connection) {
    throw new Error('MongoDB connection is not available')
  }

  return adapter.connection.collection('ad-analytics-daily')
}
