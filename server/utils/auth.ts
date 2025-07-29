import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'

export interface User {
  id: number
  username: string
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(user: User): string {
  const config = useRuntimeConfig()
  return jwt.sign({ id: user.id, username: user.username }, config.jwtSecret, {
    expiresIn: '30d'
  })
}

export function verifyToken(token: string): User | null {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtSecret) as User
  } catch {
    return null
  }
}

export function getUserFromEvent(event: H3Event): User | null {
  // Пробуем получить токен из куки
  const token = getCookie(event, 'auth-token')
  
  if (!token) {
    // Пробуем из заголовка для отладки
    const authHeader = getHeader(event, 'authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const headerToken = authHeader.substring(7)
      return verifyToken(headerToken)
    }
    return null
  }
  
  return verifyToken(token)
}