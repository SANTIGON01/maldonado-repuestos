/**
 * WhatsApp Service
 * Genera mensajes formateados y abre WhatsApp
 */

// Número de WhatsApp del negocio (sin + ni espacios)
// Formato: código país + código área + número
// Argentina = 54, Mendoza = 261
const WHATSAPP_NUMBER = '542614544128'

// Etiqueta de conversión de Google Ads para clicks en WhatsApp
const GOOGLE_ADS_CONVERSION = 'AW-18092744753/IB9hCM2gqaQcELHApbND'

/**
 * Reporta una conversión a Google Ads y ejecuta el callback al confirmarse el envío.
 * En mobile el cambio de contexto puede cancelar requests pendientes, por eso usamos
 * event_callback. Si gtag no está cargado (adblock, error de red), se ejecuta igual.
 */
function reportConversionAndRun(callback) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    callback()
    return
  }

  let executed = false
  const safeRun = () => {
    if (executed) return
    executed = true
    callback()
  }

  // Fallback: si gtag no responde en 1.5s, abrir WhatsApp igual
  setTimeout(safeRun, 1500)

  window.gtag('event', 'conversion', {
    send_to: GOOGLE_ADS_CONVERSION,
    event_callback: safeRun,
  })
}

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
 * Abre WhatsApp con el mensaje pre-cargado.
 * Dispara conversión de Google Ads antes de abrir la URL.
 * @param {string} message - Mensaje a enviar
 * @param {string} phoneNumber - Número de WhatsApp (opcional, usa el del negocio por defecto)
 */
export function openWhatsApp(message, phoneNumber = WHATSAPP_NUMBER) {
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

  reportConversionAndRun(() => {
    window.open(whatsappUrl, '_blank')
  })
}

/**
 * Dispara conversión de Google Ads para un click de WhatsApp con URL ya construida.
 * Útil para enlaces <a> donde queremos prevenir default y trackear antes de navegar.
 * @param {string} whatsappUrl - URL completa de wa.me
 */
export function trackWhatsAppClick(whatsappUrl) {
  reportConversionAndRun(() => {
    window.open(whatsappUrl, '_blank')
  })
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
  trackWhatsAppClick,
  WHATSAPP_NUMBER,
}
