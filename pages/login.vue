<template>
  <div class="login-page">
    <div class="login-container">
      <div class="card login-card">
        <div class="login-header">
          <span class="logo-icon">₿</span>
          <h1>Crypto Tracker</h1>
          <p>Войдите в свой аккаунт</p>
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>Логин</label>
            <input
              v-model="form.username"
              type="text"
              class="input"
              placeholder="Введите логин"
              required
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label>Пароль</label>
            <input
              v-model="form.password"
              type="password"
              class="input"
              placeholder="Введите пароль"
              required
              :disabled="loading"
            />
          </div>
          
          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>
        </form>
        
        <transition name="fade">
          <div v-if="error" class="message message-error">
            {{ error }}
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
const { login } = useAuth()
const form = ref({ username: '', password: '' })
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  try {
    await login(form.value.username, form.value.password)
  } catch (e) {
    console.error('Login error:', e)
    error.value = e.data?.statusMessage || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-card {
  backdrop-filter: blur(20px);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.logo-icon {
  font-size: 48px;
  color: var(--accent);
  font-weight: bold;
  display: block;
  margin-bottom: var(--spacing-md);
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 16px;
}

form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.btn-block {
  width: 100%;
  height: 48px;
  font-size: 16px;
  margin-top: 8px;
}

.message {
  margin-top: var(--spacing-lg);
}
</style>