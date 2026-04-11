import { useState, useEffect, useCallback, useMemo } from 'react'
import { CartContext } from './cartStore'

const STORAGE_KEY = 'tevra_cart'
const AGENT_KEY = 'tevra_selected_agent'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function loadAgent() {
  try {
    const raw = localStorage.getItem(AGENT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [selectedAgent, setSelectedAgentState] = useState(loadAgent)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    if (selectedAgent) {
      localStorage.setItem(AGENT_KEY, JSON.stringify(selectedAgent))
    } else {
      localStorage.removeItem(AGENT_KEY)
    }
  }, [selectedAgent])

  const addItem = useCallback((product) => {
    setItems(prev => {
      const exists = prev.find(i => i.productId === product.productId)
      if (exists) {
        return prev.map(i =>
          i.productId === product.productId
            ? { ...i, qty: i.qty + (product.qty || 1) }
            : i
        )
      }
      return [...prev, {
        productId: product.productId,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand || '',
        qty: product.qty || 1,
      }]
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }, [])

  const updateQty = useCallback((productId, qty) => {
    if (qty < 1) return
    setItems(prev => prev.map(i =>
      i.productId === productId ? { ...i, qty } : i
    ))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setSelectedAgentState(null)
  }, [])

  const setSelectedAgent = useCallback((agent) => {
    setSelectedAgentState(agent)
  }, [])

  const getCount = useCallback(() => {
    return items.reduce((sum, i) => sum + i.qty, 0)
  }, [items])

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, i) => sum + (i.price * i.qty), 0)
  }, [items])

  const value = useMemo(() => ({
    items,
    selectedAgent,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    setSelectedAgent,
    getCount,
    getSubtotal,
  }), [items, selectedAgent, addItem, removeItem, updateQty, clearCart, setSelectedAgent, getCount, getSubtotal])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
