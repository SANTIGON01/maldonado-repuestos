/**
 * Product Card Component - Optimizado con React.memo
 */
import { useState, memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, FileText, Star, Package, Eye, Check } from 'lucide-react'
import { useLocalCartStore } from '../store/localCartStore'
import { optimizeImage } from '../lib/cloudinary'

const ProductCard = memo(function ProductCard({ product, onQuoteRequest, viewMode = 'grid' }) {
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useLocalCartStore((state) => state.addItem)

  const formatPrice = (price) => {
    // Si no hay precio o es 0, mostrar "CONSULTAR"
    if (price === null || price === undefined || price === 0 || price === '0' || price === '0.00') {
      return null // Indica que debe mostrar "CONSULTAR"
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }
  
  const hasPrice = product.price && product.price !== 0 && product.price !== '0' && product.price !== '0.00'

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
          className="bg-white rounded-xl border border-zinc-200 flex gap-4 p-4 
                   hover:shadow-lg hover:border-zinc-300 transition-all group"
        >
          {/* Image */}
          <div className="w-28 h-28 flex-shrink-0 bg-zinc-100 rounded-lg overflow-hidden p-2 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={optimizeImage(product.image_url, 'cardList')}
                alt={product.name}
                loading="lazy"
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling?.classList?.remove('hidden')
                }}
              />
            ) : null}
            <Package className={`w-10 h-10 text-zinc-300 ${product.image_url ? 'hidden' : ''}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-zinc-400 font-mono">{product.code}</p>
                  {product.is_on_promotion && (
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      🔥 OFERTA
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-base text-zinc-800 group-hover:text-maldonado-red transition-colors">
                  {product.name}
                </h3>
                <span className="inline-block text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded mt-1">
                  {product.brand}
                </span>
              </div>
              
              <div className="text-right">
                {hasPrice ? (
                  <>
                    {product.original_price && (
                      <p className="text-sm text-zinc-400 line-through">
                        {formatPrice(product.original_price)}
                      </p>
                    )}
                    <div>
                      <p className="text-xl font-display text-maldonado-red">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        + IVA
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-right">
                    <span className="inline-block bg-maldonado-red/10 text-maldonado-red
                                   font-heading text-sm px-3 py-1 rounded-full">
                      CONSULTAR
                    </span>
                    <p className="text-xs text-zinc-500 font-mono mt-1">
                      + IVA
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                {product.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-zinc-700">{product.rating}</span>
                  </div>
                )}
                <span className={`text-xs font-heading px-2 py-1 rounded-full ${
                  product.in_stock 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {product.in_stock ? 'EN STOCK' : 'SIN STOCK'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className={`p-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
                            ${addedToCart 
                              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                              : 'bg-maldonado-red text-white hover:bg-maldonado-red-700 hover:shadow-lg'}`}
                >
                  {addedToCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleQuote}
                  className="bg-zinc-100 text-zinc-600 p-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
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
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white rounded-xl sm:rounded-2xl overflow-hidden
                 border border-zinc-200 shadow-sm
                 hover:shadow-xl hover:border-zinc-300
                 transition-all duration-300 group h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-zinc-100 to-zinc-50 overflow-hidden">
          {product.image_url ? (
            <div className="w-full h-full p-4 flex items-center justify-center">
              <img
                src={optimizeImage(product.image_url, 'cardGrid')}
                alt={product.name}
                loading="lazy"
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Si la imagen falla, ocultar y mostrar placeholder
                  e.target.parentElement.style.display = 'none'
                  e.target.parentElement.nextSibling?.classList?.remove('hidden')
                }}
              />
            </div>
          ) : null}
          <div className={`w-full h-full flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
            <Package className="w-10 h-10 sm:w-16 sm:h-16 text-zinc-300" />
          </div>

          {/* Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1">
            {product.is_on_promotion && (
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg animate-pulse">
                🔥 OFERTA
              </span>
            )}
            {product.is_new && (
              <span className="bg-maldonado-red text-white text-xs sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                NUEVO
              </span>
            )}
            {product.discount_percent && (
              <span className="bg-maldonado-dark text-white text-xs sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                -{product.discount_percent}%
              </span>
            )}
          </div>

          {/* View overlay - oculto en móvil táctil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                        opacity-0 group-hover:opacity-100 transition-all duration-300
                        hidden sm:flex items-end justify-center pb-6">
            <span className="bg-white text-maldonado-dark font-heading px-5 py-2.5 rounded-full 
                           flex items-center gap-2 shadow-lg transform translate-y-4 
                           group-hover:translate-y-0 transition-transform duration-300">
              <Eye className="w-4 h-4" />
              VER DETALLE
            </span>
          </div>

          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-white/90 text-maldonado-dark font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm">
                SIN STOCK
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4 flex flex-col flex-1">
          {/* Brand & Code */}
          <div className="flex items-center justify-between text-xs mb-1.5 sm:mb-2">
            <span className="font-heading uppercase text-zinc-500 bg-zinc-100 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-[60%]">
              {product.brand}
            </span>
            <span className="font-mono text-zinc-400 truncate">{product.code}</span>
          </div>

          {/* Name */}
          <h3 className="font-heading text-sm sm:text-base text-zinc-800 mb-1.5 sm:mb-2 line-clamp-2
                       group-hover:text-maldonado-red transition-colors leading-tight">
            {product.name}
          </h3>

          {/* Rating - oculto en móvil muy pequeño */}
          {product.rating > 0 && (
            <div className="hidden xs:flex items-center gap-1 mb-2 sm:mb-3">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold text-zinc-700">{product.rating}</span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price */}
          <div className="mb-2 sm:mb-4">
            {hasPrice ? (
              <div className="flex flex-col">
                {product.original_price && (
                  <span className="text-xs sm:text-sm text-zinc-400 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
                <span className="text-sm sm:text-xl font-display text-maldonado-red">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs sm:text-xs text-zinc-500 font-mono mt-0.5">
                  + IVA
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="inline-block bg-gradient-to-r from-maldonado-red/10 to-maldonado-red/5
                               text-maldonado-red font-heading text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-1.5 rounded-full
                               border border-maldonado-red/20">
                  💬 CONSULTAR
                </span>
                <span className="text-xs sm:text-xs text-zinc-500 font-mono mt-1">
                  + IVA
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className={`flex-1 font-bold py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl
                       flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 min-h-[44px]
                       ${addedToCart
                         ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                         : 'bg-maldonado-red text-white hover:bg-maldonado-red-700 hover:shadow-lg hover:shadow-maldonado-red/30'}`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Agregado</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Agregar</span>
                </>
              )}
            </button>

            {onQuoteRequest && (
              <button
                onClick={handleQuote}
                className="bg-zinc-100 text-zinc-700 font-bold py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl
                         flex items-center justify-center
                         hover:bg-zinc-200 transition-colors min-h-[44px] min-w-[44px]"
                aria-label="Cotizar"
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
})

export default ProductCard
