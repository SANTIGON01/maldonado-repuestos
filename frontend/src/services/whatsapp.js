/**
 * WhatsApp Service
 * Genera mensajes formateados y abre WhatsApp
 */

// Número de WhatsApp del negocio (sin + ni espacios)
// Formato: código país + código área + número
// Argentina = 54, Mendoza = 261
const WHATSAPP_NUMBER = '542614544128'

/**
 * Genera el mensaje de cotización a partir de los items del carrito.
 * No requiere datos del cliente: WhatsApp ya identifica al remitente por su número.
 * @param {Array} items - Items del carrito
 * @returns {string} Mensaje formateado
 */
export function generateCartQuoteMessage(items) {
  let msg = `Hola, buenos días.\n\n`
  msg += `Solicito cotización de:\n\n`

  items.forEach((item) => {
    msg += `• *${item.product.name}*\n`
    msg += `  Cód: ${item.product.code} - Cant: ${item.quantity}\n`
  })

  msg += `\nAguardo respuesta. Gracias.`

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

  window.open(whatsappUrl, '_blank')
}

/**
 * Abre WhatsApp con la cotización del carrito (flujo directo sin formulario)
 * @param {Array} items - Items del carrito
 */
export function sendCartToWhatsApp(items) {
  const message = generateCartQuoteMessage(items)
  openWhatsApp(message)
}

export default {
  generateCartQuoteMessage,
  openWhatsApp,
  sendCartToWhatsApp,
  WHATSAPP_NUMBER,
}
