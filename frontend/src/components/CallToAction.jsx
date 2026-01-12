import { motion } from 'framer-motion'
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, ArrowUpRight } from 'lucide-react'

const contactInfo = [
  {
    icon: Phone,
    label: 'TELÉFONO',
    value: '+54 11 1234-5678',
    href: 'tel:+541112345678',
  },
  {
    icon: MessageCircle,
    label: 'WHATSAPP',
    value: '+54 11 1234-5678',
    href: 'https://wa.me/5491112345678',
  },
  {
    icon: Mail,
    label: 'EMAIL',
    value: 'ventas@maldonadorepuestos.com',
    href: 'mailto:ventas@maldonadorepuestos.com',
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
    <section id="contacto" className="py-24 bg-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-maldonado-cream -skew-x-12 translate-x-1/4" />
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-sm text-maldonado-red-700 tracking-widest">
              [ CONTACTO ]
            </span>
            <h2 className="font-display text-5xl sm:text-6xl text-maldonado-dark mt-2 mb-8">
              ¿NECESITÁS UNA
              <br />
              <span className="text-maldonado-red-700">COTIZACIÓN?</span>
            </h2>
            
            <p className="font-body text-lg text-maldonado-chrome mb-10 max-w-md">
              Nuestro equipo de especialistas en semirremolques está listo para 
              asesorarte y encontrar la mejor solución.
            </p>

            {/* Contact cards */}
            <div className="space-y-3">
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
                      className="group flex items-center gap-4 p-4 bg-maldonado-cream border-2 border-transparent
                               hover:border-maldonado-dark hover:bg-white transition-all"
                    >
                      <div className="w-12 h-12 bg-maldonado-dark flex items-center justify-center
                                    group-hover:bg-maldonado-red-700 transition-colors">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-xs text-maldonado-chrome">{item.label}</p>
                        <p className="font-heading text-maldonado-dark">{item.value}</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-maldonado-chrome 
                                             group-hover:text-maldonado-red-700 transition-colors" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-maldonado-cream">
                      <div className="w-12 h-12 bg-maldonado-dark flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-mono text-xs text-maldonado-chrome">{item.label}</p>
                        <p className="font-heading text-maldonado-dark">{item.value}</p>
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
              href="https://wa.me/5491112345678?text=Hola!%20Necesito%20cotización"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 mt-8 px-8 py-4 
                       bg-green-600 text-white font-heading
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
            className="bg-maldonado-dark p-8 lg:p-10 border-2 border-maldonado-dark"
          >
            <h3 className="font-display text-3xl text-white mb-2">
              ENVIANOS TU CONSULTA
            </h3>
            <p className="font-body text-white/60 mb-8">
              Respondemos en menos de 24 horas hábiles
            </p>

            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs text-white/60 mb-2 block">NOMBRE *</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full bg-white/5 border-2 border-white/10 px-4 py-3
                             text-white placeholder:text-white/30 font-body
                             focus:outline-none focus:border-maldonado-red-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-white/60 mb-2 block">TELÉFONO *</label>
                  <input
                    type="tel"
                    placeholder="+54 11 1234-5678"
                    className="w-full bg-white/5 border-2 border-white/10 px-4 py-3
                             text-white placeholder:text-white/30 font-body
                             focus:outline-none focus:border-maldonado-red-700 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs text-white/60 mb-2 block">EMAIL *</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full bg-white/5 border-2 border-white/10 px-4 py-3
                           text-white placeholder:text-white/30 font-body
                           focus:outline-none focus:border-maldonado-red-700 transition-colors"
                />
              </div>

              <div>
                <label className="font-mono text-xs text-white/60 mb-2 block">SEMIRREMOLQUE</label>
                <input
                  type="text"
                  placeholder="Marca, modelo, año..."
                  className="w-full bg-white/5 border-2 border-white/10 px-4 py-3
                           text-white placeholder:text-white/30 font-body
                           focus:outline-none focus:border-maldonado-red-700 transition-colors"
                />
              </div>

              <div>
                <label className="font-mono text-xs text-white/60 mb-2 block">¿QUÉ REPUESTO NECESITÁS? *</label>
                <textarea
                  rows={4}
                  placeholder="Describí el repuesto que buscás..."
                  className="w-full bg-white/5 border-2 border-white/10 px-4 py-3
                           text-white placeholder:text-white/30 font-body resize-none
                           focus:outline-none focus:border-maldonado-red-700 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 
                         bg-maldonado-red-700 text-white font-heading py-4
                         border-2 border-maldonado-red-600
                         hover:bg-maldonado-red-800 transition-colors"
              >
                <Send className="w-5 h-5" />
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
          className="mt-16 bg-maldonado-cream border-2 border-maldonado-dark h-64 
                   flex items-center justify-center relative overflow-hidden"
        >
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="text-center relative z-10">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-maldonado-red-700" />
            <p className="font-heading text-xl text-maldonado-dark">VISITANOS EN NUESTRO LOCAL</p>
            <p className="font-body text-maldonado-chrome mt-1">Av. Ejemplo 1234, Buenos Aires</p>
            <button className="mt-4 px-6 py-2 bg-maldonado-dark text-white font-mono text-sm
                            hover:bg-maldonado-red-700 transition-colors">
              VER EN GOOGLE MAPS
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
