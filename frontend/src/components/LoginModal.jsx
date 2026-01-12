/**
 * Login/Register Modal
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn, UserPlus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function LoginModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  })
  
  const { login, register, isLoading, error, clearError } = useAuthStore()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await register(formData)
      }
      onClose()
      setFormData({ email: '', password: '', name: '', phone: '' })
    } catch (err) {
      // Error is already set in store
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    clearError()
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
            className="bg-white w-full max-w-md border-4 border-maldonado-dark shadow-solid-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-maldonado-dark text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-2xl">
                {isLogin ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
              </h2>
              <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-2">
                    {error}
                  </div>
                )}

                {!isLogin && (
                  <div>
                    <label className="block font-heading text-sm mb-1">NOMBRE *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required={!isLogin}
                      className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
                    />
                  </div>
                )}

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
                  <label className="block font-heading text-sm mb-1">CONTRASEÑA *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="block font-heading text-sm mb-1">TELÉFONO</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-maldonado-red text-white font-display text-xl py-3 flex items-center justify-center gap-2 hover:bg-maldonado-red-700 disabled:opacity-50 transition-colors"
                >
                  {isLogin ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      {isLoading ? 'INGRESANDO...' : 'INGRESAR'}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      {isLoading ? 'REGISTRANDO...' : 'REGISTRARSE'}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={toggleMode}
                  className="text-maldonado-red hover:underline font-heading"
                >
                  {isLogin ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

