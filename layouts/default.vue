<template>
  <div>
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <span class="logo-icon">₿</span>
            <h1>Crypto Tracker</h1>
          </div>
          <div class="header-info">
            <div class="pnl-display" :class="totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative'">
              <span class="pnl-label">Общий P&L</span>
              <span class="pnl-value">${{ (totalPnl || 0).toFixed(2) }}</span>
            </div>
            <button @click="logout" class="btn btn-secondary">
              Выйти
            </button>
          </div>
        </div>
      </div>
    </header>
    <main class="main-content">
      <div class="container">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
const { logout } = useAuth()
const totalPnl = ref(0)

provide('updateTotalPnl', (value) => {
  totalPnl.value = value || 0
})
</script>

<style scoped>
.header {
  background: rgba(22, 24, 28, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  padding: var(--spacing-lg) 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  color: var(--accent);
  font-weight: bold;
}

.logo h1 {
  font-size: 24px;
  font-weight: 700;
}

.header-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.pnl-display {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pnl-display.pnl-positive {
  border-color: rgba(16, 185, 129, 0.3);
  background: var(--success-bg);
}

.pnl-display.pnl-negative {
  border-color: rgba(239, 68, 68, 0.3);
  background: var(--danger-bg);
}

.pnl-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pnl-value {
  font-size: 20px;
  font-weight: 700;
}

.pnl-positive .pnl-value { color: var(--success); }
.pnl-negative .pnl-value { color: var(--danger); }

.main-content {
  padding: var(--spacing-xl) 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .logo h1 {
    font-size: 20px;
  }
}
</style>