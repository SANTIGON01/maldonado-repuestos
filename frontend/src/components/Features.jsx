import { useState } from 'react'
import { motion } from 'framer-motion'
import { Truck, Clock, Headphones, Award, MessageCircle, Wrench, Package, Users } from 'lucide-react'

// Componente para mostrar logo de marca con fallback a texto
function BrandLogo({ brand }) {
  const [imgError, setImgError] = useState(false)
  
  if (!brand.logo_url || imgError) {
    // Fallback: mostrar nombre como texto estilizado
    return (
      <p className="font-heading text-lg text-maldonado-dark text-center font-bold">
        {brand.name}
      </p>
    )
  }
  
  return (
    <img 
      src={brand.logo_url} 
      alt={`Logo ${brand.name}`}
      className="max-h-12 max-w-[80%] object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
      onError={() => setImgError(true)}
    />
  )
}

const features = [
  {
    icon: Truck,
    title: 'ENVÍOS A TODO EL PAÍS',
    description: 'Despachamos a cualquier punto de Argentina con logística propia y tercerizada.',
    highlight: 'COBERTURA NACIONAL',
  },
  {
    icon: Clock,
    title: 'STOCK PERMANENTE',
    description: 'Más de 15.000 referencias en stock listas para despacho inmediato.',
    highlight: '+15.000 REFERENCIAS',
  },
  {
    icon: MessageCircle,
    title: 'COTIZACIÓN INMEDIATA',
    description: 'Respondemos tus consultas en menos de 2 horas por WhatsApp.',
    highlight: 'RESPUESTA RÁPIDA',
  },
  {
    icon: Headphones,
    title: 'ASESORAMIENTO TÉCNICO',
    description: 'Equipo especializado para ayudarte a encontrar el repuesto exacto.',
    highlight: 'SOPORTE EXPERTO',
  },
]

// Marcas con sus logos (agregar logo_url cuando se tenga la imagen)
const brands = [
  { name: 'BPW', logo_url: '/brands/bpw.png' },
  { name: 'MERITOR', logo_url: '/brands/meritor.png' },
  { name: 'WABCO', logo_url: '/brands/wabco.png' },
  { name: 'JOST', logo_url: '/brands/jost.png' },
  { name: 'SAF', logo_url: '/brands/saf.png' },
  { name: 'HALDEX', logo_url: '/brands/haldex.png' },
  { name: 'RANDON', logo_url: '/brands/randon.png' },
  { name: 'HELLA', logo_url: '/brands/hella.png' },
  { name: 'BENDIX', logo_url: '/brands/bendix.png' },
  { name: 'KNORR', logo_url: '/brands/knorr.png' },
  { name: 'FRUEHAUF', logo_url: '/brands/fruehauf.png' },
  { name: 'KRONE', logo_url: '/brands/krone.png' },
]

export default function Features() {
  return (
    <section id="nosotros" className="relative overflow-hidden">
      {/* Features section - Diseño moderno */}
      <div className="py-20 lg:py-28 bg-gradient-to-b from-zinc-100 to-white">
        <div className="container-custom">
          {/* Header mejorado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 lg:mb-20"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <span className="inline-block font-mono text-xs text-white bg-maldonado-red px-3 py-1 mb-4">
                  ¿POR QUÉ ELEGIRNOS?
                </span>
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-maldonado-dark leading-none">
                  TU SOCIO DE<br />
                  <span className="text-maldonado-red">CONFIANZA</span>
                </h2>
              </div>
              <p className="text-lg text-maldonado-chrome max-w-md lg:text-right">
                Más de <strong className="text-maldonado-dark">25 años</strong> abasteciendo al transporte argentino 
                con repuestos de calidad y atención personalizada.
              </p>
            </div>
          </motion.div>

          {/* Features grid - Diseño cards modernas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl p-6 lg:p-8 
                         border border-zinc-200 hover:border-maldonado-red/30
                         shadow-sm hover:shadow-xl transition-all duration-500
                         overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-maldonado-red/5 to-transparent 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Highlight badge */}
                <span className="relative inline-block font-mono text-[10px] tracking-wider 
                               text-maldonado-red bg-maldonado-red/10 px-2 py-1 rounded-full mb-4">
                  {feature.highlight}
                </span>

                <div className="relative flex gap-4 lg:gap-6">
                  {/* Icon container */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-maldonado-dark rounded-xl 
                                  flex items-center justify-center
                                  group-hover:bg-maldonado-red group-hover:scale-110 
                                  transition-all duration-300">
                      <feature.icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg lg:text-xl text-maldonado-dark mb-2
                                 group-hover:text-maldonado-red transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-maldonado-chrome text-sm lg:text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 
                              bg-gradient-to-br from-maldonado-red/10 to-transparent rounded-full
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>

          {/* CTA Banner integrado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 lg:mt-16"
          >
            <div className="relative bg-maldonado-dark rounded-2xl p-8 lg:p-12 overflow-hidden">
              {/* Pattern */}
              <div className="absolute inset-0 opacity-10"
                   style={{
                     backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                     backgroundSize: '32px 32px'
                   }} />
              
              <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-maldonado-red rounded-xl flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-display text-2xl lg:text-3xl text-white">
                      +25 AÑOS DE EXPERIENCIA
                    </p>
                    <p className="text-white/60 text-sm lg:text-base">
                      Respaldados por miles de clientes satisfechos en todo el país
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-8 text-center">
                  <div>
                    <p className="font-display text-3xl lg:text-4xl text-maldonado-red">10K+</p>
                    <p className="font-mono text-[10px] text-white/50 tracking-wider">CLIENTES</p>
                  </div>
                  <div className="w-px bg-white/20" />
                  <div>
                    <p className="font-display text-3xl lg:text-4xl text-maldonado-red">500+</p>
                    <p className="font-mono text-[10px] text-white/50 tracking-wider">MARCAS</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Brands section - Diseño más limpio */}
      <div className="py-20 lg:py-24 bg-maldonado-dark relative">
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block font-mono text-xs text-maldonado-dark bg-maldonado-red px-3 py-1 mb-4">
              MARCAS QUE TRABAJAMOS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white">
              REPUESTOS<br className="sm:hidden" /> <span className="text-maldonado-red">ORIGINALES</span>
            </h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto">
              Trabajamos con las principales marcas del mercado para garantizar la calidad de cada repuesto
            </p>
          </motion.div>

          {/* Brands grid con logos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((brand, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                className="group relative bg-white rounded-xl p-4 h-20 
                         flex items-center justify-center
                         border-2 border-transparent hover:border-maldonado-red
                         shadow-lg hover:shadow-xl hover:shadow-maldonado-red/20
                         transition-all duration-300 cursor-pointer
                         overflow-hidden"
              >
                {/* Logo de la marca */}
                <BrandLogo brand={brand} />
                
                {/* Hover overlay con nombre */}
                <div className="absolute inset-0 bg-maldonado-red/95 flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-heading text-sm text-white text-center">
                    {brand.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom message */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-white/40 text-sm mt-8"
          >
            ¿No encontrás la marca que buscás? <span className="text-maldonado-red">Consultanos</span>, 
            trabajamos con más de 500 marcas.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
