import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import mongoose, { Types } from 'mongoose'
import type { Payload } from 'payload'

type ConnectionWithBase = mongoose.Connection & {
  base?: typeof mongoose
}

/**
 * Returns mongoose Types from Payload's MongoDB adapter so ObjectIds use the
 * same BSON version as the active database connection (bson 6.x via Payload).
 */
export function getPayloadMongooseTypes(payload: Payload): typeof Types {
  const adapter = payload.db as unknown as MongooseAdapter
  const connection = adapter.connection as ConnectionWithBase

  return connection.base?.Types ?? mongoose.Types
}

export function isValidObjectId(payload: Payload, id: string): boolean {
  return getPayloadMongooseTypes(payload).ObjectId.isValid(id)
}

export function toObjectId(payload: Payload, id: string): Types.ObjectId {
  const ObjectId = getPayloadMongooseTypes(payload).ObjectId
  return new ObjectId(id)
}
