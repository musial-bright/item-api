import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

import { ResourceType } from './types'
import { dynamoDbUrl } from '../config/variableConfig'
import { tableName } from '../utils/tableName'

const endpoint = dynamoDbUrl

class Resource {
  client: DynamoDBClient
  docClient: DynamoDBDocumentClient
  tableName: string

  constructor(tableNameSuffix: string) {
    this.client = new DynamoDBClient({
      endpoint: endpoint,
    })
    this.docClient = DynamoDBDocumentClient.from(this.client)
    this.tableName = tableName({ tableNameSuffix: tableNameSuffix })
  }

  async queryBy({
    indexNameSuffix,
    attributeName,
    attributeValue,
    condition,
  }: {
    indexNameSuffix: string
    attributeName: string
    attributeValue: string
    condition: string
  }) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: `${this.tableName}-${indexNameSuffix}`,
      KeyConditionExpression: `#attrName ${condition} :attrValue`,
      ExpressionAttributeNames: {
        '#attrName': attributeName,
      },
      ExpressionAttributeValues: {
        ':attrValue': attributeValue,
      },
    })
    const response = await this.docClient.send(command)

    return response.Items
  }

  async get({ id }: { id: string }) {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    })
    const response = await this.docClient.send(command)

    return response.Item
  }

  async create({ attrs }: { attrs: ResourceType }) {
    const item = {
      id: uuidv4(),
      ...attrs,
    }

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    })

    await this.docClient.send(command)

    return item
  }

  async update({ id, attrs }: { id: string; attrs: ResourceType }) {
    const existingItem = await this.get({ id })
    if (!existingItem) {
      return
    }

    const updatedItem = {
      ...existingItem,
      id: existingItem.id as string,
      ...attrs,
    }

    const command = new PutCommand({
      TableName: this.tableName,
      Item: updatedItem,
    })

    await this.docClient.send(command)

    return updatedItem
  }

  async delete({ id }: { id: string }) {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
      ReturnValues: 'ALL_OLD',
    })

    const response = await this.docClient.send(command)

    return response.Attributes !== undefined
  }
}

export default Resource
