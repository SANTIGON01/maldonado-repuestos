/**
 * Skeleton loader para ProductCard
 * Muestra una versión animada mientras cargan los productos
 */
import { motion } from 'framer-motion'

export default function ProductCardSkeleton({ viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 flex gap-4 p-4">
        {/* Image skeleton */}
        <div className="w-28 h-28 flex-shrink-0 skeleton rounded-lg" />

        {/* Info skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="skeleton h-3 w-16 mb-2" />
              <div className="skeleton h-5 w-3/4 mb-2" />
              <div className="skeleton h-4 w-20 rounded-full" />
            </div>
            <div className="text-right">
              <div className="skeleton h-3 w-16 mb-1" />
              <div className="skeleton h-6 w-24" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="skeleton h-5 w-20 rounded-full" />
            </div>
            <div className="flex gap-2">
              <div className="skeleton h-10 w-10 rounded-lg" />
              <div className="skeleton h-10 w-10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view skeleton
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl overflow-hidden border border-zinc-200 h-full flex flex-col"
    >
      {/* Image skeleton */}
      <div className="aspect-square skeleton" />

      {/* Content skeleton */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand & Code */}
        <div className="flex items-center justify-between mb-2">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>

        {/* Name */}
        <div className="skeleton h-5 w-full mb-1" />
        <div className="skeleton h-5 w-3/4 mb-3" />

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="skeleton h-4 w-4 rounded-full" />
          <div className="skeleton h-4 w-8" />
          <div className="skeleton h-3 w-12" />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <div className="mb-4">
          <div className="skeleton h-6 w-24" />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <div className="skeleton h-11 flex-1 rounded-xl" />
          <div className="skeleton h-11 w-12 rounded-xl" />
        </div>
      </div>
    </motion.div>
  )
}

// Componente para mostrar múltiples skeletons
export function ProductGridSkeleton({ count = 8, viewMode = 'grid' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ProductCardSkeleton viewMode={viewMode} />
        </motion.div>
      ))}
    </>
  )
}
