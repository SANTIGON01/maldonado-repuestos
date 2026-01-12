/**
 * Quote Request Modal
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle } from 'lucide-react'
import api from '../lib/api'

export default function QuoteModal({ isOpen, onClose, product = null }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle_info: '',
    message: product 
      ? `Hola, me interesa el producto: ${product.name} (${product.code})` 
      : '',
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
      await api.createQuote(formData)
      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        setIsSuccess(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          vehicle_info: '',
          message: '',
        })
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white w-full max-w-lg border-4 border-maldonado-dark shadow-solid-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-maldonado-red text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-2xl">SOLICITAR COTIZACIÓN</h2>
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
                  <h3 className="font-heading text-xl mb-2">¡Solicitud Enviada!</h3>
                  <p className="text-maldonado-chrome text-center">
                    Nos pondremos en contacto a la brevedad.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-2">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block font-heading text-sm mb-1">NOMBRE *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-heading text-sm mb-1">EMAIL *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
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
                      className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
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
                      className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-heading text-sm mb-1">MENSAJE *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-maldonado-red text-white font-display text-xl py-3 flex items-center justify-center gap-2 hover:bg-maldonado-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                    {isSubmitting ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

