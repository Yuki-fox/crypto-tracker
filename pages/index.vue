<template>
  <div>
    <PriceMonitor :prices="prices" />
    
    <div class="adaptive-grid">
      <div class="form-section">
        <TradeForm 
          ref="tradeForm"
          @added="handleTradeAdded" 
          @updated="handleTradeUpdated"
        />
      </div>
      
      <div class="positions-section">
        <ActivePositions 
          :positions="activePositions" 
          :prices="prices"
          @edit="editTrade"
          @refresh="loadTrades"
        />
      </div>
    </div>
    
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

// Комиссия Binance
const TRADING_FEE = 0.00075 // 0.075%

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
      // Расчет с учетом комиссий
      const buyTotal = position.sellQuantity * position.buyPrice
      const buyFee = buyTotal * TRADING_FEE // Комиссия при покупке
      const sellTotal = position.sellQuantity * position.sellPrice
      const sellFee = sellTotal * TRADING_FEE // Комиссия при продаже
      
      // P&L = (сумма продажи - комиссия продажи) - (сумма покупки + комиссия покупки)
      position.pnl = (sellTotal - sellFee) - (buyTotal + buyFee)
      position.pnlPercent = (buyTotal + buyFee) > 0 ? (position.pnl / (buyTotal + buyFee)) * 100 : 0
    } else if (!position.closed && prices.value && prices.value[position.symbol]) {
      // Для нереализованного P&L тоже учитываем комиссии
      const buyTotal = position.buyQuantity * position.buyPrice
      const buyFee = buyTotal * TRADING_FEE
      const currentTotal = position.buyQuantity * prices.value[position.symbol]
      const potentialSellFee = currentTotal * TRADING_FEE
      
      // Нереализованный P&L = (потенциальная сумма продажи - комиссия) - (сумма покупки + комиссия)
      position.unrealizedPnl = (currentTotal - potentialSellFee) - (buyTotal + buyFee)
      position.unrealizedPnlPercent = (buyTotal + buyFee) > 0 ? (position.unrealizedPnl / (buyTotal + buyFee)) * 100 : 0
    }
    
    positionsList.push(position)
    processedBuyIds.add(buyTrade.id)
  })
  
  return positionsList.sort((a, b) => 
    new Date(b.buyDate || 0).getTime() - new Date(a.buyDate || 0).getTime()
  )
})

const activePositions = computed(() => positions.value.filter(p => !p.closed))
const closedPositions = computed(() => positions.value.filter(p => p.closed))

const updateTotalPnl = inject('updateTotalPnl', () => {})
const updateRealizedPnl = inject('updateRealizedPnl', () => {})
const updateUnrealizedPnl = inject('updateUnrealizedPnl', () => {})
const updateActivePositions = inject('updateActivePositions', () => {})
const updateCurrentPrices = inject('updateCurrentPrices', () => {})

watchEffect(() => {
  const total = positions.value.reduce((sum, pos) => {
    if (pos.closed && typeof pos.pnl === 'number') {
      return sum + pos.pnl
    } else if (!pos.closed && typeof pos.unrealizedPnl === 'number') {
      return sum + pos.unrealizedPnl
    }
    return sum
  }, 0)
  
  const realized = positions.value
    .filter(p => p.closed)
    .reduce((sum, pos) => sum + (pos.pnl || 0), 0)
  const unrealized = positions.value
    .filter(p => !p.closed)
    .reduce((sum, pos) => sum + (pos.unrealizedPnl || 0), 0)
  
  updateTotalPnl(total)
  updateRealizedPnl(realized)
  updateUnrealizedPnl(unrealized)  // Добавьте эту строку
  updateActivePositions(activePositions.value)
  updateCurrentPrices(prices.value)
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
      const data = await $fetch(`/api/prices?symbols=${symbols}`)
      prices.value = data || {}
    } catch (error) {
      console.error('Error loading prices:', error)
      prices.value = {}
    }
  }
}

const handleTradeAdded = async () => {
  await loadTrades()
  await loadPrices()
}

const handleTradeUpdated = async () => {
  await loadTrades()
  await loadPrices()
}

const editTrade = (trade) => {
  if (!trade || !tradeForm.value) return
  tradeForm.value.editTrade(trade)
}

onMounted(async () => {
  await loadTrades()
})

const { pause, resume } = useIntervalFn(async () => {
  await loadPrices()
}, 30000)

watch(trades, async (newTrades) => {
  if (newTrades && newTrades.length > 0) {
    await loadPrices()
  }
}, { immediate: true })

onUnmounted(() => {
  pause()
})
</script>

<style scoped>
.adaptive-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  grid-template-areas: 
    "form positions";
  gap: 30px;
  align-items: start;
}

.form-section {
  grid-area: form;
  position: sticky;
  top: 90px;
}

.positions-section {
  grid-area: positions;
  min-height: 100%;
}

@media (min-width: 901px) {
  .positions-section {
    display: flex;
    flex-direction: column;
  }
  
  .positions-section > * {
    flex: 1;
  }
}

@media (max-width: 900px) {
  .adaptive-grid {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "form"
      "positions";
  }
  
  .form-section {
    position: static;
  }
}
</style>