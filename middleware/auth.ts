export default defineNuxtRouteMiddleware((to) => {
  // Только для страницы логина пропускаем
  if (to.path === '/login') return
  
  // На сервере не проверяем
  if (!process.client) return
  
  // Проверяем наличие куки
  const authToken = useCookie('auth-token')
  
  if (!authToken.value) {
    return navigateTo('/login')
  }
})