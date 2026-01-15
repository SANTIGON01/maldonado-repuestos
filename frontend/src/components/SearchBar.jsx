/**
 * SearchBar Component - Buscador inteligente con autocompletado
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Package, Loader2, ArrowRight, Clock, TrendingUp } from 'lucide-react'
import api from '../lib/api'
import { useDebounce } from '../hooks/useDebounce'

export default function SearchBar({ onClose, isMobile = false }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState([])

  const debouncedQuery = useDebounce(query, 300)

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5))
    }
  }, [])

  // Guardar búsqueda en recientes
  const saveRecentSearch = useCallback((searchTerm) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }, [recentSearches])

  // Buscar productos
  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const data = await api.searchProducts(debouncedQuery, 1, 8)
        setResults(data.items || [])
      } catch (error) {
        console.error('Error searching:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    searchProducts()
  }, [debouncedQuery])

  // Click outside para cerrar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectProduct(results[selectedIndex])
      } else if (query.length >= 2) {
        handleSearchAll()
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      onClose?.()
    }
  }

  const handleSelectProduct = (product) => {
    saveRecentSearch(product.name)
    setIsOpen(false)
    setQuery('')
    onClose?.()
    navigate(`/producto/${product.id}`)
  }

  const handleSearchAll = () => {
    if (query.length >= 2) {
      saveRecentSearch(query)
      setIsOpen(false)
      onClose?.()
      navigate(`/catalogo?search=${encodeURIComponent(query)}`)
    }
  }

  const handleRecentClick = (term) => {
    setQuery(term)
    setIsOpen(true)
    inputRef.current?.focus()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const formatPrice = (price) => {
    if (!price || price === 0) return null
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const showDropdown = isOpen && (query.length > 0 || recentSearches.length > 0)

  return (
    <div ref={containerRef} className={`relative ${isMobile ? 'w-full' : ''}`}>
      {/* Input */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-white/50 ${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar repuestos..."
          className={`bg-white/10 border border-white/20 text-white placeholder:text-white/50
                     focus:outline-none focus:bg-white/20 focus:border-maldonado-red-700
                     transition-all font-mono ${
                       isMobile 
                         ? 'w-full pl-12 pr-10 py-4 text-base rounded-xl border-2' 
                         : 'w-48 lg:w-64 pl-10 pr-8 py-2 text-sm'
                     }`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            <X className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full mt-2 bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden z-50 ${
              isMobile ? 'left-0 right-0' : 'left-0 w-80 lg:w-96'
            }`}
          >
            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-4 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Buscando...</span>
              </div>
            )}

            {/* Sin query - Mostrar recientes */}
            {!isLoading && query.length < 2 && recentSearches.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-heading text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    BÚSQUEDAS RECIENTES
                  </span>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs text-zinc-400 hover:text-zinc-600"
                  >
                    Limpiar
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentClick(term)}
                      className="flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-zinc-700 
                               hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <Search className="w-4 h-4 text-zinc-400" />
                      <span className="truncate">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resultados */}
            {!isLoading && query.length >= 2 && (
              <>
                {results.length === 0 ? (
                  <div className="p-6 text-center">
                    <Package className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">No se encontraron resultados</p>
                    <p className="text-xs text-zinc-400 mt-1">Probá con otro término</p>
                  </div>
                ) : (
                  <>
                    {/* Lista de productos */}
                    <div className="max-h-80 overflow-y-auto">
                      {results.map((product, index) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className={`flex items-center gap-3 w-full px-3 py-3 text-left transition-colors
                                    ${selectedIndex === index ? 'bg-maldonado-red/10' : 'hover:bg-zinc-50'}`}
                        >
                          {/* Imagen */}
                          <div className="w-12 h-12 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-zinc-400" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-[10px] text-zinc-400">{product.code}</p>
                            <p className="text-sm font-medium text-zinc-800 truncate">{product.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                                {product.brand}
                              </span>
                              {formatPrice(product.price) ? (
                                <span className="text-xs font-bold text-maldonado-red">
                                  {formatPrice(product.price)}
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-500">Consultar</span>
                              )}
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>

                    {/* Ver todos */}
                    <button
                      onClick={handleSearchAll}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 
                               bg-maldonado-dark text-white font-heading text-sm
                               hover:bg-maldonado-red transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      VER TODOS LOS RESULTADOS
                    </button>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
