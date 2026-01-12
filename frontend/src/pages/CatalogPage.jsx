/**
 * Página de Catálogo - Lista de productos con filtros
 */
import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Filter, X, ChevronDown, Grid3X3, List, 
  Search, SlidersHorizontal, ArrowUpDown,
  Package, ChevronRight, ArrowLeft, Home
} from 'lucide-react'
import api from '../lib/api'
import ProductCard from '../components/ProductCard'

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
  
  // View mode
  const [viewMode, setViewMode] = useState('grid')

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

        let data
        if (searchTerm.length >= 2) {
          data = await api.searchProducts(searchTerm, page, 12)
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
  }, [categorySlug, page, sortBy, inStockOnly, selectedBrand, searchTerm])

  // Get unique brands from products
  const brands = [...new Set(products.map(p => p.brand))].sort()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-maldonado-cream pt-28">
      {/* Breadcrumb simple */}
      <div className="bg-maldonado-dark/95 border-b border-white/10">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>Inicio</span>
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/catalogo" className="hover:text-white transition-colors">Catálogo</Link>
            {currentCategory && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-maldonado-red font-medium">{currentCategory.name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b-4 border-maldonado-dark">
        <div className="container-custom py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              {/* Botón volver al catálogo si estamos en categoría */}
              {currentCategory && (
                <Link
                  to="/catalogo"
                  className="inline-flex items-center gap-2 text-maldonado-red hover:text-maldonado-red-700 
                           font-heading text-sm mb-3 group transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  VER TODAS LAS CATEGORÍAS
                </Link>
              )}
              <h1 className="font-display text-4xl lg:text-5xl text-maldonado-dark">
                {currentCategory ? currentCategory.name.toUpperCase() : 'CATÁLOGO COMPLETO'}
              </h1>
              <p className="text-maldonado-chrome mt-2">
                {currentCategory 
                  ? currentCategory.description 
                  : 'Todos nuestros repuestos para semirremolques y acoplados'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-maldonado-chrome">
                {totalProducts} productos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Pills (if no category selected) */}
      {!categorySlug && categories.length > 0 && (
        <div className="bg-white border-b border-maldonado-light-gray">
          <div className="container-custom py-4">
            <div className="flex flex-wrap gap-2">
              <Link
                to="/catalogo"
                className="px-4 py-2 bg-maldonado-dark text-white font-heading text-sm"
              >
                TODOS
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/catalogo/${cat.slug}`}
                  className="px-4 py-2 border-2 border-maldonado-dark text-maldonado-dark 
                           font-heading text-sm hover:bg-maldonado-dark hover:text-white transition-colors"
                >
                  {cat.name.toUpperCase()} ({cat.products_count})
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border-b border-maldonado-light-gray sticky top-[72px] z-20">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-maldonado-chrome" />
              <input
                type="text"
                placeholder="Buscar en catálogo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-maldonado-dark 
                         focus:border-maldonado-red outline-none font-mono"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-maldonado-chrome" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-2 border-maldonado-dark px-3 py-2 font-heading text-sm 
                         focus:border-maldonado-red outline-none bg-white"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border-2 font-heading text-sm transition-colors
                ${showFilters 
                  ? 'bg-maldonado-dark text-white border-maldonado-dark' 
                  : 'border-maldonado-dark text-maldonado-dark hover:bg-maldonado-dark hover:text-white'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              FILTROS
            </button>

            {/* View Mode */}
            <div className="flex border-2 border-maldonado-dark">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-maldonado-dark text-white' : ''}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-maldonado-dark text-white' : ''}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-maldonado-light-gray"
            >
              <div className="flex flex-wrap gap-4">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-heading mb-1">MARCA</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="border-2 border-maldonado-dark px-3 py-2 font-mono text-sm bg-white"
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
                    className="w-5 h-5 accent-maldonado-red"
                  />
                  <span className="font-heading text-sm">Solo en stock</span>
                </label>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSelectedBrand('')
                    setInStockOnly(false)
                    setSearchTerm('')
                  }}
                  className="flex items-center gap-1 text-maldonado-red hover:underline font-heading text-sm"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-custom py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-maldonado-red border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-maldonado-chrome mx-auto mb-4" />
            <h2 className="font-heading text-2xl text-maldonado-dark mb-2">
              No se encontraron productos
            </h2>
            <p className="text-maldonado-chrome mb-4">
              Probá ajustando los filtros o buscando otro término
            </p>
            <Link
              to="/catalogo"
              className="inline-block bg-maldonado-red text-white font-heading px-6 py-3 hover:bg-maldonado-red-700 transition-colors"
            >
              VER TODO EL CATÁLOGO
            </Link>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard 
                    product={product} 
                    onQuoteRequest={onQuoteRequest}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border-2 border-maldonado-dark font-heading 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-maldonado-dark hover:text-white transition-colors"
                >
                  ANTERIOR
                </button>
                
                <span className="px-4 py-2 font-mono">
                  {page} / {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border-2 border-maldonado-dark font-heading
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-maldonado-dark hover:text-white transition-colors"
                >
                  SIGUIENTE
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

