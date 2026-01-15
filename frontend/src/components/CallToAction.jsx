import { motion } from 'framer-motion'
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, ArrowUpRight } from 'lucide-react'

// Información de contacto del negocio - Maipú, Mendoza
const PHONE_NUMBER = '0261 15-454-4128'
const PHONE_LINK = 'tel:+5492614544128'
const WHATSAPP_NUMBER = '5492614544128'
const EMAIL = 'ventas@maldonadorepuestos.com'
const ADDRESS = 'Carril Rodríguez Peña 2251'
const CITY = 'M5515 Maipú, Mendoza'
const GOOGLE_MAPS_URL = 'https://maps.google.com/?q=Carril+Rodriguez+Peña+2251+Maipu+Mendoza'

const contactInfo = [
  {
    icon: Phone,
    label: 'TELÉFONO',
    value: PHONE_NUMBER,
    href: PHONE_LINK,
  },
  {
    icon: MessageCircle,
    label: 'WHATSAPP',
    value: PHONE_NUMBER,
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
  },
  {
    icon: Mail,
    label: 'EMAIL',
    value: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    icon: Clock,
    label: 'HORARIO',
    value: 'Lun-Vie 8-18 | Sáb 8-13',
    href: null,
  },
]

export default function CallToAction({ onQuoteClick }) {
  return (
    <section id="contacto" className="py-12 sm:py-24 bg-white relative overflow-hidden">
      {/* Background elements - oculto en móvil */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-maldonado-cream -skew-x-12 translate-x-1/4 hidden sm:block" />
      
      <div className="container-custom relative z-10 px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
          {/* Left - Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-xs sm:text-sm text-maldonado-red-700 tracking-widest">
              [ CONTACTO ]
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-maldonado-dark mt-2 mb-4 sm:mb-8 leading-tight">
              ¿NECESITÁS UNA
              <br />
              <span className="text-maldonado-red-700">COTIZACIÓN?</span>
            </h2>
            
            <p className="font-body text-sm sm:text-base lg:text-lg text-maldonado-chrome mb-6 sm:mb-10 max-w-md">
              Nuestro equipo de especialistas en semirremolques está listo para 
              asesorarte y encontrar la mejor solución.
            </p>

            {/* Contact cards */}
            <div className="space-y-2 sm:space-y-3">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.href ? (
                    <a 
                      href={item.href}
                      className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-maldonado-cream rounded-lg sm:rounded-none border-2 border-transparent
                               hover:border-maldonado-dark hover:bg-white transition-all"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-maldonado-dark flex items-center justify-center rounded-lg sm:rounded-none
                                    group-hover:bg-maldonado-red-700 transition-colors flex-shrink-0">
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[10px] sm:text-xs text-maldonado-chrome">{item.label}</p>
                        <p className="font-heading text-sm sm:text-base text-maldonado-dark truncate">{item.value}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-maldonado-chrome flex-shrink-0
                                             group-hover:text-maldonado-red-700 transition-colors" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-maldonado-cream rounded-lg sm:rounded-none">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-maldonado-dark flex items-center justify-center rounded-lg sm:rounded-none flex-shrink-0">
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] sm:text-xs text-maldonado-chrome">{item.label}</p>
                        <p className="font-heading text-sm sm:text-base text-maldonado-dark">{item.value}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('¡Hola! Necesito cotización de repuestos para semirremolque.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex sm:inline-flex items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 
                       bg-green-600 text-white font-heading text-sm sm:text-base rounded-xl sm:rounded-none
                       border-2 border-green-700 shadow-brutal
                       hover:translate-x-1 hover:translate-y-1 hover:shadow-none
                       transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              CHATEAR POR WHATSAPP
            </motion.a>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-maldonado-dark p-5 sm:p-8 lg:p-10 rounded-xl sm:rounded-none border-2 border-maldonado-dark"
          >
            <h3 className="font-display text-xl sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2">
              ENVIANOS TU CONSULTA
            </h3>
            <p className="font-body text-white/60 mb-5 sm:mb-8 text-sm sm:text-base">
              Respondemos en menos de 24 horas hábiles
            </p>

            <form className="space-y-3 sm:space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="font-mono text-[10px] sm:text-xs text-white/60 mb-1.5 sm:mb-2 block">NOMBRE *</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full bg-white/5 border-2 border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-none
                             text-white placeholder:text-white/30 font-body text-sm sm:text-base
                             focus:outline-none focus:border-maldonado-red-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] sm:text-xs text-white/60 mb-1.5 sm:mb-2 block">TELÉFONO *</label>
                  <input
                    type="tel"
                    placeholder="Ej: 0261 15-123-4567"
                    className="w-full bg-white/5 border-2 border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-none
                             text-white placeholder:text-white/30 font-body text-sm sm:text-base
                             focus:outline-none focus:border-maldonado-red-700 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] sm:text-xs text-white/60 mb-1.5 sm:mb-2 block">EMAIL *</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full bg-white/5 border-2 border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-none
                           text-white placeholder:text-white/30 font-body text-sm sm:text-base
                           focus:outline-none focus:border-maldonado-red-700 transition-colors"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] sm:text-xs text-white/60 mb-1.5 sm:mb-2 block">SEMIRREMOLQUE</label>
                <input
                  type="text"
                  placeholder="Marca, modelo, año..."
                  className="w-full bg-white/5 border-2 border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-none
                           text-white placeholder:text-white/30 font-body text-sm sm:text-base
                           focus:outline-none focus:border-maldonado-red-700 transition-colors"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] sm:text-xs text-white/60 mb-1.5 sm:mb-2 block">¿QUÉ REPUESTO NECESITÁS? *</label>
                <textarea
                  rows={3}
                  placeholder="Describí el repuesto que buscás..."
                  className="w-full bg-white/5 border-2 border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-none
                           text-white placeholder:text-white/30 font-body resize-none text-sm sm:text-base
                           focus:outline-none focus:border-maldonado-red-700 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 sm:gap-3 
                         bg-maldonado-red-700 text-white font-heading py-3 sm:py-4 rounded-xl sm:rounded-none
                         border-2 border-maldonado-red-600 text-sm sm:text-base
                         hover:bg-maldonado-red-800 transition-colors"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                ENVIAR CONSULTA
              </button>
            </form>
          </motion.div>
        </div>

        {/* Map placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-16 bg-maldonado-cream border-2 border-maldonado-dark h-48 sm:h-64 
                   flex items-center justify-center relative overflow-hidden rounded-xl sm:rounded-none"
        >
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="text-center relative z-10 px-4">
            <MapPin className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-maldonado-red-700" />
            <p className="font-heading text-base sm:text-xl text-maldonado-dark">VISITANOS EN NUESTRO LOCAL</p>
            <p className="font-body text-maldonado-chrome mt-1 text-sm sm:text-base">{ADDRESS}</p>
            <p className="font-body text-maldonado-chrome text-xs sm:text-sm">{CITY}</p>
            <a 
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-maldonado-dark text-white font-mono text-xs sm:text-sm rounded-lg sm:rounded-none
                       hover:bg-maldonado-red-700 transition-colors"
            >
              VER EN GOOGLE MAPS
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
