import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTodo } from '../../businesslogic/todos-controller'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodoHandler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('delete todo', event)
    const todoId = event.pathParameters.todoId
    await deleteTodo(getUserId(event), todoId)

    return {
      statusCode: 200,
      body: ''
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)