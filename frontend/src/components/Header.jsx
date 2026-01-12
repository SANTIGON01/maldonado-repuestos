import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingCart, Search, Phone, User, LogOut, Settings } from 'lucide-react'
import { useLocalCartStore } from '../store/localCartStore'
import { useAuthStore } from '../store/authStore'

const navigation = [
  { name: 'INICIO', href: '/' },
  { name: 'CATÁLOGO', href: '/catalogo' },
  { name: 'CATEGORÍAS', href: '/#categorias' },
  { name: 'NOSOTROS', href: '/#nosotros' },
  { name: 'CONTACTO', href: '/#contacto' },
]

export default function Header({ onCartClick, onLoginClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  
  // Determinar si estamos en la página de inicio
  const isHomePage = location.pathname === '/'
  
  // Usar carrito local (no requiere autenticación)
  const items = useLocalCartStore((state) => state.items)
  const itemsCount = items.reduce((total, item) => total + item.quantity, 0)
  
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleLogout = () => {
    logout()
  }

  // En páginas internas siempre fondo oscuro, en Home solo cuando hay scroll
  const showDarkBg = !isHomePage || scrolled

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showDarkBg 
          ? 'bg-maldonado-dark shadow-2xl' 
          : 'bg-transparent'
      }`}>
        {/* Top bar - solo visible en Home sin scroll */}
        <div className={`bg-maldonado-red-700 transition-all duration-300 overflow-hidden ${
          (scrolled || !isHomePage) ? 'h-0' : 'h-auto'
        }`}>
          <div className="container-custom py-2 flex justify-between items-center">
            <a href="tel:+541112345678" className="flex items-center gap-2 text-white text-sm font-mono">
              <Phone className="w-4 h-4" />
              +54 11 1234-5678
            </a>
            <span className="hidden sm:block text-white/80 text-sm font-mono">
              ESPECIALISTAS EN SEMIRREMOLQUES Y ACOPLADOS
            </span>
          </div>
        </div>

        {/* Main nav */}
        <div className="container-custom">
          <nav className="flex items-center justify-between py-4 gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <img 
                  src="/unnamed.jpg" 
                  alt="Maldonado Repuestos"
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-full border-2 border-maldonado-chrome
                           group-hover:border-maldonado-red-700 transition-colors"
                />
              </motion.div>
              <div>
                <p className="font-display text-xl sm:text-2xl text-white leading-none tracking-wide">
                  MALDONADO
                </p>
                <p className="font-heading text-xs sm:text-sm text-maldonado-red-500 tracking-[0.15em] sm:tracking-[0.2em]">
                  REPUESTOS
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                // Si es una ruta interna (empieza con /), usar Link
                // Si es un anchor (empieza con /#), usar Link pero manejar scroll
                const isInternalRoute = item.href.startsWith('/') && !item.href.includes('#')
                
                if (isInternalRoute) {
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="relative px-4 py-2 font-heading text-sm text-white/80 
                               hover:text-white transition-colors group"
                    >
                      {item.name}
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-maldonado-red-700 
                                     scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </Link>
                  )
                }
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="relative px-4 py-2 font-heading text-sm text-white/80 
                             hover:text-white transition-colors group"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-maldonado-red-700 
                                   scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </a>
                )
              })}
            </div>

            {/* Search + Cart + Auth */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar repuestos..."
                    className="w-48 lg:w-64 bg-white/10 border border-white/20 rounded-none
                             px-4 py-2 text-sm text-white placeholder:text-white/50
                             focus:outline-none focus:bg-white/20 focus:border-maldonado-red-700
                             transition-all font-mono"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                </div>
              </div>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  {/* Admin Link - Solo visible para administradores */}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1 px-3 py-2 bg-maldonado-red-700 text-white
                               hover:bg-maldonado-red-800 transition-colors font-heading text-sm"
                      title="Panel de Administración"
                    >
                      <Settings className="w-4 h-4" />
                      ADMIN
                    </Link>
                  )}
                  <span className="text-white/80 text-sm font-mono max-w-24 truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-white/70 hover:text-white transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="hidden sm:flex items-center gap-2 text-white/80 hover:text-white 
                           transition-colors font-heading text-sm"
                >
                  <User className="w-5 h-5" />
                  INGRESAR
                </button>
              )}

              {/* Cart */}
              <motion.button
                onClick={onCartClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative bg-maldonado-red-700 text-white p-3 
                         border border-maldonado-red-600 hover:bg-maldonado-red-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {itemsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-white text-maldonado-dark 
                               text-xs font-bold w-5 h-5 flex items-center justify-center"
                    >
                      {itemsCount > 9 ? '9+' : itemsCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-maldonado-red-500 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 bg-maldonado-dark lg:hidden"
          >
            <div className="pt-24 px-6 space-y-2">
              {navigation.map((item, index) => {
                const isInternalRoute = item.href.startsWith('/') && !item.href.includes('#')
                const MotionLink = motion(Link)
                
                if (isInternalRoute) {
                  return (
                    <MotionLink
                      key={item.name}
                      to={item.href}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-4 font-display text-3xl text-white 
                               border-b border-white/10 hover:text-maldonado-red-500 
                               hover:pl-4 transition-all"
                    >
                      {item.name}
                    </MotionLink>
                  )
                }
                
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-4 font-display text-3xl text-white 
                             border-b border-white/10 hover:text-maldonado-red-500 
                             hover:pl-4 transition-all"
                  >
                    {item.name}
                  </motion.a>
                )
              })}

              {/* Mobile auth */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-6 space-y-4"
              >
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center justify-between text-white">
                      <span className="font-mono">Hola, {user?.name}</span>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-maldonado-red-500"
                      >
                        <LogOut className="w-5 h-5" />
                        Salir
                      </button>
                    </div>
                    {/* Admin Link en móvil */}
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 bg-maldonado-red-700 text-white
                                 font-heading text-lg"
                      >
                        <Settings className="w-5 h-5" />
                        PANEL DE ADMINISTRACIÓN
                      </Link>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      onLoginClick?.()
                    }}
                    className="flex items-center gap-2 text-white font-heading"
                  >
                    <User className="w-5 h-5" />
                    INICIAR SESIÓN
                  </button>
                )}
              </motion.div>

              {/* Mobile search */}
              <div className="pt-4">
                <input
                  type="text"
                  placeholder="Buscar repuestos..."
                  className="w-full bg-white/10 border-2 border-white/20 
                           px-4 py-4 text-white placeholder:text-white/50
                           focus:outline-none focus:border-maldonado-red-700 font-mono"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
