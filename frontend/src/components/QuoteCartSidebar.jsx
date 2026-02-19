/**
 * Quote Cart Sidebar Component
 * Carrito para cotizaciones - funciona SIN autenticación
 */
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Minus, ClipboardList, MessageCircle, Package } from 'lucide-react'
import { useLocalCartStore } from '../store/localCartStore'
import { optimizeImage } from '../lib/cloudinary'

export default function QuoteCartSidebar({ isOpen, onClose, onRequestQuote }) {
  const { items, updateQuantity, removeItem } = useLocalCartStore()
  const itemsCount = items.reduce((total, item) => total + item.quantity, 0)

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
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset }) => {
              if (offset.x > 100) onClose()
            }}
            className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white
                     shadow-2xl z-50 flex flex-col sm:rounded-l-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-maldonado-dark text-white px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-maldonado-red-700 p-2 rounded-lg">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg sm:text-xl">MI LISTA</h2>
                  <p className="text-xs text-white/60 font-mono">{itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-lg transition-colors touch-target">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-zinc-50">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-maldonado-chrome p-6">
                  <div className="w-20 h-20 bg-zinc-200 rounded-2xl flex items-center justify-center mb-4">
                    <ClipboardList className="w-10 h-10 text-zinc-400" />
                  </div>
                  <p className="font-heading text-lg text-center text-zinc-700">Tu lista está vacía</p>
                  <p className="text-sm text-center mt-2 text-zinc-500">
                    Agregá productos desde el catálogo para cotizar
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-zinc-200
                               hover:shadow-md hover:border-zinc-300 transition-all"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 bg-zinc-100 flex-shrink-0 flex items-center justify-center 
                                    overflow-hidden rounded-lg">
                        {item.product.image_url ? (
                          <img
                            src={optimizeImage(item.product.image_url, 'cartThumb')}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-zinc-400" />
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
                        {item.product.brand && (
                          <p className="text-xs text-maldonado-chrome">
                            {item.product.brand}
                          </p>
                        )}

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center bg-zinc-100 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-3 hover:bg-zinc-200 disabled:opacity-30 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-mono w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-3 hover:bg-zinc-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 ml-auto text-zinc-400 hover:text-red-500 hover:bg-red-50 
                                     rounded-lg transition-colors"
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
              <div className="border-t border-zinc-200 p-4 space-y-4 bg-white pb-safe">
                <div className="flex justify-between items-center">
                  <span className="font-heading text-zinc-600">Total productos:</span>
                  <span className="font-display text-2xl text-maldonado-dark">{itemsCount}</span>
                </div>
                
                <button
                  onClick={() => {
                    onClose()
                    onRequestQuote?.()
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white 
                           font-display text-xl py-4 rounded-xl
                           flex items-center justify-center gap-3 
                           hover:from-green-700 hover:to-green-600 
                           shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40
                           transform hover:scale-[1.02] transition-all duration-200"
                >
                  <MessageCircle className="w-6 h-6" />
                  COTIZAR POR WHATSAPP
                </button>
                
                <p className="text-xs text-center text-zinc-400 flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  Sin compromiso • Respuesta rápida
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

