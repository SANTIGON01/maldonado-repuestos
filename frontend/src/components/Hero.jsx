import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowDown, Truck, Shield, Wrench, ChevronLeft, ChevronRight, Percent, Sparkles, Package } from 'lucide-react'
import api from '../lib/api'

// Slide principal (intro original)
function IntroSlide() {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
      {/* Left content */}
      <div className="space-y-5 sm:space-y-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2 sm:gap-3 bg-maldonado-red-700 text-white 
                       px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-xs sm:text-sm border-l-4 border-white">
            <span className="w-2 h-2 bg-white animate-pulse" />
            +30 AÑOS EN EL RUBRO
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="font-display text-[2.5rem] leading-[0.85] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white sm:leading-[0.9]">
            REPUESTOS
            <br />
            <span className="text-outline text-maldonado-red-500">PARA TU</span>
            <br />
            <span className="relative inline-block">
              SEMIRREMOLQUE
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-2 sm:h-3 bg-maldonado-red-700 origin-left"
              />
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-heading text-xl sm:text-2xl lg:text-3xl text-white/90 tracking-wider uppercase"
        >
          PARA TODAS LAS MARCAS
        </motion.h2>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col xs:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4"
        >
          <Link to="/catalogo" className="btn-brutal group text-center justify-center">
            VER CATÁLOGO
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#contacto" className="btn-brutal-white text-center justify-center">
            PEDIR COTIZACIÓN
          </a>
        </motion.div>

        {/* Mobile Image - Solo visible en móvil */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="lg:hidden mt-4"
        >
          <div className="relative mx-auto max-w-xs">
            {/* Logo container móvil */}
            <div className="relative bg-gradient-to-br from-maldonado-dark-light/50 to-maldonado-dark/50 
                          p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <img 
                src="/unnamed.jpg" 
                alt="Maldonado Repuestos"
                className="w-full max-w-[200px] mx-auto rounded-xl"
              />
              
              {/* Mini badges flotantes móvil */}
              <div className="absolute -top-2 -right-2 bg-maldonado-red-700 text-white 
                            px-2 py-1 text-[10px] font-mono rounded-full border border-maldonado-red-600">
                +30 AÑOS
              </div>
            </div>

            {/* Mini cards en móvil */}
            <div className="flex justify-center gap-2 mt-3">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                <Truck className="w-3 h-3 text-maldonado-red-500" />
                <span className="text-[10px] text-white font-mono">ENVÍOS</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                <Shield className="w-3 h-3 text-maldonado-red-500" />
                <span className="text-[10px] text-white font-mono">GARANTÍA</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                <Wrench className="w-3 h-3 text-maldonado-red-500" />
                <span className="text-[10px] text-white font-mono">EXPERTOS</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-4 sm:flex sm:gap-8 pt-6 sm:pt-8 border-t border-white/10"
        >
          {[
            { value: '15K+', label: 'PRODUCTOS' },
            { value: '500+', label: 'MARCAS' },
            { value: '10K+', label: 'CLIENTES' },
          ].map((stat, i) => (
            <div key={i} className="text-center sm:text-left">
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-maldonado-red-500">{stat.value}</p>
              <p className="font-mono text-[10px] sm:text-xs text-white/40 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right visual - Solo desktop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="relative hidden lg:block"
      >
        {/* Main logo display */}
        <div className="relative">
          {/* Decorative frame */}
          <div className="absolute -inset-8 border-2 border-dashed border-white/10" />
          <div className="absolute -inset-4 border border-maldonado-red-700/30" />
          
          {/* Logo container */}
          <div className="relative bg-gradient-to-br from-maldonado-dark-light to-maldonado-dark 
                        p-12 border-2 border-maldonado-chrome/30">
            <img 
              src="/unnamed.jpg" 
              alt="Maldonado Repuestos"
              className="w-full max-w-md mx-auto"
            />
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-maldonado-red-700" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-maldonado-red-700" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-maldonado-red-700" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-maldonado-red-700" />
          </div>

          {/* Floating cards */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -left-12 top-1/4 bg-maldonado-dark border-2 border-maldonado-chrome/30 p-4"
          >
            <Truck className="w-8 h-8 text-maldonado-red-500 mb-2" />
            <p className="font-heading text-white text-sm">ENVÍOS</p>
            <p className="font-mono text-white/50 text-xs">A TODO EL PAÍS</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -right-8 top-1/2 bg-maldonado-red-700 border-2 border-maldonado-red-600 p-4"
          >
            <Shield className="w-8 h-8 text-white mb-2" />
            <p className="font-heading text-white text-sm">GARANTÍA</p>
            <p className="font-mono text-white/80 text-xs">OFICIAL</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity }}
            className="absolute -left-4 -bottom-8 bg-white border-2 border-maldonado-dark p-4 shadow-brutal-sm"
          >
            <Wrench className="w-8 h-8 text-maldonado-dark mb-2" />
            <p className="font-heading text-maldonado-dark text-sm">EXPERTOS</p>
            <p className="font-mono text-maldonado-chrome text-xs">EN EL RUBRO</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// Helper para construir el link del banner con filtros
const getBannerLink = (banner) => {
  let link = banner.button_link || '/catalogo'

  // Si tiene códigos, agregar parámetro codes
  if (banner.product_codes && banner.product_codes.trim()) {
    const codes = banner.product_codes.trim().replace(/\s+/g, ',')
    const separator = link.includes('?') ? '&' : '?'
    link += `${separator}codes=${encodeURIComponent(codes)}`
  } else if (link === '/catalogo') {
    // Sin códigos pero link al catálogo → mostrar productos en promoción
    link += '?on_promotion=true'
  }

  return link
}

// Slide de promo/banner dinámico
function PromoSlide({ banner }) {
  const iconMap = {
    promo: Percent,
    news: Sparkles,
    product: Package,
    general: ArrowRight,
  }
  const Icon = iconMap[banner.banner_type] || Percent

  // Colores de fondo
  const bgClasses = {
    'gradient-red': 'bg-gradient-to-br from-red-700 via-red-800 to-red-950',
    'dark': 'bg-gradient-to-br from-zinc-800 via-zinc-900 to-black',
    'gradient-dark': 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900',
  }
  const bgClass = bgClasses[banner.bg_color] || bgClasses['gradient-red']

  return (
    <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center w-full h-full">
      {/* Left - Content */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Badge tipo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white 
                       px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider border border-white/20 rounded-full">
            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
            {banner.banner_type === 'promo' ? 'PROMOCIÓN' : 
             banner.banner_type === 'news' ? 'NOVEDAD' : 
             banner.banner_type === 'product' ? 'PRODUCTO' : 'DESTACADO'}
          </span>
        </motion.div>

        {/* Título principal */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white leading-[0.95]"
        >
          {banner.title}
        </motion.h2>

        {/* Subtítulo */}
        {banner.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-heading text-lg sm:text-xl lg:text-2xl text-maldonado-red-400"
          >
            {banner.subtitle}
          </motion.p>
        )}

        {/* Descripción */}
        {banner.description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm sm:text-base lg:text-lg text-white/60 max-w-lg"
          >
            {banner.description}
          </motion.p>
        )}

        {/* CTA Button */}
        {banner.button_text && banner.button_link && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to={getBannerLink(banner)}
              className="btn-brutal group inline-flex text-center justify-center"
            >
              {banner.button_text}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}

        {/* Mobile Image - Imagen del banner visible en móvil */}
        {banner.image_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:hidden mt-4"
          >
            <div className={`relative mx-auto max-w-[320px] aspect-[4/3] rounded-2xl ${bgClass} 
                          border border-white/20 overflow-hidden shadow-xl`}>
              <div className="absolute inset-0 flex items-center justify-center p-3">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
              {/* Badge de tipo */}
              <div className="absolute top-2 left-2 bg-white/90 text-maldonado-dark 
                            px-2 py-1 text-[10px] font-bold rounded-full">
                {banner.banner_type === 'promo' ? '¡OFERTA!' : '¡NUEVO!'}
              </div>
            </div>
            {/* Logo de marca en móvil - FUERA DEL CONTENEDOR */}
            {banner.brand && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-3 -right-3 bg-white px-3 py-2 rounded-lg shadow-xl border border-zinc-200 z-10"
              >
                <img 
                  src={`/brands/${banner.brand.toLowerCase()}.png`}
                  alt={banner.brand}
                  className="h-6 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <span className="font-heading text-maldonado-dark text-xs hidden">
                  {banner.brand}
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Right - Visual - Solo desktop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative hidden lg:flex items-center justify-center"
      >
        {/* Container de imagen/visual - MÁS GRANDE */}
        <div className={`relative w-full max-w-xl xl:max-w-2xl aspect-[4/3] rounded-3xl ${bgClass} 
                      border-2 border-white/10 overflow-hidden shadow-2xl`}>
          
          {/* Si hay imagen del producto, mostrarla */}
          {banner.image_url ? (
            <>
              {/* Imagen del producto - MÁS GRANDE */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <motion.img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-contain drop-shadow-2xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                />
              </div>
              {/* Efecto de brillo detrás de la imagen */}
              <div className="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent" />
            </>
          ) : (
            <>
              {/* Pattern overlay si no hay imagen */}
              <div className="absolute inset-0 opacity-20"
                   style={{
                     backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                     backgroundSize: '32px 32px'
                   }} />
              
              {/* Icono grande centrado */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="w-40 h-40 text-white/20" />
              </div>
            </>
          )}

          {/* Decoración esquinas */}
          <div className="absolute top-4 left-4 w-20 h-20 border-t-4 border-l-4 border-white/30" />
          <div className="absolute bottom-4 right-4 w-20 h-20 border-b-4 border-r-4 border-white/30" />
        </div>
        
        {/* Logo de la marca - FUERA DEL CONTENEDOR */}
        {banner.brand && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute top-0 right-0 bg-white px-5 py-3 rounded-xl shadow-2xl border-2 border-zinc-200 z-10"
          >
            <img 
              src={`/brands/${banner.brand.toLowerCase()}.png`}
              alt={banner.brand}
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <span 
              className="font-heading text-maldonado-dark text-lg hidden"
            >
              {banner.brand}
            </span>
          </motion.div>
        )}

        {/* Floating badge */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -bottom-6 -left-6 bg-white text-maldonado-dark px-8 py-5 
                   shadow-2xl border-2 border-maldonado-dark rounded-lg"
        >
          <p className="font-display text-4xl text-maldonado-red-700">
            {banner.banner_type === 'promo' ? '¡OFERTA!' : '¡NUEVO!'}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function Hero({ onQuoteClick }) {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Cargar banners del backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await api.getBanners()
        setBanners(data)
      } catch (error) {
        console.error('Error loading banners:', error)
      }
    }
    fetchBanners()
  }, [])

  // Total de slides: 1 (intro) + banners
  const totalSlides = 1 + banners.length

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides)
    }, 6000) // Cambiar cada 6 segundos

    return () => clearInterval(interval)
  }, [isAutoPlaying, totalSlides])

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Reanudar auto-play después de 10 segundos de inactividad
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % totalSlides)
  }, [currentSlide, totalSlides, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides)
  }, [currentSlide, totalSlides, goToSlide])

  return (
    <section className="relative min-h-screen bg-maldonado-dark overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Diagonal red accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-maldonado-red-700/10 
                      transform skew-x-12 translate-x-1/4" />
        
        {/* Large MR watermark */}
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 font-display text-[40vw] 
                      text-white/[0.02] leading-none select-none pointer-events-none">
          MR
        </div>
      </div>

      {/* Main content - Slider */}
      <div className="relative z-10 container-custom min-h-screen flex items-center pt-24 sm:pt-32 pb-28 sm:pb-24 px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {currentSlide === 0 ? (
              <IntroSlide />
            ) : (
              <PromoSlide banner={banners[currentSlide - 1]} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Controls - Solo si hay más de 1 slide */}
      {totalSlides > 1 && (
        <>
          {/* Flechas de navegación - ocultas en móvil pequeño, visibles en sm+ */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 
                     bg-white/10 hover:bg-white/20 backdrop-blur-sm
                     p-2 sm:p-3 rounded-full transition-all border border-white/20
                     hover:scale-110 hidden xs:flex items-center justify-center"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 
                     bg-white/10 hover:bg-white/20 backdrop-blur-sm
                     p-2 sm:p-3 rounded-full transition-all border border-white/20
                     hover:scale-110 hidden xs:flex items-center justify-center"
            aria-label="Siguiente slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          {/* Indicadores de posición - siempre visibles, mejor posicionados en móvil */}
          <div className="absolute bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'w-6 sm:w-8 bg-maldonado-red-500' 
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll indicator - oculto en móvil pequeño */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-16 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/40"
        >
          <span className="font-mono text-xs tracking-widest">SCROLL</span>
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.div>

      {/* Bottom marquee */}
      <div className="absolute bottom-0 left-0 right-0 bg-maldonado-red-700 py-2 sm:py-3 overflow-hidden z-10">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-4 sm:mx-8 font-display text-white/90 text-sm sm:text-lg">
              EJES • FRENOS • SUSPENSIÓN • ILUMINACIÓN • ACCESORIOS • KING PIN • PATAS DE APOYO •
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
