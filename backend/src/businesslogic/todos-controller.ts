import * as uuid from 'uuid'
import * as createError from 'http-errors'

import { TodosDataLayer } from '../dbAccess/todosDataLayer'
import { TodosFileLayer } from '../fileAccess/todosFileLayer'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'


const logger = createLogger('TodosBusinessLogic')
const todoAttachment = new TodosFileLayer()

const listsAccess = new TodosDataLayer()


export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return listsAccess.getall(userId)
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
  const newTodo: TodoItem = {
    userId,
    todoId: uuid.v4(),
    ...createTodoRequest,
    done: false,
    createdAt: new Date().toISOString()
  }
  logger.info('Creating  todo', { newTodo })
  
  await listsAccess.create(newTodo)

  return newTodo
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> {
  await checkIfExists(userId, todoId)

  logger.info('Updating todo', { updateTodoRequest })

  await listsAccess.update(userId, todoId, updateTodoRequest)
}

export async function deleteTodo(userId: string, todoId: string) {
  await checkIfExists(userId, todoId)

  await listsAccess.delete(userId, todoId)
}

async function getById(userId: string, todoId: string): Promise<TodoItem> {
  const todo = await listsAccess.get(userId, todoId)
  if (!todo) {
    throw createError(404, JSON.stringify({
      error: 'TODO not found'
    }))
  }

  return todo
}

async function checkIfExists(userId: string, todoId: string) {
  await getById(userId, todoId)
}

export async function createAttachmentUrl(userId: string, todoId: string): Promise<string> {
  const todo = await getById(userId, todoId)
  console.log('todo', todo)
  const presignedUrl = todoAttachment.getUploadUrl(todoId)
  console.log('presigned url', presignedUrl)
  

  if (!todo.attachmentUrl) {
    const downloadUrl = todoAttachment.getDownloadUrl(todoId)
    console.log('download url', downloadUrl)
    await listsAccess.setAttachmentUrl(userId, todoId, downloadUrl)
    console.log('download url after await', downloadUrl)
  }

  return presignedUrl
} 