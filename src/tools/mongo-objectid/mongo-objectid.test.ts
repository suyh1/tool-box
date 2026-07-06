import { describe, expect, it } from 'vitest'
import { parseMongoObjectId } from './mongo-objectid'

describe('parseMongoObjectId', () => {
  it('parses Mongo ObjectId timestamp and counter fields', () => {
    expect(parseMongoObjectId('507f1f77bcf86cd799439011')).toEqual({
      ok: true,
      objectId: '507f1f77bcf86cd799439011',
      timestamp: '2012-10-17T21:13:27.000Z',
      timestampHex: '507f1f77',
      randomValue: 'bcf86cd799',
      counterHex: '439011',
      counter: 4427793,
    })
  })
})
