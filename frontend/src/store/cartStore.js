/**
 * Cart Store - Zustand
 */
import { create } from 'zustand'
import api from '../lib/api'

export const useCartStore = create((set, get) => ({
  items: [],
  itemsCount: 0,
  subtotal: 0,
  shippingEstimate: 0,
  total: 0,
  isLoading: false,
  error: null,

  // Fetch cart from API
  fetchCart: async () => {
    set({ isLoading: true, error: null })
    try {
      const cart = await api.getCart()
      set({
        items: cart.items,
        itemsCount: cart.items_count,
        subtotal: cart.subtotal,
        shippingEstimate: cart.shipping_estimate,
        total: cart.total,
        isLoading: false,
      })
      return cart
    } catch (error) {
      set({ error: error.message, isLoading: false })
      // If not authenticated, clear cart
      if (error.message.includes('401') || error.message.includes('Sesión')) {
        set({ items: [], itemsCount: 0, subtotal: 0, total: 0 })
      }
      throw error
    }
  },

  // Add item to cart
  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null })
    try {
      await api.addToCart(productId, quantity)
      await get().fetchCart()
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Update item quantity
  updateQuantity: async (itemId, quantity) => {
    set({ isLoading: true, error: null })
    try {
      await api.updateCartItem(itemId, quantity)
      await get().fetchCart()
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Remove item from cart
  removeItem: async (itemId) => {
    set({ isLoading: true, error: null })
    try {
      await api.removeCartItem(itemId)
      await get().fetchCart()
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Clear entire cart
  clearCart: async () => {
    set({ isLoading: true, error: null })
    try {
      await api.clearCart()
      set({
        items: [],
        itemsCount: 0,
        subtotal: 0,
        shippingEstimate: 0,
        total: 0,
        isLoading: false,
      })
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Reset cart (local only, for logout)
  resetCart: () => {
    set({
      items: [],
      itemsCount: 0,
      subtotal: 0,
      shippingEstimate: 0,
      total: 0,
      error: null,
    })
  },

  // Clear error
  clearError: () => set({ error: null }),
}))

export default useCartStore

