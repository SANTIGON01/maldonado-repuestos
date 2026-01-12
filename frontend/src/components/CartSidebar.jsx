/**
 * Cart Sidebar Component
 */
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

export default function CartSidebar({ isOpen, onClose, onCheckout }) {
  const { 
    items, 
    subtotal, 
    shippingEstimate, 
    total, 
    isLoading,
    fetchCart,
    updateQuantity,
    removeItem,
  } = useCartStore()
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchCart()
    }
  }, [isOpen, isAuthenticated, fetchCart])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-maldonado-dark text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                <h2 className="font-display text-2xl">CARRITO</h2>
              </div>
              <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-maldonado-red" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-maldonado-chrome">
                  <ShoppingBag className="w-16 h-16 mb-4" />
                  <p className="font-heading text-lg">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-4 bg-maldonado-cream p-4 border-2 border-maldonado-dark"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 bg-white flex-shrink-0 flex items-center justify-center">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-maldonado-chrome" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-maldonado-chrome font-mono">
                          {item.product.code}
                        </p>
                        <h3 className="font-heading text-sm line-clamp-2">
                          {item.product.name}
                        </h3>
                        <p className="text-maldonado-red font-bold">
                          {formatPrice(item.product.price)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="p-1 border border-maldonado-dark hover:bg-maldonado-dark hover:text-white disabled:opacity-50 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-mono w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 border border-maldonado-dark hover:bg-maldonado-dark hover:text-white disabled:opacity-50 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 ml-auto text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t-4 border-maldonado-dark p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío estimado:</span>
                  <span className="font-mono">
                    {shippingEstimate > 0 ? formatPrice(shippingEstimate) : 'GRATIS'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t-2 border-maldonado-dark pt-2">
                  <span className="font-heading">TOTAL:</span>
                  <span className="text-maldonado-red">{formatPrice(total)}</span>
                </div>
                
                <button
                  onClick={() => {
                    onClose()
                    onCheckout?.()
                  }}
                  className="w-full bg-maldonado-red text-white font-display text-xl py-3 hover:bg-maldonado-red-700 transition-colors"
                >
                  FINALIZAR COMPRA
                </button>
                
                <p className="text-xs text-center text-maldonado-chrome">
                  Envío gratis en compras mayores a $100.000
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

