import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { getUserId } from '../utils'
import { cors } from 'middy/middlewares'
import { getTodosForUser } from '../../businesslogic/todos-controller'
import { createLogger } from '../../utils/logger'

const logger = createLogger('get all todos for this userid')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todos = await getTodosForUser(getUserId(event))
    logger.info('get todos', event)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: todos
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
