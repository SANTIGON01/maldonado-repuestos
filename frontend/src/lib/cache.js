/**
 * Sistema de cache simple para optimizar llamadas a la API
 * Reduce latencia evitando llamadas repetidas a datos que cambian poco
 */

const cache = new Map()

// Tiempo de expiración por tipo de datos (en milisegundos)
const TTL = {
  categories: 5 * 60 * 1000,    // 5 minutos
  banners: 2 * 60 * 1000,       // 2 minutos
  product: 1 * 60 * 1000,       // 1 minuto
  products: 30 * 1000,          // 30 segundos - listados de productos
  search: 15 * 1000,            // 15 segundos - resultados de búsqueda
  default: 30 * 1000,           // 30 segundos
}

/**
 * Obtener valor del cache
 */
export function getFromCache(key) {
  const item = cache.get(key)
  if (!item) return null
  
  // Verificar si expiró
  if (Date.now() > item.expiry) {
    cache.delete(key)
    return null
  }
  
  return item.value
}

/**
 * Guardar en cache
 */
export function setCache(key, value, type = 'default') {
  const ttl = TTL[type] || TTL.default
  cache.set(key, {
    value,
    expiry: Date.now() + ttl,
  })
}

/**
 * Limpiar cache específico
 */
export function clearCache(keyPattern) {
  if (!keyPattern) {
    cache.clear()
    return
  }
  
  for (const key of cache.keys()) {
    if (key.includes(keyPattern)) {
      cache.delete(key)
    }
  }
}

/**
 * Wrapper para funciones de API con cache
 */
export async function cachedFetch(key, fetchFn, type = 'default') {
  // Intentar obtener del cache
  const cached = getFromCache(key)
  if (cached) {
    return cached
  }
  
  // Si no hay cache, hacer fetch
  const result = await fetchFn()
  
  // Guardar en cache
  setCache(key, result, type)
  
  return result
}

export default {
  get: getFromCache,
  set: setCache,
  clear: clearCache,
  cachedFetch,
}
