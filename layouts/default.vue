<template>
  <div>
    <header class="header">
      <div class="container">
        <div class="header-content">
          <a href="/" class="logo" @click.prevent="refreshPage">
            <Icon name="btc" class="logo-icon" size="28" />
            <h1>Crypto Tracker</h1>
          </a>
          <div class="header-info">
            <div 
              class="pnl-display" 
              :class="totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative'"
              @mouseenter="showTooltip = true"
              @mouseleave="showTooltip = false"
            >
              <span class="pnl-label">Общий P&L</span>
              <span class="pnl-value">${{ (totalPnl || 0).toFixed(2) }}</span>
              <div v-if="showTooltip" class="pnl-tooltip">
                Реализованный P&L: ${{ (realizedPnl || 0).toFixed(2) }}
                <br>
                Нереализованный P&L: ${{ (unrealizedPnl || 0).toFixed(2) }}
              </div>
            </div>
            
            <!-- Калькулятор теперь между P&L и кнопкой выхода -->
            <ProfitCalculator 
              :positions="activePositions"
              :current-prices="currentPrices"
            />
            
            <button @click="logout" class="btn btn-secondary">
              <Icon name="sign-out" />
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
const realizedPnl = ref(0)
const unrealizedPnl = ref(0)
const showTooltip = ref(false)

// Добавляем состояния для калькулятора
const activePositions = ref([])
const currentPrices = ref({})

provide('updateTotalPnl', (value) => {
  totalPnl.value = value || 0
})

provide('updateRealizedPnl', (value) => {
  realizedPnl.value = value || 0
})
provide('updateUnrealizedPnl', (value) => {
  unrealizedPnl.value = value || 0
})

// Добавляем функции для обновления данных калькулятора
provide('updateActivePositions', (positions) => {
  activePositions.value = positions || []
})

provide('updateCurrentPrices', (prices) => {
  currentPrices.value = prices || {}
})

const refreshPage = () => {
  window.location.reload()
}
</script>

<style scoped>
.header {
  background: rgba(22, 24, 28, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  padding: var(--spacing-md) 0;
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
  gap: 8px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  color: var(--accent);
}

.logo h1 {
  font-size: 20px;
  font-weight: 700;
}

.header-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md); /* Уменьшили gap для компактности */
}

.pnl-display {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: help;
}

.pnl-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: var(--shadow);
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
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pnl-value {
  font-size: 18px;
  font-weight: 700;
}

.pnl-positive .pnl-value { color: var(--success); }
.pnl-negative .pnl-value { color: var(--danger); }

.main-content {
  padding: var(--spacing-lg) 0;
}

.btn-secondary {
  padding: 10px 20px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .logo h1 {
    font-size: 18px;
  }
}
</style>