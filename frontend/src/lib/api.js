/**
 * API Client for Maldonado Repuestos Backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

class ApiClient {
  constructor() {
    this.baseUrl = API_URL
  }

  getToken() {
    return localStorage.getItem('token')
  }

  setToken(token) {
    localStorage.setItem('token', token)
  }

  removeToken() {
    localStorage.removeItem('token')
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getToken()

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      this.removeToken()
      // No redirigir, solo limpiar token y lanzar error
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || 'Error en la solicitud')
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  }

  // Auth
  async login(email, password) {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || 'Error de autenticación')
    }

    const data = await response.json()
    // Guardar token inmediatamente
    this.setToken(data.access_token)
    
    // Retorna { access_token, token_type, user }
    // El user ya viene incluido, no necesitamos llamar a getMe()
    return data
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getMe() {
    return this.request('/auth/me')
  }

  async updateMe(userData) {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  logout() {
    this.removeToken()
  }

  // Categories
  async getCategories(activeOnly = true) {
    return this.request(`/categories?active_only=${activeOnly}`)
  }

  async getCategory(slug) {
    return this.request(`/categories/${slug}`)
  }

  // Products
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value)
      }
    })
    return this.request(`/products?${searchParams}`)
  }

  async searchProducts(query, page = 1, pageSize = 12) {
    return this.request(`/products/search?q=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`)
  }

  async getProduct(id) {
    return this.request(`/products/${id}`)
  }

  async getProductByCode(code) {
    return this.request(`/products/code/${code}`)
  }

  // Cart
  async getCart() {
    return this.request('/cart')
  }

  async addToCart(productId, quantity = 1) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    })
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    })
  }

  async removeCartItem(itemId) {
    return this.request(`/cart/${itemId}`, { method: 'DELETE' })
  }

  async clearCart() {
    return this.request('/cart', { method: 'DELETE' })
  }

  // Orders
  async createOrder(shippingData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(shippingData),
    })
  }

  async getOrders(page = 1, pageSize = 10) {
    return this.request(`/orders?page=${page}&page_size=${pageSize}`)
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`)
  }

  // Payments
  async createPaymentPreference(orderId) {
    return this.request(`/payments/create-preference/${orderId}`, {
      method: 'POST',
    })
  }

  async getPaymentStatus(orderId) {
    return this.request(`/payments/status/${orderId}`)
  }

  // Quotes
  async createQuote(quoteData) {
    return this.request('/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    })
  }

  /**
   * Crear cotización con items (para WhatsApp)
   * @param {Object} quoteData - Datos del cliente y items
   */
  async createQuoteWhatsApp(quoteData) {
    return this.request('/quotes/whatsapp', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    })
  }

  async getMyQuotes() {
    return this.request('/quotes/my-quotes')
  }

  // Banners
  async getBanners(activeOnly = true) {
    return this.request(`/banners?active_only=${activeOnly}`)
  }

  async getAllBanners() {
    return this.request('/banners/all')
  }

  async createBanner(bannerData) {
    return this.request('/banners', {
      method: 'POST',
      body: JSON.stringify(bannerData),
    })
  }

  async updateBanner(id, bannerData) {
    return this.request(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bannerData),
    })
  }

  async deleteBanner(id) {
    return this.request(`/banners/${id}`, { method: 'DELETE' })
  }

  // Upload de imágenes
  async uploadImage(file) {
    const url = `${this.baseUrl}/uploads/image`
    const token = this.getToken()

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || 'Error al subir la imagen')
    }

    return response.json()
  }
}

export const api = new ApiClient()
export default api

