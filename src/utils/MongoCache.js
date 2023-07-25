import { MongoClient } from 'mongodb'
export const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);

export default class MongoCache {
  constructor({ username, cacheName }) {
    this.mongo = client.db('test').collection('auth')
    this.query = { username, type: cacheName }
  }

  async getCached () {
    const document = await this.mongo.findOne(this.query)
    return document ? document.data : {}
  }

  async setCached (cache) {
    return await this.mongo.updateOne(this.query, {
      $set: {
        data: cache
      }
    }, { upsert: true })
  }

  async setCachedPartial (cache) {
    const document = await this.getCached()
    return await this.mongo.updateOne(this.query, {
      $set: {
        data: {...document, ...cache }
      }
    }, { upsert: true })
  }
}
