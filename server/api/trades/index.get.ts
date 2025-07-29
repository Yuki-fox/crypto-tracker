import { db } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  if (!user) {
    console.error('No user in context')
    throw createError({
      statusCode: 401,
      statusMessage: 'Не авторизован'
    })
  }
  
  try {
    const trades = db.prepare(`
      SELECT id, symbol, type, price, quantity, date, parent_trade_id 
      FROM trades 
      WHERE user_id = ? 
      ORDER BY date DESC
    `).all(user.id)
    
    console.log(`Loaded ${trades.length} trades for user ${user.id}`)
    return trades || []
  } catch (error) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка базы данных'
    })
  }
})