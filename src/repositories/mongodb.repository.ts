import { User } from '../entities/User'
import { IRepository } from './interfaces/IRepository'
import { MongoClient, Collection, Db, InsertOneWriteOpResult } from 'mongodb'
import { Connection } from '../database/connection'
import bcrypt from 'bcrypt'

export class MongoDbRepository implements IRepository<User> {
  public uri: string = 'mongodb://root:rootpassword@localhost:27017'
  public client!: MongoClient
  private _collection!: Collection
  private _db!: Db

  constructor(private collectionName: string) {
    this.connect()
  }

  async connect() {
    this.client = await Connection.getInstance().getClient()
    this._db = this.client.db('myCondo')
    
    this._collection = this._db.collection(this.collectionName)
  }

  async save(user: User): Promise<User> {
    user.password = bcrypt.hashSync(user.password, 10);
    const { ops }: InsertOneWriteOpResult<User> = await this._collection.insertOne(user)
    const [createdUser] = ops
    return createdUser
  }

  async findAll(): Promise<User[]> {
    return await this._collection.find().project({ password: 0 }).toArray()
  }

  async findByEmail(email: string): Promise<any> {
    const [user] = await this._collection.find({ email: email }).toArray()
    return user
  }

  async login(loginData: User): Promise<User> {
    const user = await this.findByEmail(loginData.email)
    return user
  }
}