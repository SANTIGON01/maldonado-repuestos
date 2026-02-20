/**
 * Página de Detalle de Producto
 */
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, ShoppingCart, Star,
  Package, Truck, Shield, ArrowLeft, Plus, Minus,
  Check, ChevronLeft, ZoomIn, X
} from 'lucide-react'
import api from '../lib/api'
import { useLocalCartStore } from '../store/localCartStore'
import { optimizeImage, optimizeCloudinaryUrl } from '../lib/cloudinary'

export default function ProductPage({ onQuoteRequest, onLoginClick }) {
  const { productId } = useParams()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showZoom, setShowZoom] = useState(false)
  
  const addItem = useLocalCartStore(state => state.addItem)

  // Obtener todas las imágenes del producto
  const getAllImages = () => {
    if (!product) return []
    
    // Si tiene imágenes en el array, usarlas
    if (product.images && product.images.length > 0) {
      return product.images.sort((a, b) => a.display_order - b.display_order)
    }
    
    // Fallback a image_url legacy
    if (product.image_url) {
      return [{ image_url: product.image_url, is_primary: true }]
    }
    
    return []
  }

  const images = getAllImages()
  const currentImage = images[selectedImageIndex]?.image_url

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.getProduct(productId)
        setProduct(data)
      } catch (err) {
        setError('Producto no encontrado')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === 0 || price === '0' || price === '0.00') {
      return null
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }
  
  const hasPrice = product?.price && product.price !== 0 && product.price !== '0' && product.price !== '0.00'

  const handleAddToCart = () => {
    // Usar carrito local - NO requiere autenticación
    addItem(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-maldonado-cream pt-28 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-maldonado-red border-t-transparent" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-maldonado-cream pt-28 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-maldonado-chrome mx-auto mb-4" />
          <h1 className="font-heading text-2xl mb-2">Producto no encontrado</h1>
          <Link to="/catalogo" className="text-maldonado-red hover:underline">
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-maldonado-cream pt-20 sm:pt-28">
      {/* Breadcrumb - simplificado en móvil */}
      <div className="bg-maldonado-dark">
        <div className="container-custom py-3 sm:py-4 px-4">
          <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white/70 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <Link to="/catalogo" className="hover:text-white transition-colors">Catálogo</Link>
            {product.category && (
              <>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 hidden sm:block" />
                <Link 
                  to={`/catalogo/${product.category.slug}`} 
                  className="hover:text-white transition-colors hidden sm:block"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-maldonado-red truncate max-w-[120px] sm:max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Back Button */}
      <div className="container-custom py-3 sm:py-4 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-maldonado-dark hover:text-maldonado-red transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-heading text-sm sm:text-base">VOLVER</span>
        </button>
      </div>

      {/* Product Content */}
      <div className="container-custom pb-8 sm:pb-16 px-0 sm:px-6">
        <div className="bg-white sm:border-4 border-maldonado-dark sm:shadow-solid-dark">
          <div className="grid lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="relative">
              {/* Imagen Principal */}
              <div className="relative aspect-square bg-maldonado-light-gray overflow-hidden">
                {currentImage ? (
                  <>
                    <motion.img
                      key={selectedImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      src={optimizeImage(currentImage, 'productDetail')}
                      alt={product.name}
                      className="w-full h-full object-contain cursor-zoom-in"
                      onClick={() => setShowZoom(true)}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling?.classList?.remove('hidden')
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center">
                      <Package className="w-20 h-20 sm:w-32 sm:h-32 text-maldonado-chrome" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 sm:w-32 sm:h-32 text-maldonado-chrome" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2 z-10">
                  {product.is_new && (
                    <span className="bg-maldonado-red text-white font-bold px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                      NUEVO
                    </span>
                  )}
                  {product.discount_percent && (
                    <span className="bg-maldonado-dark text-white font-bold px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                      -{product.discount_percent}% OFF
                    </span>
                  )}
                  {!product.in_stock && (
                    <span className="bg-gray-500 text-white font-bold px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                      SIN STOCK
                    </span>
                  )}
                </div>

                {/* Zoom indicator */}
                {currentImage && (
                  <button
                    onClick={() => setShowZoom(true)}
                    className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 p-3 bg-white/80 sm:backdrop-blur-sm
                             border-2 border-maldonado-dark hover:bg-white transition-colors touch-target"
                    title="Ampliar imagen"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                )}

                {/* Navegación de imágenes (flechas) */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )}
                      className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-3 bg-white/80 sm:backdrop-blur-sm
                               border-2 border-maldonado-dark hover:bg-white transition-colors touch-target"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-3 bg-white/80 sm:backdrop-blur-sm
                               border-2 border-maldonado-dark hover:bg-white transition-colors touch-target"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails - scrollable en móvil */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 sm:p-4 overflow-x-auto bg-maldonado-cream scrollbar-hide">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 border-2 overflow-hidden transition-all rounded ${
                        selectedImageIndex === index 
                          ? 'border-maldonado-red ring-2 ring-maldonado-red' 
                          : 'border-maldonado-light-gray hover:border-maldonado-dark'
                      }`}
                    >
                      <img
                        src={optimizeImage(img.image_url, 'cartThumb')}
                        alt={`Vista ${index + 1}`}
                        className="w-full h-full object-contain bg-white"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 sm:p-6 lg:p-8 flex flex-col">
              {/* Brand & Code */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-maldonado-chrome text-sm sm:text-base">{product.brand}</span>
                <span className="font-mono text-xs sm:text-sm text-maldonado-chrome bg-maldonado-light-gray px-2 py-1 rounded">
                  {product.code}
                </span>
              </div>

              {/* Name */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-maldonado-dark mb-3 sm:mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          star <= Math.round(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-sm sm:text-base">{product.rating}</span>
                  <span className="text-maldonado-chrome text-xs sm:text-sm">
                    ({product.reviews_count} opiniones)
                  </span>
                </div>
              )}

              {/* Category */}
              {product.category && (
                <Link
                  to={`/catalogo/${product.category.slug}`}
                  className="inline-block mb-3 sm:mb-4 text-xs sm:text-sm font-heading text-maldonado-red 
                           hover:underline"
                >
                  Ver más en {product.category.name}
                </Link>
              )}

              {/* Description */}
              <p className="text-maldonado-dark mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                {product.description || 'Repuesto de alta calidad. Consulte por compatibilidad.'}
              </p>

              {/* Price */}
              <div className="mb-4 sm:mb-6">
                {hasPrice ? (
                  <>
                    {product.original_price && (
                      <p className="text-maldonado-chrome line-through text-base sm:text-lg">
                        {formatPrice(product.original_price)}
                      </p>
                    )}
                    <p className="font-display text-3xl sm:text-4xl text-maldonado-red">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs sm:text-sm text-maldonado-chrome mt-1">
                      IVA incluido
                    </p>
                  </>
                ) : (
                  <div className="bg-gradient-to-r from-maldonado-red/10 to-maldonado-red/5 
                                rounded-xl p-3 sm:p-4 border border-maldonado-red/20">
                    <p className="font-display text-xl sm:text-2xl text-maldonado-red mb-1">
                      💬 CONSULTAR PRECIO
                    </p>
                    <p className="text-xs sm:text-sm text-maldonado-chrome">
                      Contactanos por WhatsApp para cotización
                    </p>
                  </div>
                )}
              </div>

              {/* Stock Status - simplificado */}
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span className="text-green-600 font-heading text-sm sm:text-base">
                  EN STOCK
                </span>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Quantity */}
                <div className="flex items-center justify-center border-2 border-maldonado-dark rounded-lg">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 hover:bg-maldonado-light-gray transition-colors touch-target flex items-center justify-center"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-4 sm:px-6 font-mono text-base sm:text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(99, q + 1))}
                    className="p-3 hover:bg-maldonado-light-gray transition-colors touch-target flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 sm:px-6 
                              font-display text-base sm:text-xl transition-all rounded-lg
                              ${addedToCart 
                                ? 'bg-green-500 text-white' 
                                : 'bg-maldonado-red text-white hover:bg-maldonado-red-700'
                              }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-xl">¡AGREGADO!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-xl">AGREGAR</span>
                      </>
                    )}
                  </button>
              </div>

              {/* Benefits */}
              <div className="mt-auto pt-4 sm:pt-6 border-t border-maldonado-light-gray">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2 text-center sm:text-left">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-maldonado-red" />
                    <span className="leading-tight">Envío a todo el país</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2 text-center sm:text-left">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-maldonado-red" />
                    <span className="leading-tight">Garantía oficial</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2 text-center sm:text-left">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-maldonado-red" />
                    <span className="leading-tight">Repuesto original</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Zoom de Imagen */}
      <AnimatePresence>
        {showZoom && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowZoom(false)}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setShowZoom(false)}
              className="absolute top-4 right-4 p-3 bg-white/10 text-white hover:bg-white/20 transition-colors touch-target rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navegación */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white
                           hover:bg-white/20 transition-colors touch-target"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white
                           hover:bg-white/20 transition-colors touch-target"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Imagen ampliada con swipe */}
            <motion.img
              key={selectedImageIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              drag={images.length > 1 ? "x" : false}
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset }) => {
                if (offset.x < -80) setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
                else if (offset.x > 80) setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
              }}
              src={currentImage}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Indicador de imagen */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImageIndex(index)
                    }}
                    className="p-3 touch-target flex items-center justify-center"
                  >
                    <span className={`block w-3 h-3 rounded-full transition-colors ${
                      selectedImageIndex === index ? 'bg-white' : 'bg-white/40'
                    }`} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

