/**
 * Categories Section - Rediseñado con estilo Bento Grid
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CircleDot, Disc, Lightbulb, Waves, Settings, Shield,
  ChevronRight, Loader2, Package, Cog, Zap, Wrench
} from 'lucide-react'
import api from '../lib/api'

// Map icon names to components
const iconMap = {
  'CircleDot': CircleDot,
  'Disc': Disc,
  'Lightbulb': Lightbulb,
  'Waves': Waves,
  'Settings': Settings,
  'Shield': Shield,
  'Cog': Cog,
  'Zap': Zap,
  'Wrench': Wrench,
}

// Colores de fondo para cada categoría
const categoryColors = [
  { bg: 'bg-gradient-to-br from-red-700 to-red-900', iconBg: 'bg-white/20', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-zinc-800 to-zinc-900', iconBg: 'bg-white/10', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-amber-500 to-amber-700', iconBg: 'bg-white/20', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-slate-700 to-slate-900', iconBg: 'bg-white/10', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-red-800 to-red-950', iconBg: 'bg-white/20', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-zinc-700 to-zinc-800', iconBg: 'bg-white/10', text: 'text-white' },
]

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const totalProducts = categories.reduce((acc, c) => acc + c.products_count, 0)

  return (
    <section id="categorias" className="py-20 bg-zinc-100 relative">
      <div className="container-custom">
        {/* Header compacto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block font-mono text-xs text-red-700 tracking-[0.3em] uppercase mb-3 
                         bg-red-50 px-4 py-2 border border-red-200">
            Nuestras Categorías
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-zinc-900">
            ¿QUÉ ESTÁS BUSCANDO?
          </h2>
        </motion.div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-700" />
          </div>
        ) : (
          <>
            {/* Bento Grid de Categorías */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {categories.map((category, index) => {
                const IconComponent = iconMap[category.icon] || Settings
                const colors = categoryColors[index % categoryColors.length]
                // Primera categoría ocupa 2 columnas en desktop
                const isLarge = index === 0
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className={isLarge ? 'col-span-2 row-span-2' : ''}
                  >
                    <Link
                      to={`/catalogo/${category.slug}`}
                      className={`group relative block h-full min-h-[140px] ${isLarge ? 'min-h-[300px]' : 'md:min-h-[160px]'}
                                rounded-2xl overflow-hidden transition-all duration-300
                                hover:scale-[1.02] hover:shadow-xl ${colors.bg}`}
                    >
                      {/* Pattern overlay sutil */}
                      <div className="absolute inset-0 opacity-10"
                           style={{
                             backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                             backgroundSize: '24px 24px'
                           }} />
                      
                      {/* Content */}
                      <div className="relative h-full p-5 md:p-6 flex flex-col justify-between">
                        {/* Top: Icon + Badge */}
                        <div className="flex items-start justify-between">
                          <div className={`${colors.iconBg} p-3 rounded-xl backdrop-blur-sm`}>
                            <IconComponent className={`w-6 h-6 ${isLarge ? 'md:w-8 md:h-8' : ''} ${colors.text}`} />
                          </div>
                          <span className={`font-mono text-xs ${colors.text} opacity-70 
                                         bg-black/20 px-2 py-1 rounded-full`}>
                            {category.products_count}
                          </span>
                        </div>
                        
                        {/* Bottom: Name + Arrow */}
                        <div className="mt-auto">
                          <h3 className={`font-display ${isLarge ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} 
                                       ${colors.text} leading-tight`}>
                            {category.name.toUpperCase()}
                          </h3>
                          {isLarge && category.description && (
                            <p className={`${colors.text} opacity-70 text-sm mt-2 line-clamp-2`}>
                              {category.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-3 group-hover:gap-3 transition-all">
                            <span className={`text-sm ${colors.text} opacity-80`}>Ver productos</span>
                            <ChevronRight className={`w-4 h-4 ${colors.text} opacity-80 
                                                    group-hover:translate-x-1 transition-transform`} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Banner Ver Todo - Full width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6"
            >
              <Link
                to="/catalogo"
                className="group relative block w-full rounded-2xl overflow-hidden
                          bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900
                          hover:shadow-2xl transition-all duration-500"
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-700/0 via-red-700/20 to-red-700/0 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <div className="relative px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    <div className="bg-red-700 p-4 rounded-xl">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="font-display text-2xl md:text-3xl text-white">
                        VER CATÁLOGO COMPLETO
                      </h3>
                      <p className="text-zinc-400 text-sm mt-1">
                        Explorá todos nuestros repuestos disponibles
                      </p>
                    </div>
                  </div>
                  
                  {/* Right */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="font-display text-3xl md:text-4xl text-red-500">{totalProducts}+</span>
                      <p className="font-mono text-xs text-zinc-500 uppercase">Productos</p>
                    </div>
                    
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-red-700 rounded-full flex items-center justify-center
                                  group-hover:bg-white transition-colors">
                      <ChevronRight className="w-6 h-6 text-white group-hover:text-red-700 
                                             group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
