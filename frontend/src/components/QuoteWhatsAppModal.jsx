/**
 * Quote WhatsApp Modal
 * Modal para enviar cotización por WhatsApp
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Package, Loader2, CheckCircle, FileText } from 'lucide-react'
import { useLocalCartStore } from '../store/localCartStore'
import { generateQuoteMessage, openWhatsApp } from '../services/whatsapp'
import api from '../lib/api'

export default function QuoteWhatsAppModal({ isOpen, onClose }) {
  const { items, clearCart } = useLocalCartStore()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle_info: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Preparar datos para el backend
      const quoteData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        vehicle_info: formData.vehicle_info || null,
        message: formData.message || null,
        sent_via_whatsapp: true,
        items: items.map(item => ({
          product_id: item.product.id,
          product_code: item.product.code,
          product_name: item.product.name,
          quantity: item.quantity,
        })),
      }

      // Guardar en la base de datos y obtener el ID
      const savedQuote = await api.createQuoteWhatsApp(quoteData)
      
      // Generar mensaje breve con el número de solicitud
      const message = generateQuoteMessage(formData, items, savedQuote.id)
      
      // Abrir WhatsApp con el mensaje breve
      openWhatsApp(message)
      
      // Mostrar éxito
      setIsSuccess(true)
      
      // Limpiar carrito después de 2 segundos
      setTimeout(() => {
        clearCart()
        onClose()
        setIsSuccess(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          vehicle_info: '',
          message: '',
        })
      }, 2500)
      
    } catch (err) {
      setError(err.message || 'Error al procesar la cotización')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-maldonado-dark shadow-solid-dark"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-green-600 text-white px-6 py-4 flex items-center justify-between sticky top-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              <h2 className="font-display text-2xl">COTIZAR POR WHATSAPP</h2>
            </div>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center py-8"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="font-heading text-xl mb-2">¡Cotización Enviada!</h3>
                <p className="text-maldonado-chrome text-center">
                  Tu solicitud fue guardada y WhatsApp debería abrirse.<br />
                  Nos pondremos en contacto a la brevedad.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Resumen de productos */}
                <div className="mb-6">
                  <h3 className="font-heading text-lg mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    PRODUCTOS A COTIZAR ({items.length})
                  </h3>
                  <div className="bg-maldonado-cream border-2 border-maldonado-dark p-3 max-h-40 overflow-y-auto">
                    {items.map((item, index) => (
                      <div 
                        key={item.id} 
                        className={`flex justify-between py-2 ${index > 0 ? 'border-t border-maldonado-chrome/30' : ''}`}
                      >
                        <div>
                          <span className="font-mono text-xs text-maldonado-chrome">{item.product.code}</span>
                          <p className="text-sm font-medium">{item.product.name}</p>
                        </div>
                        <span className="font-mono text-sm">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-2">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-heading text-sm mb-1">NOMBRE COMPLETO *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Juan Pérez"
                        className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-green-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-heading text-sm mb-1">TELÉFONO *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Ej: 11-2345-6789"
                        className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-green-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-heading text-sm mb-1">EMAIL *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-green-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-heading text-sm mb-1">
                      SEMIRREMOLQUE / ACOPLADO (Opcional)
                    </label>
                    <input
                      type="text"
                      name="vehicle_info"
                      value={formData.vehicle_info}
                      onChange={handleChange}
                      placeholder="Ej: Randon SR 2020, Fruehauf 3 ejes"
                      className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-green-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-heading text-sm mb-1">CONSULTA ADICIONAL (Opcional)</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="¿Tenés alguna consulta o requerimiento especial?"
                      className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-green-600 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full bg-green-600 text-white font-display text-xl py-4 flex items-center justify-center gap-3 hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        PROCESANDO...
                      </>
                    ) : (
                      'ENVIAR COTIZACIÓN POR WHATSAPP'
                    )}
                  </button>

                  <p className="text-xs text-center text-maldonado-chrome">
                    Se abrirá WhatsApp con un mensaje de solicitud.<br />
                    Guardamos el detalle de los productos para enviarte la cotización formal.
                  </p>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

