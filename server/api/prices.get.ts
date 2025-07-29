import axios from 'axios'

export default defineEventHandler(async (event) => {
  const symbols = getQuery(event).symbols as string
  
  if (!symbols) {
    return {}
  }

  const config = useRuntimeConfig()
  const prices: Record<string, number> = {}

  for (const symbol of symbols.split(',')) {
    try {
      const response = await axios.get(
        `${config.public.binanceApiUrl}/api/v3/ticker/price?symbol=${symbol}USDT`
      )
      prices[symbol] = parseFloat(response.data.price)
    } catch (error) {
      console.error(`Ошибка получения цены для ${symbol}:`, error)
    }
  }

  return prices
})