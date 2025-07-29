import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ''
  
  // Пропускаем все, кроме защищенных API маршрутов
  const protectedRoutes = ['/api/trades']
  const isProtected = protectedRoutes.some(route => url.startsWith(route))
  
  if (!isProtected) {
    return
  }

  const user = getUserFromEvent(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Требуется авторизация'
    })
  }

  event.context.user = user
})