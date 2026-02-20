/**
 * Página de Catálogo - Lista de productos con filtros
 */
import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useSearchParams, Link, useNavigationType } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Filter, X, ChevronDown, Grid3X3, List, 
  Search, SlidersHorizontal, ArrowUpDown,
  Package, ChevronRight, ArrowLeft, Home
} from 'lucide-react'
import api from '../lib/api'
import { formatPrice } from '../lib/format'
import ProductCard from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/ProductCardSkeleton'

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Más recientes' },
  { value: 'price:asc', label: 'Menor precio' },
  { value: 'price:desc', label: 'Mayor precio' },
  { value: 'name:asc', label: 'A-Z' },
  { value: 'rating:desc', label: 'Mejor valorados' },
]

export default function CatalogPage({ onQuoteRequest }) {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigationType = useNavigationType()
  const hasRestoredScroll = useRef(false)

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [currentCategory, setCurrentCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('created_at:desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [showOnPromotion, setShowOnPromotion] = useState(false)
  const [productCodes, setProductCodes] = useState('')
  
  // View mode
  const [viewMode, setViewMode] = useState('grid')

  // Leer parámetros de la URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    const codesFromUrl = searchParams.get('codes')
    const onPromotionFromUrl = searchParams.get('on_promotion')

    if (searchFromUrl) setSearchTerm(searchFromUrl)
    if (codesFromUrl) setProductCodes(codesFromUrl)
    if (onPromotionFromUrl === 'true') setShowOnPromotion(true)
  }, [searchParams])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories()
        setCategories(data)
        
        if (categorySlug) {
          const cat = data.find(c => c.slug === categorySlug)
          setCurrentCategory(cat || null)
        } else {
          setCurrentCategory(null)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [categorySlug])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const [sortField, sortOrder] = sortBy.split(':')
        
        const params = {
          page,
          page_size: 12,
          sort_by: sortField,
          sort_order: sortOrder,
        }
        
        if (categorySlug) {
          params.category_slug = categorySlug
        }
        
        if (inStockOnly) {
          params.in_stock = true
        }
        
        if (selectedBrand) {
          params.brand = selectedBrand
        }

        if (showOnPromotion) {
          params.on_promotion = true
        }

        if (productCodes) {
          params.codes = productCodes
        }

        let data
        if (searchTerm.length >= 2) {
          // Pasar filtros también a la búsqueda
          const searchParams = {
            sort_by: sortField,
            sort_order: sortOrder,
          }
          if (categorySlug) searchParams.category_slug = categorySlug
          if (inStockOnly) searchParams.in_stock = true
          if (selectedBrand) searchParams.brand = selectedBrand
          if (showOnPromotion) searchParams.on_promotion = true
          if (productCodes) searchParams.codes = productCodes

          data = await api.searchProducts(searchTerm, page, 12, searchParams)
        } else {
          data = await api.getProducts(params)
        }
        
        setProducts(data.items)
        setTotalProducts(data.total)
        setTotalPages(data.total_pages)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProducts()
  }, [categorySlug, page, sortBy, inStockOnly, selectedBrand, searchTerm, showOnPromotion, productCodes])

  // Reset page cuando cambian los filtros
  useEffect(() => {
    setPage(1)
  }, [categorySlug, sortBy, inStockOnly, selectedBrand, searchTerm, showOnPromotion, productCodes])

  // Guardar posición de scroll al salir del catálogo
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem('catalog_scroll', String(window.scrollY))
    }
    // Guardar en cada scroll (throttled por el browser)
    window.addEventListener('scroll', saveScroll, { passive: true })
    return () => window.removeEventListener('scroll', saveScroll)
  }, [])

  // Restaurar scroll al volver con botón atrás (después de que carguen los productos)
  useEffect(() => {
    if (navigationType === 'POP' && !isLoading && products.length > 0 && !hasRestoredScroll.current) {
      const saved = sessionStorage.getItem('catalog_scroll')
      if (saved) {
        hasRestoredScroll.current = true
        // Usar requestAnimationFrame para esperar al render del DOM
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(saved, 10))
        })
      }
    }
  }, [navigationType, isLoading, products])

  // Scroll al inicio cuando cambia la página manualmente (paginación)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  // Get unique brands from products (memoizado)
  const brands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products])

  return (
    <div className="min-h-screen bg-maldonado-cream pt-20 sm:pt-28">
      {/* Breadcrumb simple */}
      <div className="bg-maldonado-dark/95 border-b border-white/10">
        <div className="container-custom py-2 sm:py-3 px-4">
          <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white/70">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Inicio</span>
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <Link to="/catalogo" className="hover:text-white transition-colors">Catálogo</Link>
            {currentCategory && (
              <>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-maldonado-red font-medium truncate max-w-[100px] sm:max-w-none">{currentCategory.name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b-4 border-maldonado-dark">
        <div className="container-custom py-4 sm:py-8 px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div>
              {/* Botón volver al catálogo si estamos en categoría */}
              {currentCategory && (
                <Link
                  to="/catalogo"
                  className="inline-flex items-center gap-1 sm:gap-2 text-maldonado-red hover:text-maldonado-red-700 
                           font-heading text-xs sm:text-sm mb-2 sm:mb-3 group transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden xs:inline">VER TODAS LAS</span> CATEGORÍAS
                </Link>
              )}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl text-maldonado-dark leading-tight">
                {currentCategory ? currentCategory.name.toUpperCase() : 'CATÁLOGO COMPLETO'}
              </h1>
              <p className="text-maldonado-chrome mt-1 sm:mt-2 text-sm sm:text-base">
                {currentCategory 
                  ? currentCategory.description 
                  : 'Todos nuestros repuestos para semirremolques y acoplados'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs sm:text-sm text-maldonado-chrome font-mono">
                {totalProducts} productos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Pills (if no category selected) - grid flexible con wrap */}
      {!categorySlug && categories.length > 0 && (
        <div className="bg-white border-b border-maldonado-light-gray">
          <div className="container-custom py-3 sm:py-4 px-4">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <Link
                to="/catalogo"
                className="px-3 sm:px-4 py-2.5 bg-maldonado-dark text-white font-heading text-xs sm:text-sm rounded-lg sm:rounded-none min-h-[44px] flex items-center"
              >
                TODOS
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/catalogo/${cat.slug}`}
                  className="px-3 sm:px-4 py-2.5 border-2 border-maldonado-dark text-maldonado-dark
                           font-heading text-xs sm:text-sm hover:bg-maldonado-dark hover:text-white transition-colors whitespace-nowrap rounded-lg sm:rounded-none min-h-[44px] flex items-center"
                >
                  {cat.name.toUpperCase()} <span className="hidden sm:inline">({cat.products_count})</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border-b border-maldonado-light-gray sticky top-[64px] sm:top-[72px] z-20">
        <div className="container-custom py-3 sm:py-4 px-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search - siempre full width en móvil */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-maldonado-chrome" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border-2 border-maldonado-dark rounded-lg sm:rounded-none
                         focus:border-maldonado-red outline-none font-mono text-sm sm:text-base"
              />
            </div>

            {/* Bottom row: Sort, Filters, View */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Sort */}
              <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none">
                <ArrowUpDown className="w-4 h-4 text-maldonado-chrome hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none border-2 border-maldonado-dark px-2 sm:px-3 py-2.5 font-heading text-xs sm:text-sm
                           focus:border-maldonado-red outline-none bg-white rounded-lg sm:rounded-none min-h-[44px]"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 border-2 font-heading text-xs sm:text-sm transition-colors rounded-lg sm:rounded-none min-h-[44px]
                  ${showFilters 
                    ? 'bg-maldonado-dark text-white border-maldonado-dark' 
                    : 'border-maldonado-dark text-maldonado-dark hover:bg-maldonado-dark hover:text-white'
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden xs:inline">FILTROS</span>
              </button>

              {/* View Mode */}
              <div className="flex border-2 border-maldonado-dark rounded-lg sm:rounded-none overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center ${viewMode === 'grid' ? 'bg-maldonado-dark text-white' : ''}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center ${viewMode === 'list' ? 'bg-maldonado-dark text-white' : ''}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-maldonado-light-gray"
            >
              <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                {/* Brand Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-heading mb-1">MARCA</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="border-2 border-maldonado-dark px-2 sm:px-3 py-1.5 sm:py-2 font-mono text-xs sm:text-sm bg-white rounded-lg sm:rounded-none"
                  >
                    <option value="">Todas</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Stock Filter */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-maldonado-red"
                  />
                  <span className="font-heading text-xs sm:text-sm">Solo en stock</span>
                </label>

                {/* Promotion Filter */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnPromotion}
                    onChange={(e) => setShowOnPromotion(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-maldonado-red"
                  />
                  <span className="font-heading text-xs sm:text-sm">Solo en promoción</span>
                </label>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSelectedBrand('')
                    setInStockOnly(false)
                    setSearchTerm('')
                    setShowOnPromotion(false)
                    setProductCodes('')
                  }}
                  className="flex items-center gap-1 text-maldonado-red hover:underline font-heading text-xs sm:text-sm"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  Limpiar
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-wide py-4 sm:py-8 px-4">
        {isLoading ? (
          <ProductGridSkeleton count={12} viewMode={viewMode} />
        ) : products.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-maldonado-chrome mx-auto mb-3 sm:mb-4" />
            <h2 className="font-heading text-xl sm:text-2xl text-maldonado-dark mb-2">
              No se encontraron productos
            </h2>
            <p className="text-maldonado-chrome mb-4 text-sm sm:text-base">
              Probá ajustando los filtros o buscando otro término
            </p>
            <Link
              to="/catalogo"
              className="inline-block bg-maldonado-red text-white font-heading px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl sm:rounded-none hover:bg-maldonado-red-700 transition-colors"
            >
              VER TODO EL CATÁLOGO
            </Link>
          </div>
        ) : (
          <>
            <div className={`grid gap-3 sm:gap-4 lg:gap-5 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuoteRequest={onQuoteRequest}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 sm:px-4 py-2.5 border-2 border-maldonado-dark font-heading text-xs sm:text-sm rounded-lg sm:rounded-none
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-maldonado-dark hover:text-white transition-colors min-h-[44px]"
                >
                  <span className="hidden xs:inline">ANTERIOR</span>
                  <span className="xs:hidden">←</span>
                </button>

                <span className="px-3 sm:px-4 py-2.5 font-mono text-sm">
                  {page} / {totalPages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 sm:px-4 py-2.5 border-2 border-maldonado-dark font-heading text-xs sm:text-sm rounded-lg sm:rounded-none
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-maldonado-dark hover:text-white transition-colors min-h-[44px]"
                >
                  <span className="hidden xs:inline">SIGUIENTE</span>
                  <span className="xs:hidden">→</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

