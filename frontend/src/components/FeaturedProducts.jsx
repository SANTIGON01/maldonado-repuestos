/**
 * Productos Destacados - Muestra productos del backend
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import api from '../lib/api'
import ProductCard from './ProductCard'
import { ProductGridSkeleton } from './ProductCardSkeleton'

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts({ 
          featured: true, 
          page_size: 8,
          sort_by: 'rating',
          sort_order: 'desc'
        })
        setProducts(data.items)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  return (
    <section id="catalogo" className="py-20 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block bg-maldonado-red text-white font-mono text-sm px-3 py-1 mb-4"
            >
              CATÁLOGO
            </motion.span>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl lg:text-5xl text-maldonado-dark"
            >
              PRODUCTOS DESTACADOS
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-maldonado-chrome mt-2 max-w-xl"
            >
              Los repuestos más vendidos y mejor valorados por nuestros clientes
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 bg-maldonado-dark text-white 
                       font-heading px-6 py-3 hover:bg-maldonado-red transition-colors group"
            >
              VER CATÁLOGO COMPLETO
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={8} viewMode="grid" />
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-maldonado-chrome">
            <p>No hay productos destacados disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 text-maldonado-red font-heading 
                     hover:underline group"
          >
            Explorar todos los productos
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

