/**
 * Auth Store - Zustand
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          // El login retorna { access_token, token_type, user }
          const response = await api.login(email, password)
          
          // Verificar si el usuario viene en la respuesta (nuevo backend)
          // o si necesitamos hacer una llamada adicional (backend viejo)
          let user = response.user
          if (!user) {
            // Fallback: obtener usuario con el token recién guardado
            user = await api.getMe()
          }
          
          set({ user, isAuthenticated: true, isLoading: false })
          return user
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          await api.register(userData)
          // Auto-login after register
          return get().login(userData.email, userData.password)
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      // Logout
      logout: () => {
        api.logout()
        set({ user: null, isAuthenticated: false, error: null })
      },

      // Check auth status
      checkAuth: async () => {
        const token = api.getToken()
        if (!token) {
          set({ user: null, isAuthenticated: false })
          return null
        }

        // Si ya tenemos usuario en el estado y estamos autenticados, no hacer llamada
        const currentState = get()
        if (currentState.user && currentState.isAuthenticated) {
          return currentState.user
        }

        try {
          const user = await api.getMe()
          set({ user, isAuthenticated: true })
          return user
        } catch (error) {
          // Token inválido o expirado, limpiar silenciosamente
          api.removeToken()
          set({ user: null, isAuthenticated: false, error: null })
          return null
        }
      },

      // Update user
      updateUser: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const user = await api.updateMe(userData)
          set({ user, isLoading: false })
          return user
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

export default useAuthStore

