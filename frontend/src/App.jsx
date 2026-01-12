import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import QuoteCartSidebar from './components/QuoteCartSidebar'
import QuoteWhatsAppModal from './components/QuoteWhatsAppModal'
import LoginModal from './components/LoginModal'
import QuoteModal from './components/QuoteModal'
import WhatsAppButton from './components/WhatsAppButton'

// Pages
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import AdminPage from './pages/AdminPage'

import { useAuthStore } from './store/authStore'

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [isQuoteWhatsAppOpen, setIsQuoteWhatsAppOpen] = useState(false)
  const [quoteProduct, setQuoteProduct] = useState(null)
  
  const location = useLocation()
  const checkAuth = useAuthStore((state) => state.checkAuth)
  
  // Check if we're on admin page to hide header/footer
  const isAdminPage = location.pathname.startsWith('/admin')

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Abrir carrito de cotización (NO requiere login)
  const handleCartClick = () => {
    setIsCartOpen(true)
  }

  // Abrir modal de cotización por WhatsApp
  const handleRequestQuote = () => {
    setIsQuoteWhatsAppOpen(true)
  }

  const handleQuoteRequest = (product = null) => {
    setQuoteProduct(product)
    setIsQuoteOpen(true)
  }

  // Admin page has its own layout
  if (isAdminPage) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header 
        onCartClick={handleCartClick} 
        onLoginClick={() => setIsLoginOpen(true)}
      />
      
      <main className="flex-1">
        <Routes>
          <Route 
            path="/" 
            element={<HomePage onQuoteClick={() => handleQuoteRequest()} />} 
          />
          <Route 
            path="/catalogo" 
            element={<CatalogPage onQuoteRequest={handleQuoteRequest} />} 
          />
          <Route 
            path="/catalogo/:categorySlug" 
            element={<CatalogPage onQuoteRequest={handleQuoteRequest} />} 
          />
          <Route 
            path="/producto/:productId" 
            element={
              <ProductPage 
                onQuoteRequest={handleQuoteRequest}
                onLoginClick={() => setIsLoginOpen(true)}
              />
            } 
          />
        </Routes>
      </main>
      
      <Footer />

      {/* Botón flotante de WhatsApp */}
      <WhatsAppButton />

      {/* Modals & Sidebars */}
      <QuoteCartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onRequestQuote={handleRequestQuote}
      />
      <QuoteWhatsAppModal
        isOpen={isQuoteWhatsAppOpen}
        onClose={() => setIsQuoteWhatsAppOpen(false)}
      />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
      <QuoteModal 
        isOpen={isQuoteOpen} 
        onClose={() => {
          setIsQuoteOpen(false)
          setQuoteProduct(null)
        }}
        product={quoteProduct}
      />
    </div>
  )
}

export default App
