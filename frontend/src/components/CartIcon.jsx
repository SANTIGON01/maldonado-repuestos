/**
 * Cart Icon with Item Count
 */
import { ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../store/cartStore'

export default function CartIcon({ onClick }) {
  const itemsCount = useCartStore((state) => state.itemsCount)

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-maldonado-red/10 rounded-lg transition-colors group"
      aria-label={`Carrito (${itemsCount} items)`}
    >
      <ShoppingCart className="w-6 h-6 group-hover:text-maldonado-red transition-colors" />
      
      <AnimatePresence>
        {itemsCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-maldonado-red text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
          >
            {itemsCount > 9 ? '9+' : itemsCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

