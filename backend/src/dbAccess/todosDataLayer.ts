import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccessDataLayer')


export class TodosDataLayer {
  public constructor(
    private readonly documentClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly createdAtIndex = process.env.TODOS_CREATED_AT_INDEX
  ) { }

  async getall(userId: string) {
    logger.info('Gettin all todos for userId:', userId)

    const result = await this.documentClient
      .query({
        TableName: this.todosTable,
        IndexName: this.createdAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();

    const items = result.Items;
    return items as TodoItem[];
  }

async get(todoId: string, userId: string) {
    logger.info('Getting a todo by Id', {userId, todoId})
    
    const result = await this.documentClient.get({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      }).promise()

    const item = result.Item;
    return item as TodoItem;
  }

   async create(todoItem: TodoItem) {
    logger.info('Creating a todoitem', todoItem)

    await this.documentClient
      .put({
        TableName: this.todosTable,
        Item: todoItem,
      })
      .promise();
      return todoItem
  }

  async update(userId: string, todoId: string, todoUpdate: TodoUpdate) {
    logger.info('Updating a todo', {userId, todoId, todoUpdate})
    await this.documentClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId, 
          todoId
        },
        UpdateExpression:
          'set #n = :name, done = :done, dueDate = :dueDate',
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':done': todoUpdate.done,
          ':dueDate': todoUpdate.dueDate,
        },
        ExpressionAttributeNames: {
          '#n': 'name', 
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise();
  }

 async setAttachmentUrl(userId: string, todoId: string, attachmentUrl: string) {
    await this.documentClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl,
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise();
  }

  async delete(userId: string, todoId: string ) {
    logger.info('Deleting a todo by Id', {userId, todoId})
    await this.documentClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId,
        },
      }).promise()
  }
}