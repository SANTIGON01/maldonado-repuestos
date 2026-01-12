import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, ArrowUp } from 'lucide-react'

const footerLinks = {
  productos: ['Ejes y Mazas', 'Sistema de Frenos', 'Suspensión', 'Iluminación', 'Accesorios'],
  empresa: ['Sobre Nosotros', 'Historia', 'Ubicación', 'Trabaja con Nosotros'],
  ayuda: ['Preguntas Frecuentes', 'Métodos de Pago', 'Envíos', 'Garantías'],
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
              +25 años abasteciendo al transporte argentino.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <a href="tel:+541112345678" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-maldonado-red-500" />
                <span className="font-mono text-sm">+54 11 1234-5678</span>
              </a>
              <a href="mailto:ventas@maldonadorepuestos.com" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-maldonado-red-500" />
                <span className="font-mono text-sm">ventas@maldonadorepuestos.com</span>
              </a>
              <div className="flex items-center gap-3 text-white/60">
                <MapPin className="w-4 h-4 text-maldonado-red-500" />
                <span className="font-mono text-sm">Av. Ejemplo 1234, Buenos Aires</span>
              </div>
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
