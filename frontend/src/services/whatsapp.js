/**
 * WhatsApp Service
 * Genera mensajes formateados y abre WhatsApp
 */

// Número de WhatsApp del negocio (sin + ni espacios)
// Formato: código país + código área + número
// Argentina = 54, Mendoza = 261
const WHATSAPP_NUMBER = '542614544128'

/**
 * Genera el mensaje de cotización para WhatsApp
 * Incluye productos con código y cantidad para que el empleado sepa qué cotizar
 * @param {Object} customerData - Datos del cliente
 * @param {Array} items - Items del carrito
 * @param {number} quoteId - ID de la cotización guardada en la base de datos
 * @returns {string} Mensaje formateado
 */
export function generateQuoteMessage(customerData, items, quoteId = null) {
  const { name, phone, vehicle_info, message } = customerData
  
  let msg = `Hola, buenos días.\n\n`
  msg += `Soy *${name}*, solicito cotización de:\n\n`
  
  // Lista de productos con código y cantidad
  items.forEach((item) => {
    msg += `• *${item.product.name}*\n`
    msg += `  Cód: ${item.product.code} - Cant: ${item.quantity}\n`
  })
  
  msg += `\n`
  
  if (vehicle_info) {
    msg += `Vehículo: ${vehicle_info}\n`
  }
  
  msg += `Tel: ${phone}`
  
  if (quoteId) {
    msg += ` | Solicitud #${quoteId}`
  }
  
  if (message && message.trim()) {
    msg += `\n\n${message}`
  }
  
  msg += `\n\nAguardo respuesta. Gracias.`
  
  return msg
}

/**
 * Abre WhatsApp con el mensaje pre-cargado
 * @param {string} message - Mensaje a enviar
 * @param {string} phoneNumber - Número de WhatsApp (opcional, usa el del negocio por defecto)
 */
export function openWhatsApp(message, phoneNumber = WHATSAPP_NUMBER) {
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  
  // Abrir en nueva pestaña
  window.open(whatsappUrl, '_blank')
}

/**
 * Genera y abre WhatsApp con la cotización
 * @param {Object} customerData - Datos del cliente
 * @param {Array} items - Items del carrito
 * @param {number} quoteId - ID de la cotización (opcional)
 */
export function sendQuoteToWhatsApp(customerData, items, quoteId = null) {
  const message = generateQuoteMessage(customerData, items, quoteId)
  openWhatsApp(message)
}

export default {
  generateQuoteMessage,
  openWhatsApp,
  sendQuoteToWhatsApp,
  WHATSAPP_NUMBER,
}

