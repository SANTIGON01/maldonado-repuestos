import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, ArrowUp, Star, ChevronDown } from 'lucide-react'

// Información del negocio
const BUSINESS_INFO = {
  phone: '0261 15-454-4128',
  phoneLink: 'tel:+5492614544128',
  email: 'repuestos@maldonadosaci.com',
  address: 'Carril Rodríguez Peña 2251',
  city: 'M5515 Maipú, Mendoza',
  googleRating: 4.7,
  googleReviews: 118,
  googleMapsUrl: 'https://maps.google.com/?q=Carril+Rodriguez+Peña+2251+Maipu+Mendoza',
}

const footerLinks = {
  productos: ['Ejes y Mazas', 'Sistema de Frenos', 'Suspensión', 'Iluminación', 'Bulonería', 'Herramientas'],
  empresa: ['Sobre Nosotros', 'Historia', 'Ubicación'],
  ayuda: ['Preguntas Frecuentes', 'Envíos', 'Garantías'],
}

function FooterAccordionSection({ title, links }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <h3 className="font-heading text-white">{title}</h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-white/60" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pb-3"
          >
            {links.map((link) => (
              <li key={link}>
                <a href="#" className="font-body text-sm text-white/60 hover:text-maldonado-red-500 transition-colors py-2 block">
                  {link}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default memo(function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-maldonado-dark relative">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Back to top button */}
      <div className="container-custom relative z-10">
        <div className="flex justify-end -translate-y-1/2">
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="w-14 h-14 bg-maldonado-red-700 text-white
                     border-2 border-maldonado-red-600 shadow-brutal
                     flex items-center justify-center
                     hover:bg-maldonado-red-800 transition-colors"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container-custom py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo and info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/unnamed.jpg"
                alt="Maldonado Repuestos"
                className="h-16 w-16 object-contain rounded-full border-2 border-maldonado-chrome/30"
              />
              <div>
                <p className="font-display text-2xl text-white">MALDONADO</p>
                <p className="font-heading text-sm text-maldonado-red-500 tracking-widest -mt-0.5">
                  REPUESTOS
                </p>
              </div>
            </div>

            <p className="font-body text-white/60 mb-8 max-w-sm">
              Tu proveedor de confianza en repuestos para semirremolques y acoplados.
              +30 años abasteciendo al transporte argentino.
            </p>

            {/* Google Rating */}
            <a
              href={BUSINESS_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 mb-6
                       hover:bg-white/20 transition-colors group"
            >
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-display text-xl text-white">{BUSINESS_INFO.googleRating}</span>
              </div>
              <div className="text-white/60 text-xs">
                <span className="text-white font-medium">({BUSINESS_INFO.googleReviews})</span> reseñas en Google
              </div>
            </a>

            {/* Contact info */}
            <div className="space-y-1">
              <a href={BUSINESS_INFO.phoneLink} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors py-2 block">
                <Phone className="w-4 h-4 text-maldonado-red-500" />
                <span className="font-mono text-sm">{BUSINESS_INFO.phone}</span>
              </a>
              <a href={`mailto:${BUSINESS_INFO.email}`} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors py-2 block">
                <Mail className="w-4 h-4 text-maldonado-red-500" />
                <span className="font-mono text-sm">{BUSINESS_INFO.email}</span>
              </a>
              <a
                href={BUSINESS_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-white/60 hover:text-white transition-colors py-2 block"
              >
                <MapPin className="w-4 h-4 text-maldonado-red-500 mt-0.5" />
                <div className="font-mono text-sm">
                  <p>{BUSINESS_INFO.address}</p>
                  <p className="text-white/40">{BUSINESS_INFO.city}</p>
                </div>
              </a>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2 mt-8">
              {[Facebook, Instagram, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-11 h-11 bg-white/5 border border-white/10
                           flex items-center justify-center text-white/60
                           hover:bg-maldonado-red-700 hover:border-maldonado-red-700
                           hover:text-white transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Accordion */}
          <div className="md:hidden lg:col-span-3">
            <FooterAccordionSection title="PRODUCTOS" links={footerLinks.productos} />
            <FooterAccordionSection title="EMPRESA" links={footerLinks.empresa} />
            <FooterAccordionSection title="AYUDA" links={footerLinks.ayuda} />
          </div>

          {/* Desktop link columns */}
          <div className="hidden md:block">
            <h3 className="font-heading text-white mb-4">PRODUCTOS</h3>
            <ul className="space-y-1">
              {footerLinks.productos.map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-white/60 hover:text-maldonado-red-500 transition-colors py-2 block">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:block">
            <h3 className="font-heading text-white mb-4">EMPRESA</h3>
            <ul className="space-y-1">
              {footerLinks.empresa.map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-white/60 hover:text-maldonado-red-500 transition-colors py-2 block">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:block">
            <h3 className="font-heading text-white mb-4">AYUDA</h3>
            <ul className="space-y-1">
              {footerLinks.ayuda.map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-white/60 hover:text-maldonado-red-500 transition-colors py-2 block">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-white/40">
            © 2026 MALDONADO REPUESTOS. TODOS LOS DERECHOS RESERVADOS.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="font-mono text-xs text-white/40 hover:text-white transition-colors py-2 px-1">
              TÉRMINOS
            </a>
            <a href="#" className="font-mono text-xs text-white/40 hover:text-white transition-colors py-2 px-1">
              PRIVACIDAD
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
})
