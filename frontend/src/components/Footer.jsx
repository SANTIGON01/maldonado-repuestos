import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, ArrowUp, Star } from 'lucide-react'

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

export default function Footer() {
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
            <div className="space-y-3">
              <a href={BUSINESS_INFO.phoneLink} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-maldonado-red-500" />
                <span className="font-mono text-sm">{BUSINESS_INFO.phone}</span>
              </a>
              <a href={`mailto:${BUSINESS_INFO.email}`} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-maldonado-red-500" />
                <span className="font-mono text-sm">{BUSINESS_INFO.email}</span>
              </a>
              <a 
                href={BUSINESS_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-white/60 hover:text-white transition-colors"
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
                  className="w-10 h-10 bg-white/5 border border-white/10 
                           flex items-center justify-center text-white/60
                           hover:bg-maldonado-red-700 hover:border-maldonado-red-700 
                           hover:text-white transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Products links */}
          <div>
            <h3 className="font-heading text-white mb-4">PRODUCTOS</h3>
            <ul className="space-y-2">
              {footerLinks.productos.map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-white/60 hover:text-maldonado-red-500 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-heading text-white mb-4">EMPRESA</h3>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-white/60 hover:text-maldonado-red-500 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h3 className="font-heading text-white mb-4">AYUDA</h3>
            <ul className="space-y-2">
              {footerLinks.ayuda.map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-white/60 hover:text-maldonado-red-500 transition-colors">
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
            <a href="#" className="font-mono text-xs text-white/40 hover:text-white transition-colors">
              TÉRMINOS
            </a>
            <a href="#" className="font-mono text-xs text-white/40 hover:text-white transition-colors">
              PRIVACIDAD
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
