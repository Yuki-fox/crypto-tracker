import { db } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Не авторизован'
    })
  }

  try {
    // Начинаем транзакцию
    db.exec('BEGIN TRANSACTION')
    
    // Удаляем связанные продажи (где parent_trade_id = id)
    db.prepare(`
      DELETE FROM trades 
      WHERE parent_trade_id = ? AND user_id = ?
    `).run(id, user.id)
    
    // Удаляем саму позицию
    const result = db.prepare(`
      DELETE FROM trades 
      WHERE id = ? AND user_id = ?
    `).run(id, user.id)

    if (result.changes === 0) {
      db.exec('ROLLBACK')
      throw createError({
        statusCode: 404,
        statusMessage: 'Позиция не найдена'
      })
    }

    db.exec('COMMIT')
    
    return { success: true }
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('Error deleting trade:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при удалении'
    })
  }
})