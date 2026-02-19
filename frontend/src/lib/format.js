/**
 * Utilidades de formateo compartidas
 */

const priceFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
})

/**
 * Formatea un precio en pesos argentinos
 * @param {number|string|null} price
 * @returns {string|null} Precio formateado o null si no tiene precio
 */
export function formatPrice(price) {
  if (price === null || price === undefined || price === 0 || price === '0' || price === '0.00') {
    return null
  }
  return priceFormatter.format(price)
}

/**
 * Verifica si un producto tiene precio válido
 * @param {number|string|null} price
 * @returns {boolean}
 */
export function hasValidPrice(price) {
  return price && price !== 0 && price !== '0' && price !== '0.00'
}
