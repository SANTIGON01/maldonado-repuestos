/**
 * Product Card Component
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, FileText, Star, Package, Eye, Check } from 'lucide-react'
import { useLocalCartStore } from '../store/localCartStore'

export default function ProductCard({ product, onQuoteRequest, viewMode = 'grid' }) {
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useLocalCartStore((state) => state.addItem)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Usar carrito local - NO requiere autenticación
    addItem(product, 1)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleQuote = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onQuoteRequest?.(product)
  }

  // List view
  if (viewMode === 'list') {
    return (
      <Link to={`/producto/${product.id}`}>
        <motion.div
          whileHover={{ x: 4 }}
          className="bg-white border-2 border-maldonado-dark flex gap-4 p-4 
                   hover:shadow-solid-dark-sm transition-all group"
        >
          {/* Image */}
          <div className="w-32 h-32 flex-shrink-0 bg-maldonado-light-gray">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-maldonado-chrome" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-maldonado-chrome font-mono">{product.code}</p>
                <h3 className="font-heading text-lg text-maldonado-dark group-hover:text-maldonado-red transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-maldonado-chrome">{product.brand}</p>
              </div>
              
              <div className="text-right">
                {product.original_price && (
                  <p className="text-sm text-maldonado-chrome line-through">
                    {formatPrice(product.original_price)}
                  </p>
                )}
                <p className="text-xl font-display text-maldonado-red">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                {product.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold">{product.rating}</span>
                  </div>
                )}
                <span className={`text-sm font-heading ${product.in_stock ? 'text-green-600' : 'text-orange-500'}`}>
                  {product.in_stock ? 'EN STOCK' : 'SIN STOCK'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className={`p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                            ${addedToCart 
                              ? 'bg-green-500 text-white' 
                              : 'bg-maldonado-red text-white hover:bg-maldonado-red-700'}`}
                >
                  {addedToCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleQuote}
                  className="bg-maldonado-dark text-white p-2 hover:bg-gray-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    )
  }

  // Grid view (default)
  return (
    <Link to={`/producto/${product.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white border-2 border-maldonado-dark shadow-solid-dark-sm 
                 hover:shadow-solid-dark transition-all group h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-square bg-maldonado-light-gray overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-maldonado-chrome" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_new && (
              <span className="bg-maldonado-red text-white text-xs font-bold px-2 py-1">
                NUEVO
              </span>
            )}
            {product.discount_percent && (
              <span className="bg-maldonado-dark text-white text-xs font-bold px-2 py-1">
                -{product.discount_percent}%
              </span>
            )}
          </div>

          {/* View overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 
                        flex items-center justify-center opacity-0 group-hover:opacity-100 
                        transition-all">
            <span className="bg-white text-maldonado-dark font-heading px-4 py-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              VER DETALLE
            </span>
          </div>

          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-maldonado-red text-white font-bold px-4 py-2">
                SIN STOCK
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Brand & Code */}
          <div className="flex items-center justify-between text-xs text-maldonado-chrome mb-1">
            <span className="font-heading uppercase">{product.brand}</span>
            <span className="font-mono">{product.code}</span>
          </div>

          {/* Name */}
          <h3 className="font-heading text-lg text-maldonado-dark mb-2 line-clamp-2 
                       group-hover:text-maldonado-red transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold">{product.rating}</span>
              <span className="text-xs text-maldonado-chrome">
                ({product.reviews_count})
              </span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price */}
          <div className="mb-4">
            {product.original_price && (
              <span className="text-sm text-maldonado-chrome line-through mr-2">
                {formatPrice(product.original_price)}
              </span>
            )}
            <span className="text-xl font-display text-maldonado-red">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className={`flex-1 font-bold py-2 px-3 
                       flex items-center justify-center gap-2 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                       ${addedToCart 
                         ? 'bg-green-500 text-white' 
                         : 'bg-maldonado-red text-white hover:bg-maldonado-red-700'}`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-4 h-4" />
                  Agregado
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Agregar
                </>
              )}
            </button>
            
            {onQuoteRequest && (
              <button
                onClick={handleQuote}
                className="bg-maldonado-dark text-white font-bold py-2 px-3 
                         flex items-center justify-center gap-2 
                         hover:bg-gray-700 transition-colors"
                title="Solicitar cotización"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
