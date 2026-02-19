/**
 * Cloudinary Image Optimization Utility
 * Aplica transformaciones de URL para reducir peso de imágenes 60-80%
 */

/**
 * Optimiza una URL de Cloudinary aplicando transforms de ancho, calidad y formato
 * @param {string} url - URL original de Cloudinary
 * @param {Object} options
 * @param {number} options.width - Ancho deseado en px
 * @param {string} options.quality - Calidad ('auto' recomendado)
 * @param {string} options.format - Formato ('auto' para WebP/AVIF automático)
 * @returns {string} URL optimizada
 */
export function optimizeCloudinaryUrl(url, { width = 400, quality = 'auto', format = 'auto' } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url
  // Evitar doble transformación
  if (url.includes('/upload/w_') || url.includes('/upload/q_') || url.includes('/upload/f_')) return url
  return url.replace('/upload/', `/upload/w_${width},q_${quality},f_${format}/`)
}

/**
 * Presets de tamaño por contexto de uso
 */
export const IMAGE_SIZES = {
  cardGrid: { width: 300 },
  cardList: { width: 150 },
  productDetail: { width: 600 },
  searchThumb: { width: 80 },
  cartThumb: { width: 100 },
  heroBanner: { width: 1200 },
  categoryThumb: { width: 200 },
}

/**
 * Shorthand: optimiza URL con un preset predefinido
 * @param {string} url
 * @param {string} preset - Nombre del preset (cardGrid, productDetail, etc.)
 */
export function optimizeImage(url, preset = 'cardGrid') {
  return optimizeCloudinaryUrl(url, IMAGE_SIZES[preset] || IMAGE_SIZES.cardGrid)
}
