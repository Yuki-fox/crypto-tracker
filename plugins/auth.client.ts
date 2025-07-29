export default defineNuxtPlugin(async () => {
    const { checkAuth } = useAuth()
    
    // Проверяем авторизацию при загрузке приложения
    try {
      await checkAuth()
    } catch (error) {
      console.log('Not authenticated')
    }
  })