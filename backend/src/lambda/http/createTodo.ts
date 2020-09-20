import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'
import { createTodo } from '../../businesslogic/todos-controller'
import { getUserId } from '../utils'

const logger = createLogger('createTodoHandler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('create todo', event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const list = await createTodo(getUserId(event), newTodo)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: list
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)