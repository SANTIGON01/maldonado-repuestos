/**
 * Local Cart Store - Zustand con localStorage
 * Carrito que funciona SIN autenticación para cotizaciones
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLocalCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Agregar item al carrito
      addItem: (product, quantity = 1) => {
        const { items } = get()
        const existingIndex = items.findIndex(item => item.product.id === product.id)
        
        if (existingIndex >= 0) {
          // Si ya existe, actualizar cantidad
          const newItems = [...items]
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + quantity
          }
          set({ items: newItems })
        } else {
          // Si no existe, agregar nuevo
          set({ 
            items: [...items, { 
              id: Date.now(), // ID local temporal
              product: {
                id: product.id,
                code: product.code,
                name: product.name,
                brand: product.brand,
                image_url: product.image_url,
                price: product.price,
                stock: product.stock,
              },
              quantity 
            }] 
          })
        }
      },

      // Actualizar cantidad de un item
      updateQuantity: (itemId, quantity) => {
        const { items } = get()
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set({
          items: items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        })
      },

      // Eliminar item
      removeItem: (itemId) => {
        const { items } = get()
        set({ items: items.filter(item => item.id !== itemId) })
      },

      // Limpiar carrito
      clearCart: () => set({ items: [] }),

      // Obtener cantidad total de items
      getItemsCount: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      // Verificar si un producto está en el carrito
      isInCart: (productId) => {
        const { items } = get()
        return items.some(item => item.product.id === productId)
      },

      // Obtener item por producto ID
      getItem: (productId) => {
        const { items } = get()
        return items.find(item => item.product.id === productId)
      },
    }),
    {
      name: 'maldonado-quote-cart', // nombre en localStorage
    }
  )
)

export default useLocalCartStore

