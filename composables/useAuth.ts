export const useAuth = () => {
  const user = useState<any>('auth.user', () => null)

  const login = async (username: string, password: string) => {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      })
      
      user.value = response.user
      
      // Принудительно обновляем страницу после логина для перезагрузки куки
      await navigateTo('/')
      if (process.client) {
        window.location.reload()
      }
      
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { 
        method: 'POST'
      })
      user.value = null
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const checkAuth = async () => {
    try {
      const response = await $fetch('/api/auth/me')
      user.value = response.user
      return response.user
    } catch {
      user.value = null
      return null
    }
  }

  return {
    user: readonly(user),
    login,
    logout,
    checkAuth
  }
}