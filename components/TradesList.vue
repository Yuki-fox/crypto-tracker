<template>
  <div class="card">
    <div class="card-header">
      <h2>📈 История позиций</h2>
      <span class="badge badge-secondary">{{ positions.length }}</span>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Загрузка позиций...</span>
    </div>
    
    <div v-else-if="!trades || trades.length === 0" class="empty-state">
      <div class="empty-state-icon">📊</div>
      <p class="empty-state-title">Нет открытых позиций</p>
      <span class="empty-state-text">Начните с добавления первой сделки</span>
    </div>
    
    <div v-else class="positions-list">
      <div v-for="position in positions" :key="position.id" class="position-item" :class="{ closed: position.closed }">
        <div class="position-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="badge" :class="position.symbol === 'BTC' ? 'badge-btc' : 'badge-xrp'">
              {{ position.symbol }}
            </span>
            <span class="status" :class="position.closed ? 'status-closed' : 'status-open'">
              {{ position.closed ? '🔒 Закрыта' : '🟢 Открыта' }}
            </span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button @click="editPosition(position)" class="btn-icon" :title="position.closed ? 'Просмотр' : 'Продать'">
              {{ position.closed ? '👁️' : '💰' }}
            </button>
            <!-- Показываем кнопку удаления для всех позиций -->
            <button @click="deletePosition(position.id)" class="btn-icon btn-icon-danger" title="Удалить позицию">
              🗑️
            </button>
          </div>
        </div>
        
        <div class="trades-grid">
          <div class="trade-box buy">
            <div class="trade-label">Покупка</div>
            <div class="trade-amount">{{ position.buyQuantity }} × ${{ position.buyPrice?.toFixed(2) || '0.00' }}</div>
            <div class="trade-total">${{ ((position.buyQuantity || 0) * (position.buyPrice || 0)).toFixed(2) }}</div>
            <div class="trade-date">{{ formatDate(position.buyDate) }}</div>
          </div>
          
          <div v-if="position.sellPrice" class="trade-box sell">
            <div class="trade-label">Продажа</div>
            <div class="trade-amount">{{ position.sellQuantity }} × ${{ position.sellPrice?.toFixed(2) || '0.00' }}</div>
            <div class="trade-total">${{ ((position.sellQuantity || 0) * (position.sellPrice || 0)).toFixed(2) }}</div>
            <div class="trade-date">{{ formatDate(position.sellDate) }}</div>
          </div>
        </div>
        
        <div v-if="position.remainingQuantity > 0 && position.closed" class="message message-info">
          ℹ️ Остаток {{ position.remainingQuantity }} {{ position.symbol }} перенесен в новую позицию
        </div>
        
        <div class="position-footer">
          <div v-if="position.closed && position.pnl !== undefined" class="pnl" :class="position.pnl >= 0 ? 'profit' : 'loss'">
            <span>P&L:</span>
            <strong>${{ (position.pnl || 0).toFixed(2) }} ({{ position.pnl >= 0 ? '+' : '' }}{{ (position.pnlPercent || 0).toFixed(2) }}%)</strong>
          </div>
          <div v-else-if="prices && prices[position.symbol]" class="pnl-current">
            <div>
              <span>Текущая:</span>
              <strong>${{ prices[position.symbol]?.toFixed(2) || '0.00' }}</strong>
            </div>
            <div class="pnl" :class="(position.unrealizedPnl || 0) >= 0 ? 'profit' : 'loss'">
              <strong>${{ (position.unrealizedPnl || 0).toFixed(2) }} ({{ (position.unrealizedPnl || 0) >= 0 ? '+' : '' }}{{ (position.unrealizedPnlPercent || 0).toFixed(2) }}%)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Отладочная информация (отключена) -->
    <div v-if="false" style="margin-top: 20px; padding: 10px; background: #333; border-radius: 4px; font-size: 12px;">
      <p>Trades data:</p>
      <pre>{{ JSON.stringify(trades, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import Loading from './UI/Loading.vue'
import EmptyState from './UI/EmptyState.vue'

const props = defineProps({
  trades: {
    type: Array,
    default: () => []
  },
  prices: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['edit', 'refresh'])
const loading = ref(false)

const positions = computed(() => {
  console.log('Computing positions from trades:', props.trades)
  
  if (!props.trades || !Array.isArray(props.trades)) {
    console.warn('Trades is not an array:', props.trades)
    return []
  }
  
  const positionsList = []
  const processedBuyIds = new Set()
  
  props.trades.filter(t => t && t.type === 'buy').forEach(buyTrade => {
    if (!buyTrade || processedBuyIds.has(buyTrade.id)) return
    
    const sellTrade = props.trades.find(t => 
      t && t.type === 'sell' && t.parent_trade_id === buyTrade.id
    )
    
    const position = {
      id: buyTrade.id,
      symbol: buyTrade.symbol || 'UNKNOWN',
      buyPrice: buyTrade.price || 0,
      buyQuantity: buyTrade.quantity || 0,
      buyDate: buyTrade.date,
      closed: !!sellTrade,
      sellPrice: sellTrade?.price || null,
      sellQuantity: sellTrade?.quantity || 0,
      sellDate: sellTrade?.date || null,
      remainingQuantity: (buyTrade.quantity || 0) - (sellTrade?.quantity || 0),
      hasChildTrades: false,
      pnl: 0,
      pnlPercent: 0,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0
    }
    
    position.hasChildTrades = props.trades.some(t => 
      t && t.type === 'buy' && t.parent_trade_id === buyTrade.id
    )
    
    if (position.closed && sellTrade) {
      const buyTotal = position.sellQuantity * position.buyPrice
      const sellTotal = position.sellQuantity * position.sellPrice
      position.pnl = sellTotal - buyTotal
      position.pnlPercent = buyTotal > 0 ? (position.pnl / buyTotal) * 100 : 0
    } else if (!position.closed && props.prices && props.prices[position.symbol]) {
      const buyTotal = position.buyQuantity * position.buyPrice
      const currentTotal = position.buyQuantity * props.prices[position.symbol]
      position.unrealizedPnl = currentTotal - buyTotal
      position.unrealizedPnlPercent = buyTotal > 0 ? (position.unrealizedPnl / buyTotal) * 100 : 0
    }
    
    positionsList.push(position)
    processedBuyIds.add(buyTrade.id)
  })
  
  return positionsList.sort((a, b) => 
    new Date(b.buyDate || 0).getTime() - new Date(a.buyDate || 0).getTime()
  )
})

const updateTotalPnl = inject('updateTotalPnl', () => {})

watchEffect(() => {
  const total = positions.value.reduce((sum, pos) => {
    if (pos.closed && typeof pos.pnl === 'number') {
      return sum + pos.pnl
    } else if (!pos.closed && typeof pos.unrealizedPnl === 'number') {
      return sum + pos.unrealizedPnl
    }
    return sum
  }, 0)
  
  updateTotalPnl(total)
})

const formatDate = (date) => {
  if (!date) return 'Н/Д'
  try {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return date
  }
}

const editPosition = (position) => {
  if (!position) return
  emit('edit', position)
}

const deletePosition = async (id) => {
  if (!id) return
  
  // Более информативное подтверждение
  const confirmMessage = 'Удалить позицию? Это действие нельзя отменить.\n\n' +
                        'Будут удалены все связанные сделки (покупка и продажа).'
  
  if (confirm(confirmMessage)) {
    try {
      loading.value = true
      await $fetch(`/api/trades/${id}`, { method: 'DELETE' })
      
      // Убрали сообщение об успешном удалении
      
      emit('refresh')
    } catch (error) {
      console.error('Error deleting position:', error)
      alert('Ошибка при удалении позиции: ' + (error.data?.statusMessage || error.message))
    } finally {
      loading.value = false
    }
  }
}
</script>

<style scoped>
.positions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.position-item {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--spacing-lg);
  transition: all 0.3s ease;
}

.position-item:hover {
  border-color: var(--accent);
  transform: translateX(4px);
}

.position-item.closed {
  opacity: 0.8;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.trades-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.trade-box {
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.trade-box.sell:not(:has(.trade-amount)) {
  display: none;
}

.trade-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.trade-box.buy .trade-label { color: var(--success); }
.trade-box.sell .trade-label { color: var(--danger); }

.trade-amount {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.trade-total {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.trade-date {
  font-size: 12px;
  color: var(--text-muted);
}

.position-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border);
}

.pnl-current {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent);
  border: 1px solid rgba(59, 130, 246, 0.2);
  font-size: 13px;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius);
}

.btn-icon-danger:hover {
  background: var(--danger) !important;
  border-color: var(--danger) !important;
  color: white !important;
}

.badge-btc {
  background: rgba(247, 147, 26, 0.1);
  color: #f7931a;
}

.badge-xrp {
  background: rgba(35, 41, 47, 0.1);
  color: #ffffff;
}

/* Состояния загрузки и пустой список */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.empty-state-text {
  font-size: 14px;
}

@media (max-width: 768px) {
  .trades-grid {
    grid-template-columns: 1fr;
  }
}
</style>