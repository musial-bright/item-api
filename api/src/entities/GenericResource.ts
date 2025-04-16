import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'

import { ResourceAttributesType, ResourceType } from './types'
import { tableName } from '../utils/tableName'
import { envDynamoDbEndpoint, envDynamoDbRegion } from '../config/envVariables'
import { createQuery, IndexQueryCondition } from '../utils/dynamoDbHelper'

class GenericResource {
  client: DynamoDBClient
  docClient: DynamoDBDocumentClient
  tableName: string

  constructor(tableNameSuffix: string) {
    this.client = new DynamoDBClient({
      endpoint: envDynamoDbEndpoint(),
      region: envDynamoDbRegion(),
      // TODO: remove in AWS - just for local testing
      credentials: {
        accessKeyId: 'fake',
        secretAccessKey: 'fake',
      },
    })
    this.docClient = DynamoDBDocumentClient.from(this.client)
    this.tableName = tableName({ tableNameSuffix: tableNameSuffix })
  }

  async queryBy({
    indexNameSuffix,
    conditions,
  }: {
    indexNameSuffix: string
    conditions: IndexQueryCondition[]
  }): Promise<ResourceType[] | undefined> {
    const queryCommand = createQuery({
      tableName: this.tableName,
      indexNameSuffix,
      conditions,
    })

    const command = new QueryCommand(queryCommand)
    const response = await this.docClient.send(command)

    return response.Items
  }

  async get({
    keys,
  }: {
    keys: ResourceAttributesType
  }): Promise<ResourceAttributesType | undefined> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: keys,
    })
    const response = await this.docClient.send(command)

    return response.Item
  }

  async create({
    attrs,
  }: {
    attrs: ResourceAttributesType
  }): Promise<ResourceAttributesType> {
    const item: ResourceType = { ...attrs }

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    })

    await this.docClient.send(command)

    return item
  }

  async update({
    keys,
    attrs,
  }: {
    keys: ResourceAttributesType
    attrs: ResourceAttributesType
  }): Promise<ResourceAttributesType | undefined> {
    const existingItem = await this.get({ keys })
    if (!existingItem) {
      return
    }

    const updatedItem: ResourceAttributesType = {
      ...existingItem,
      ...attrs,
    }

    const command = new PutCommand({
      TableName: this.tableName,
      Item: updatedItem,
    })

    await this.docClient.send(command)

    return updatedItem
  }

  async delete({ keys }: { keys: ResourceAttributesType }): Promise<boolean> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: keys,
      ReturnValues: 'ALL_OLD',
    })

    const response = await this.docClient.send(command)

    return response.Attributes !== undefined
  }
}

export default GenericResource
