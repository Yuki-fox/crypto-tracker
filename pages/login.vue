<template>
  <div class="login-page">
    <div class="login-container">
      <div class="card login-card">
        <div class="login-header">
          <span class="logo-icon">
            <Icon name="btc" size="48" />
          </span>
          <h1>Crypto Tracker</h1>
          <p>Войдите в свой аккаунт</p>
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>
              <Icon name="user" /> Логин
            </label>
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
            <label>
              <Icon name="lock" /> Пароль
            </label>
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
            <Icon v-if="loading" name="spinner" />
            <Icon v-else name="sign-in" />
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>
        </form>
        
        <transition name="fade">
          <div v-if="error" class="message message-error">
            <Icon name="exclamation-circle" /> {{ error }}
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
  color: var(--accent);
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

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-block {
  width: 100%;
  height: 48px;
  font-size: 16px;
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.message {
  margin-top: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>