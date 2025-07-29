<template>
  <div>
    <PriceMonitor :prices="prices" />
    
    <!-- Верхняя секция: форма слева, активные позиции справа -->
    <div class="grid">
      <div class="grid-item">
        <TradeForm 
          ref="tradeForm"
          @added="handleTradeAdded" 
          @updated="handleTradeUpdated"
        />
      </div>
      
      <div class="grid-item">
        <ActivePositions 
          :positions="activePositions" 
          :prices="prices"
          @edit="editTrade"
          @refresh="loadTrades"
        />
      </div>
    </div>
    
    <!-- Нижняя секция: закрытые позиции на всю ширину -->
    <div style="margin-top: var(--spacing-xl);">
      <ClosedPositions 
        :positions="closedPositions"
        @refresh="loadTrades"
      />
    </div>
  </div>
</template>

<script setup>
const trades = ref([])
const prices = ref({})
const tradeForm = ref(null)
const router = useRouter()

// Вычисляем позиции
const positions = computed(() => {
  if (!trades.value || !Array.isArray(trades.value)) return []
  
  const positionsList = []
  const processedBuyIds = new Set()
  
  trades.value.filter(t => t && t.type === 'buy').forEach(buyTrade => {
    if (!buyTrade || processedBuyIds.has(buyTrade.id)) return
    
    const sellTrade = trades.value.find(t => 
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
      pnl: 0,
      pnlPercent: 0,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0
    }
    
    if (position.closed && sellTrade) {
      const buyTotal = position.sellQuantity * position.buyPrice
      const sellTotal = position.sellQuantity * position.sellPrice
      position.pnl = sellTotal - buyTotal
      position.pnlPercent = buyTotal > 0 ? (position.pnl / buyTotal) * 100 : 0
    } else if (!position.closed && prices.value && prices.value[position.symbol]) {
      const buyTotal = position.buyQuantity * position.buyPrice
      const currentTotal = position.buyQuantity * prices.value[position.symbol]
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

// Разделяем на активные и закрытые
const activePositions = computed(() => positions.value.filter(p => !p.closed))
const closedPositions = computed(() => positions.value.filter(p => p.closed))

// Обновляем общий P&L
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

const loadTrades = async () => {
  try {
    console.log('Loading trades...')
    const data = await $fetch('/api/trades')
    trades.value = Array.isArray(data) ? data : []
    console.log('Trades loaded:', trades.value)
  } catch (error) {
    console.error('Error loading trades:', error)
    if (error.statusCode === 401) {
      await router.push('/login')
    } else {
      trades.value = []
    }
  }
}

const loadPrices = async () => {
  if (!trades.value || trades.value.length === 0) return
  
  const symbols = [...new Set(trades.value.map(t => t?.symbol).filter(Boolean))].join(',')
  if (symbols) {
    try {
      console.log('Loading prices for:', symbols)
      const data = await $fetch(`/api/prices?symbols=${symbols}`)
      prices.value = data || {}
      console.log('Prices loaded:', prices.value)
    } catch (error) {
      console.error('Error loading prices:', error)
      prices.value = {}
    }
  }
}

const handleTradeAdded = async () => {
  console.log('Trade added, reloading...')
  await loadTrades()
  await loadPrices()
}

const handleTradeUpdated = async () => {
  console.log('Trade updated, reloading...')
  await loadTrades()
  await loadPrices()
}

const editTrade = (trade) => {
  if (!trade || !tradeForm.value) return
  tradeForm.value.editTrade(trade)
}

// Загружаем данные при монтировании
onMounted(async () => {
  await loadTrades()
})

// Обновление цен каждые 30 секунд
const { pause, resume } = useIntervalFn(async () => {
  await loadPrices()
}, 30000)

// Следим за изменениями trades
watch(trades, async (newTrades) => {
  console.log('Trades changed:', newTrades)
  if (newTrades && newTrades.length > 0) {
    await loadPrices()
  }
}, { immediate: true })

onUnmounted(() => {
  pause()
})
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 30px;
}

.grid-item {
  min-width: 0;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>