/**
 * Products Hook
 */
import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

export function useProducts(initialParams = {}) {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async (params = {}) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.getProducts({ ...initialParams, ...params })
      setProducts(result.items)
      setTotal(result.total)
      setPage(result.page)
      setTotalPages(result.total_pages)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [initialParams])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    total,
    page,
    totalPages,
    isLoading,
    error,
    refetch: fetchProducts,
  }
}

export function useProduct(productId) {
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!productId) return

    const fetchProduct = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await api.getProduct(productId)
        setProduct(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  return { product, isLoading, error }
}

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await api.getCategories()
        setCategories(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, isLoading, error }
}

export function useSearch() {
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (query, page = 1) => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const result = await api.searchProducts(query, page)
      setResults(result.items)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { results, isLoading, error, search }
}

