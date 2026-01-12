import { motion } from 'framer-motion'
import { ShoppingCart, Eye, Star, Zap, TrendingUp, FileText } from 'lucide-react'

const products = [
  {
    id: 1,
    name: 'EJE BPW 9 TONELADAS',
    brand: 'BPW',
    code: 'BPW-090-TS',
    price: 850000,
    originalPrice: 950000,
    category: 'EJES',
    rating: 4.9,
    inStock: true,
    badge: 'NUEVO',
    badgeColor: 'bg-maldonado-red-700',
  },
  {
    id: 2,
    name: 'TAMBOR FRENO 10 AGUJEROS',
    brand: 'MERITOR',
    code: 'MER-TB10-420',
    price: 185000,
    originalPrice: null,
    category: 'FRENOS',
    rating: 4.8,
    inStock: true,
    badge: 'TOP VENTAS',
    badgeColor: 'bg-maldonado-dark',
  },
  {
    id: 3,
    name: 'PULMÓN DE FRENO SIMPLE',
    brand: 'WABCO',
    code: 'WAB-PS-24',
    price: 45000,
    originalPrice: 52000,
    category: 'FRENOS',
    rating: 4.7,
    inStock: true,
    badge: null,
  },
  {
    id: 4,
    name: 'ELÁSTICO TRASERO 12 HOJAS',
    brand: 'RANDON',
    code: 'RAN-EL12-90',
    price: 320000,
    originalPrice: null,
    category: 'SUSPENSIÓN',
    rating: 4.9,
    inStock: true,
    badge: 'NUEVO',
    badgeColor: 'bg-maldonado-red-700',
  },
  {
    id: 5,
    name: 'KING PIN 2" x 3.5"',
    brand: 'JOST',
    code: 'JOS-KP-235',
    price: 125000,
    originalPrice: 145000,
    category: 'ACCESORIOS',
    rating: 4.8,
    inStock: true,
    badge: 'TOP VENTAS',
    badgeColor: 'bg-maldonado-dark',
  },
  {
    id: 6,
    name: 'FARO TRASERO LED COMPLETO',
    brand: 'HELLA',
    code: 'HEL-FT-LED',
    price: 28500,
    originalPrice: null,
    category: 'ILUMINACIÓN',
    rating: 4.9,
    inStock: true,
    badge: 'NUEVO',
    badgeColor: 'bg-maldonado-red-700',
  },
  {
    id: 7,
    name: 'PATA DE APOYO MANUAL',
    brand: 'SAF',
    code: 'SAF-PA-28',
    price: 195000,
    originalPrice: 220000,
    category: 'ACCESORIOS',
    rating: 4.6,
    inStock: false,
    badge: 'AGOTADO',
    badgeColor: 'bg-maldonado-chrome',
  },
  {
    id: 8,
    name: 'VÁLVULA NIVELADORA',
    brand: 'HALDEX',
    code: 'HAL-VN-90',
    price: 78000,
    originalPrice: null,
    category: 'SUSPENSIÓN',
    rating: 4.7,
    inStock: true,
    badge: null,
  },
]

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price)
}

function ProductCard({ product, index }) {
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white border-2 border-maldonado-dark relative"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-maldonado-cream p-8 border-b-2 border-maldonado-dark">
        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-0 left-0 ${product.badgeColor} text-white 
                         font-mono text-xs px-3 py-1`}>
            {product.badge}
          </span>
        )}
        
        {/* Discount */}
        {discount && (
          <span className="absolute top-0 right-0 bg-maldonado-red-700 text-white 
                         font-display text-lg px-2 py-1">
            -{discount}%
          </span>
        )}

        {/* Product visual placeholder */}
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <span className="font-display text-5xl text-maldonado-dark/20">
              {product.brand.substring(0, 2)}
            </span>
            <p className="font-mono text-xs text-maldonado-chrome mt-2">{product.code}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 
                      translate-y-4 group-hover:translate-y-0 transition-all">
          <button className="w-10 h-10 bg-white border-2 border-maldonado-dark flex items-center justify-center
                           hover:bg-maldonado-dark hover:text-white transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category + Brand */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-xs text-maldonado-red-700">{product.category}</span>
          <span className="font-mono text-xs text-maldonado-chrome">{product.brand}</span>
        </div>

        {/* Name */}
        <h3 className="font-heading text-lg text-maldonado-dark leading-tight mb-3
                     group-hover:text-maldonado-red-700 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-3 h-3 ${
                i < Math.floor(product.rating) 
                  ? 'text-maldonado-red-700 fill-maldonado-red-700' 
                  : 'text-maldonado-chrome/30'
              }`} 
            />
          ))}
          <span className="font-mono text-xs text-maldonado-chrome ml-1">
            {product.rating}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="font-display text-2xl text-maldonado-dark">
              {formatPrice(product.price)}
            </p>
            {product.originalPrice && (
              <p className="font-mono text-sm text-maldonado-chrome line-through">
                {formatPrice(product.originalPrice)}
              </p>
            )}
          </div>
        </div>

        {/* Add to cart */}
        <button 
          disabled={!product.inStock}
          className={`w-full flex items-center justify-center gap-2 py-3 font-heading text-sm
                    border-2 transition-all duration-200 ${
                      product.inStock
                        ? 'bg-maldonado-dark text-white border-maldonado-dark hover:bg-maldonado-red-700 hover:border-maldonado-red-700'
                        : 'bg-maldonado-cream text-maldonado-chrome border-maldonado-chrome/30 cursor-not-allowed'
                    }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.inStock ? 'AGREGAR AL CARRITO' : 'SIN STOCK'}
        </button>
      </div>
    </motion.div>
  )
}

export default function Products({ onQuoteRequest }) {
  return (
    <section id="catalogo" className="py-24 bg-white relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-50">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(0,0,0,0.02) 100px, rgba(0,0,0,0.02) 101px)',
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="font-mono text-sm text-maldonado-red-700 tracking-widest">
                [ CATÁLOGO ]
              </span>
              <h2 className="font-display text-5xl sm:text-6xl text-maldonado-dark mt-2">
                PRODUCTOS
                <span className="text-maldonado-red-700"> DESTACADOS</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <select className="bg-white border-2 border-maldonado-dark px-4 py-3 
                              font-heading text-sm focus:outline-none focus:border-maldonado-red-700">
                <option>MÁS VENDIDOS</option>
                <option>MENOR PRECIO</option>
                <option>MAYOR PRECIO</option>
                <option>MÁS NUEVOS</option>
              </select>
            </div>
          </div>

          <div className="mt-6 h-px bg-maldonado-dark/10" />
        </motion.div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="#catalogo-completo" className="btn-brutal-outline">
            VER CATÁLOGO COMPLETO
          </a>
        </motion.div>
      </div>
    </section>
  )
}
