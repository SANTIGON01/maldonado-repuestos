/**
 * Admin Dashboard - Gestión de Productos y Categorías
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Search,
  LogOut,
  Home,
  AlertCircle,
  CheckCircle,
  Image,
  Percent,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'

export default function AdminPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [notification, setNotification] = useState(null)

  // Verificar autenticación al cargar
  useEffect(() => {
    const init = async () => {
      await checkAuth()
    }
    init()
  }, [])

  // Verificar si es admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }
    if (user && user.role !== 'admin') {
      showNotification('No tienes permisos de administrador', 'error')
      navigate('/')
    }
  }, [isAuthenticated, user, navigate])

  // Cargar datos
  useEffect(() => {
    if (user?.role === 'admin') {
      loadData()
    }
  }, [user, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsData, categoriesData, bannersData] = await Promise.all([
        api.getProducts({ page_size: 100 }),
        api.getCategories(false),
        api.getAllBanners().catch(() => []), // Puede fallar si no es admin
      ])
      setProducts(productsData.items || productsData)
      setCategories(categoriesData)
      setBanners(bannersData || [])
    } catch (error) {
      showNotification('Error al cargar datos', 'error')
    }
    setLoading(false)
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // CRUD Productos
  const handleSaveProduct = async (productData) => {
    try {
      if (editingItem?.id) {
        await api.request(`/admin/products/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        })
        showNotification('Producto actualizado correctamente')
      } else {
        await api.request('/admin/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        })
        showNotification('Producto creado correctamente')
      }
      setShowModal(false)
      setEditingItem(null)
      loadData()
    } catch (error) {
      showNotification(error.message || 'Error al guardar producto', 'error')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      await api.request(`/admin/products/${id}`, { method: 'DELETE' })
      showNotification('Producto eliminado correctamente')
      loadData()
    } catch (error) {
      showNotification('Error al eliminar producto', 'error')
    }
  }

  // CRUD Categorías
  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingItem?.id) {
        await api.request(`/admin/categories/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(categoryData),
        })
        showNotification('Categoría actualizada correctamente')
      } else {
        await api.request('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(categoryData),
        })
        showNotification('Categoría creada correctamente')
      }
      setShowModal(false)
      setEditingItem(null)
      loadData()
    } catch (error) {
      showNotification(error.message || 'Error al guardar categoría', 'error')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
    try {
      await api.request(`/admin/categories/${id}`, { method: 'DELETE' })
      showNotification('Categoría eliminada correctamente')
      loadData()
    } catch (error) {
      showNotification('Error al eliminar categoría', 'error')
    }
  }

  // CRUD Banners
  const handleSaveBanner = async (bannerData) => {
    try {
      if (editingItem?.id) {
        await api.updateBanner(editingItem.id, bannerData)
        showNotification('Banner actualizado correctamente')
      } else {
        await api.createBanner(bannerData)
        showNotification('Banner creado correctamente')
      }
      setShowModal(false)
      setEditingItem(null)
      loadData()
    } catch (error) {
      showNotification(error.message || 'Error al guardar banner', 'error')
    }
  }

  const handleDeleteBanner = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return
    try {
      await api.deleteBanner(id)
      showNotification('Banner eliminado correctamente')
      loadData()
    } catch (error) {
      showNotification('Error al eliminar banner', 'error')
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredBanners = banners.filter((b) =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-maldonado-cream flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-maldonado-red mb-4" />
          <h1 className="font-display text-3xl text-maldonado-dark">ACCESO RESTRINGIDO</h1>
          <p className="text-maldonado-chrome mt-2">Necesitás permisos de administrador</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-maldonado-cream">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 flex items-center gap-3 shadow-lg border-2 ${
              notification.type === 'error'
                ? 'bg-red-100 border-red-500 text-red-700'
                : 'bg-green-100 border-green-500 text-green-700'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-maldonado-dark text-white py-4 border-b-4 border-maldonado-red">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/unnamed.jpg" alt="Logo" className="h-12 w-auto" />
            <div>
              <h1 className="font-display text-2xl">PANEL DE ADMINISTRACIÓN</h1>
              <p className="text-maldonado-chrome text-sm">Bienvenido, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-maldonado-chrome/20 hover:bg-maldonado-chrome/30 transition-colors"
            >
              <Home className="w-4 h-4" /> Ir al Sitio
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-maldonado-red hover:bg-maldonado-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 font-heading text-lg transition-all ${
              activeTab === 'products'
                ? 'bg-maldonado-red text-white'
                : 'bg-white text-maldonado-dark border-2 border-maldonado-dark hover:bg-maldonado-light-gray'
            }`}
          >
            <Package className="w-5 h-5" /> PRODUCTOS ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-6 py-3 font-heading text-lg transition-all ${
              activeTab === 'categories'
                ? 'bg-maldonado-red text-white'
                : 'bg-white text-maldonado-dark border-2 border-maldonado-dark hover:bg-maldonado-light-gray'
            }`}
          >
            <FolderOpen className="w-5 h-5" /> CATEGORÍAS ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-6 py-3 font-heading text-lg transition-all ${
              activeTab === 'banners'
                ? 'bg-maldonado-red text-white'
                : 'bg-white text-maldonado-dark border-2 border-maldonado-dark hover:bg-maldonado-light-gray'
            }`}
          >
            <Image className="w-5 h-5" /> PROMOS/BANNERS ({banners.length})
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-maldonado-chrome" />
            <input
              type="text"
              placeholder={`Buscar ${activeTab === 'products' ? 'productos' : activeTab === 'categories' ? 'categorías' : 'banners'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-maldonado-dark focus:border-maldonado-red outline-none"
            />
          </div>
          <button
            onClick={() => {
              setEditingItem(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-maldonado-red text-white font-heading hover:bg-maldonado-red-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'products' ? 'NUEVO PRODUCTO' : activeTab === 'categories' ? 'NUEVA CATEGORÍA' : 'NUEVA PROMO'}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-maldonado-red border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-maldonado-chrome">Cargando...</p>
          </div>
        ) : activeTab === 'products' ? (
          <ProductsTable
            products={filteredProducts}
            categories={categories}
            onEdit={(product) => {
              setEditingItem(product)
              setShowModal(true)
            }}
            onDelete={handleDeleteProduct}
          />
        ) : activeTab === 'categories' ? (
          <CategoriesTable
            categories={filteredCategories}
            onEdit={(category) => {
              setEditingItem(category)
              setShowModal(true)
            }}
            onDelete={handleDeleteCategory}
          />
        ) : (
          <BannersTable
            banners={filteredBanners}
            onEdit={(banner) => {
              setEditingItem(banner)
              setShowModal(true)
            }}
            onDelete={handleDeleteBanner}
          />
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal
            onClose={() => {
              setShowModal(false)
              setEditingItem(null)
            }}
          >
            {activeTab === 'products' ? (
              <ProductForm
                product={editingItem}
                categories={categories}
                onSave={handleSaveProduct}
                onCancel={() => {
                  setShowModal(false)
                  setEditingItem(null)
                }}
              />
            ) : activeTab === 'categories' ? (
              <CategoryForm
                category={editingItem}
                onSave={handleSaveCategory}
                onCancel={() => {
                  setShowModal(false)
                  setEditingItem(null)
                }}
              />
            ) : (
              <BannerForm
                banner={editingItem}
                onSave={handleSaveBanner}
                onCancel={() => {
                  setShowModal(false)
                  setEditingItem(null)
                }}
              />
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// Tabla de Productos
function ProductsTable({ products, categories, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="bg-white border-2 border-maldonado-dark p-12 text-center">
        <Package className="w-16 h-16 mx-auto text-maldonado-chrome mb-4" />
        <h3 className="font-heading text-xl text-maldonado-dark">No hay productos</h3>
        <p className="text-maldonado-chrome">Agregá tu primer producto para comenzar</p>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-maldonado-dark overflow-hidden">
      <table className="w-full">
        <thead className="bg-maldonado-dark text-white">
          <tr>
            <th className="px-4 py-3 text-left font-heading">IMAGEN</th>
            <th className="px-4 py-3 text-left font-heading">CÓDIGO</th>
            <th className="px-4 py-3 text-left font-heading">NOMBRE</th>
            <th className="px-4 py-3 text-left font-heading">CATEGORÍA</th>
            <th className="px-4 py-3 text-right font-heading">PRECIO</th>
            <th className="px-4 py-3 text-center font-heading">STOCK</th>
            <th className="px-4 py-3 text-center font-heading">DESTACADO</th>
            <th className="px-4 py-3 text-center font-heading">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={product.id}
              className={`border-b border-maldonado-light-gray hover:bg-maldonado-light-gray/50 ${
                index % 2 === 0 ? 'bg-white' : 'bg-maldonado-cream/30'
              }`}
            >
              <td className="px-4 py-3">
                <img
                  src={product.image_url || '/placeholder-product.svg'}
                  alt={product.name}
                  className="w-12 h-12 object-cover border border-maldonado-light-gray"
                />
              </td>
              <td className="px-4 py-3 font-mono text-sm">{product.code}</td>
              <td className="px-4 py-3 font-heading">{product.name}</td>
              <td className="px-4 py-3 text-sm">
                {categories.find((c) => c.id === product.category_id)?.name || '-'}
              </td>
              <td className="px-4 py-3 text-right font-mono text-maldonado-red font-bold">
                ${product.price?.toLocaleString('es-AR')}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-2 py-1 text-xs font-mono ${
                    product.stock > 10
                      ? 'bg-green-100 text-green-700'
                      : product.stock > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.stock}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {product.is_featured ? (
                  <span className="text-maldonado-red">★</span>
                ) : (
                  <span className="text-maldonado-chrome">○</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Tabla de Categorías
function CategoriesTable({ categories, onEdit, onDelete }) {
  if (categories.length === 0) {
    return (
      <div className="bg-white border-2 border-maldonado-dark p-12 text-center">
        <FolderOpen className="w-16 h-16 mx-auto text-maldonado-chrome mb-4" />
        <h3 className="font-heading text-xl text-maldonado-dark">No hay categorías</h3>
        <p className="text-maldonado-chrome">Agregá tu primera categoría para comenzar</p>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-maldonado-dark overflow-hidden">
      <table className="w-full">
        <thead className="bg-maldonado-dark text-white">
          <tr>
            <th className="px-4 py-3 text-left font-heading">ICONO</th>
            <th className="px-4 py-3 text-left font-heading">NOMBRE</th>
            <th className="px-4 py-3 text-left font-heading">SLUG</th>
            <th className="px-4 py-3 text-left font-heading">DESCRIPCIÓN</th>
            <th className="px-4 py-3 text-center font-heading">ACTIVA</th>
            <th className="px-4 py-3 text-center font-heading">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr
              key={category.id}
              className={`border-b border-maldonado-light-gray hover:bg-maldonado-light-gray/50 ${
                index % 2 === 0 ? 'bg-white' : 'bg-maldonado-cream/30'
              }`}
            >
              <td className="px-4 py-3">
                <span className="text-2xl">{category.icon || '📦'}</span>
              </td>
              <td className="px-4 py-3 font-heading">{category.name}</td>
              <td className="px-4 py-3 font-mono text-sm text-maldonado-chrome">{category.slug}</td>
              <td className="px-4 py-3 text-sm truncate max-w-xs">{category.description || '-'}</td>
              <td className="px-4 py-3 text-center">
                {category.is_active ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-red-600">✗</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Modal
function Modal({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-2xl border-4 border-maldonado-dark shadow-solid-dark max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// Formulario de Producto
function ProductForm({ product, categories, onSave, onCancel }) {
  // Inicializar imágenes desde el producto existente
  const initialImages = product?.images?.length > 0 
    ? product.images.map(img => ({
        image_url: img.image_url,
        is_primary: img.is_primary,
        alt_text: img.alt_text || '',
      }))
    : product?.image_url 
      ? [{ image_url: product.image_url, is_primary: true, alt_text: '' }]
      : []

  const [formData, setFormData] = useState({
    code: product?.code || '',
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    price: product?.price || '',
    original_price: product?.original_price || '',
    stock: product?.stock || 0,
    category_id: product?.category_id || '',
    image_url: product?.image_url || '',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
  })

  const [images, setImages] = useState(initialImages)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploadMode, setUploadMode] = useState('url') // 'file' | 'url'
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Agregar nueva imagen
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages(prev => [
        ...prev, 
        { 
          image_url: newImageUrl.trim(), 
          is_primary: prev.length === 0, // Primera imagen es principal
          alt_text: '' 
        }
      ])
      setNewImageUrl('')
    }
  }

  // Eliminar imagen
  const handleRemoveImage = (index) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index)
      // Si eliminamos la principal, hacer la primera la nueva principal
      if (prev[index]?.is_primary && updated.length > 0) {
        updated[0].is_primary = true
      }
      return updated
    })
  }

  // Marcar imagen como principal
  const handleSetPrimary = (index) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      is_primary: i === index
    })))
  }

  // Mover imagen arriba/abajo
  const handleMoveImage = (index, direction) => {
    setImages(prev => {
      const newArr = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= newArr.length) return prev
      [newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]]
      return newArr
    })
  }

  // Seleccionar archivo para upload
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    setUploadError('')

    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Tipo de archivo no permitido. Use JPG, PNG o WebP.')
      return
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError(`Archivo muy grande. Tamaño máximo: 5MB (actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
      return
    }

    setSelectedFile(file)
  }

  // Subir imagen a Cloudinary
  const handleUploadImage = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadError('')

    try {
      const result = await api.uploadProductImage(selectedFile)

      // Agregar la imagen subida a la lista
      setImages(prev => [
        ...prev,
        {
          image_url: result.url,
          public_id: result.public_id,
          is_primary: prev.length === 0,
          alt_text: formData.name || ''
        }
      ])

      // Limpiar
      setSelectedFile(null)
      // Reset file input
      const fileInput = document.getElementById('image-file-input')
      if (fileInput) fileInput.value = ''

    } catch (error) {
      console.error('Error al subir imagen:', error)
      setUploadError(error.message || 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // La imagen principal (legacy) es la primera que esté marcada como primary
    const primaryImage = images.find(img => img.is_primary)?.image_url || images[0]?.image_url || ''
    
    onSave({
      ...formData,
      price: parseFloat(formData.price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      stock: parseInt(formData.stock) || 0,
      category_id: parseInt(formData.category_id),
      image_url: primaryImage,
      images: images.map((img, idx) => ({
        image_url: img.image_url,
        display_order: idx,
        is_primary: img.is_primary,
        alt_text: img.alt_text || null,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-maldonado-dark text-white px-6 py-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">{product ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}</h2>
        <button type="button" onClick={onCancel} className="hover:opacity-70">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-heading text-sm mb-1">CÓDIGO *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
              placeholder="Ej: MR-001"
            />
          </div>
          <div>
            <label className="block font-heading text-sm mb-1">MARCA</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
              placeholder="Ej: Randon"
            />
          </div>
        </div>

        <div>
          <label className="block font-heading text-sm mb-1">NOMBRE *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
            placeholder="Nombre del producto"
          />
        </div>

        <div>
          <label className="block font-heading text-sm mb-1">DESCRIPCIÓN</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none resize-none"
            placeholder="Descripción detallada del producto..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-heading text-sm mb-1">PRECIO *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block font-heading text-sm mb-1">PRECIO ANTERIOR</label>
            <input
              type="number"
              name="original_price"
              value={formData.original_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
              placeholder="Para mostrar descuento"
            />
          </div>
          <div>
            <label className="block font-heading text-sm mb-1">STOCK</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-heading text-sm mb-1">CATEGORÍA *</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none bg-white"
          >
            <option value="">Seleccionar categoría...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sección de Imágenes */}
        <div className="space-y-3">
          <label className="block font-heading text-sm">IMÁGENES DEL PRODUCTO</label>
          
          {/* Lista de imágenes actuales */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, index) => (
                <div 
                  key={index} 
                  className={`relative group border-2 ${
                    img.is_primary ? 'border-maldonado-red' : 'border-maldonado-light-gray'
                  } bg-white`}
                >
                  <img 
                    src={img.image_url} 
                    alt={img.alt_text || `Imagen ${index + 1}`}
                    className="w-full h-24 object-contain"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.svg'
                    }}
                  />
                  {img.is_primary && (
                    <span className="absolute top-1 left-1 bg-maldonado-red text-white text-[10px] px-1 font-bold">
                      PRINCIPAL
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="p-1 bg-green-500 text-white text-xs rounded"
                        title="Marcar como principal"
                      >
                        ★
                      </button>
                    )}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, 'up')}
                        className="p-1 bg-blue-500 text-white text-xs rounded"
                        title="Mover arriba"
                      >
                        ↑
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, 'down')}
                        className="p-1 bg-blue-500 text-white text-xs rounded"
                        title="Mover abajo"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1 bg-red-500 text-white text-xs rounded"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Agregar nueva imagen */}
          <div className="space-y-3">
            {/* Toggle entre Upload y URL */}
            <div className="flex gap-2 border-b border-maldonado-light-gray pb-2">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 px-4 py-2 font-heading transition-colors ${
                  uploadMode === 'file'
                    ? 'bg-maldonado-red text-white'
                    : 'bg-maldonado-light-gray text-maldonado-dark hover:bg-maldonado-chrome'
                }`}
              >
                SUBIR ARCHIVO
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 px-4 py-2 font-heading transition-colors ${
                  uploadMode === 'url'
                    ? 'bg-maldonado-red text-white'
                    : 'bg-maldonado-light-gray text-maldonado-dark hover:bg-maldonado-chrome'
                }`}
              >
                PEGAR URL
              </button>
            </div>

            {/* Modo: Subir archivo */}
            {uploadMode === 'file' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    id="image-file-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="flex-1 border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-maldonado-dark file:text-white file:font-heading hover:file:bg-maldonado-red file:cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={!selectedFile || uploading}
                    className="px-4 py-2 bg-maldonado-red text-white font-heading hover:bg-maldonado-dark
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {uploading ? 'SUBIENDO...' : '↑ SUBIR'}
                  </button>
                </div>

                {/* Preview del archivo seleccionado */}
                {selectedFile && !uploading && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 text-green-700 text-sm">
                    <span>✓</span>
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}

                {/* Error de upload */}
                {uploadError && (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-sm">
                    ✕ {uploadError}
                  </div>
                )}

                <p className="text-xs text-maldonado-chrome">
                  Formatos: JPG, PNG, WebP • Tamaño máximo: 5MB • Las imágenes se guardan en Cloudinary
                </p>
              </div>
            )}

            {/* Modo: Pegar URL */}
            {uploadMode === 'url' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                  className="flex-1 border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
                  placeholder="Pegar URL de imagen y presionar Agregar"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={!newImageUrl.trim()}
                  className="px-4 py-2 bg-maldonado-dark text-white font-heading hover:bg-maldonado-red
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  + AGREGAR
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-maldonado-chrome">
            La primera imagen será la principal. Podés agregar múltiples imágenes del producto.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-5 h-5 accent-maldonado-red"
            />
            <span className="font-heading">Producto Destacado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-5 h-5 accent-maldonado-red"
            />
            <span className="font-heading">Activo</span>
          </label>
        </div>
      </div>

      <div className="px-6 py-4 bg-maldonado-light-gray flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border-2 border-maldonado-dark bg-white hover:bg-maldonado-dark hover:text-white transition-colors font-heading"
        >
          CANCELAR
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-maldonado-red text-white hover:bg-maldonado-red-700 transition-colors font-heading flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> GUARDAR
        </button>
      </div>
    </form>
  )
}

// Formulario de Categoría
function CategoryForm({ category, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || '📦',
    is_active: category?.is_active ?? true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Auto-generar slug desde el nombre
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: slug,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const emojis = ['🔧', '⚙️', '🚛', '🔩', '💡', '🛞', '🔌', '📦', '🏭', '🔶']

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-maldonado-dark text-white px-6 py-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">
          {category ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}
        </h2>
        <button type="button" onClick={onCancel} className="hover:opacity-70">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block font-heading text-sm mb-1">NOMBRE *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
            placeholder="Ej: Ejes y Mazas"
          />
        </div>

        <div>
          <label className="block font-heading text-sm mb-1">SLUG (URL)</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none font-mono"
            placeholder="ejes-y-mazas"
          />
        </div>

        <div>
          <label className="block font-heading text-sm mb-1">DESCRIPCIÓN</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none resize-none"
            placeholder="Descripción de la categoría..."
          />
        </div>

        <div>
          <label className="block font-heading text-sm mb-2">ICONO</label>
          <div className="flex flex-wrap gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, icon: emoji }))}
                className={`w-10 h-10 text-xl border-2 transition-all ${
                  formData.icon === emoji
                    ? 'border-maldonado-red bg-maldonado-red/10'
                    : 'border-maldonado-light-gray hover:border-maldonado-dark'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-5 h-5 accent-maldonado-red"
          />
          <span className="font-heading">Categoría Activa</span>
        </label>
      </div>

      <div className="px-6 py-4 bg-maldonado-light-gray flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border-2 border-maldonado-dark bg-white hover:bg-maldonado-dark hover:text-white transition-colors font-heading"
        >
          CANCELAR
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-maldonado-red text-white hover:bg-maldonado-red-700 transition-colors font-heading flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> GUARDAR
        </button>
      </div>
    </form>
  )
}

// Tabla de Banners/Promos
function BannersTable({ banners, onEdit, onDelete }) {
  if (banners.length === 0) {
    return (
      <div className="bg-white border-2 border-maldonado-dark p-12 text-center">
        <Image className="w-16 h-16 mx-auto text-maldonado-chrome mb-4" />
        <h3 className="font-heading text-xl text-maldonado-dark">No hay promos/banners</h3>
        <p className="text-maldonado-chrome">Agregá tu primera promoción para el slider principal</p>
      </div>
    )
  }

  const typeLabels = {
    promo: { label: 'PROMOCIÓN', color: 'bg-red-100 text-red-700' },
    news: { label: 'NOVEDAD', color: 'bg-blue-100 text-blue-700' },
    product: { label: 'PRODUCTO', color: 'bg-green-100 text-green-700' },
    general: { label: 'GENERAL', color: 'bg-gray-100 text-gray-700' },
  }

  return (
    <div className="bg-white border-2 border-maldonado-dark overflow-hidden">
      <table className="w-full">
        <thead className="bg-maldonado-dark text-white">
          <tr>
            <th className="px-4 py-3 text-left font-heading">ORDEN</th>
            <th className="px-4 py-3 text-left font-heading">IMAGEN</th>
            <th className="px-4 py-3 text-left font-heading">TÍTULO</th>
            <th className="px-4 py-3 text-center font-heading">TIPO</th>
            <th className="px-4 py-3 text-center font-heading">ACTIVO</th>
            <th className="px-4 py-3 text-center font-heading">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner, index) => {
            const typeInfo = typeLabels[banner.banner_type] || typeLabels.general
            return (
              <tr
                key={banner.id}
                className={`border-b border-maldonado-light-gray hover:bg-maldonado-light-gray/50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-maldonado-cream/30'
                }`}
              >
                <td className="px-4 py-3 font-mono text-center">{banner.order}</td>
                <td className="px-4 py-3">
                  {banner.image_url ? (
                    <img 
                      src={banner.image_url} 
                      alt={banner.title}
                      className="w-16 h-16 object-contain border border-maldonado-light-gray bg-white"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-maldonado-light-gray flex items-center justify-center">
                      <Image className="w-6 h-6 text-maldonado-chrome" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="font-heading block">{banner.title}</span>
                  {banner.subtitle && (
                    <span className="text-sm text-maldonado-chrome">{banner.subtitle}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs font-mono ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {banner.is_active ? (
                    <Eye className="w-5 h-5 text-green-600 mx-auto" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-red-600 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(banner)}
                      className="p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(banner.id)}
                      className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Formulario de Banner/Promo
function BannerForm({ banner, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    description: banner?.description || '',
    image_url: banner?.image_url || '',
    button_text: banner?.button_text || 'VER MÁS',
    button_link: banner?.button_link || '/catalogo',
    banner_type: banner?.banner_type || 'promo',
    bg_color: banner?.bg_color || 'gradient-red',
    order: banner?.order || 0,
    is_active: banner?.is_active ?? true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      order: parseInt(formData.order) || 0,
    })
  }

  const bannerTypes = [
    { value: 'promo', label: 'Promoción', icon: '🏷️' },
    { value: 'news', label: 'Novedad', icon: '✨' },
    { value: 'product', label: 'Producto', icon: '📦' },
    { value: 'general', label: 'General', icon: '📢' },
  ]

  const bgColors = [
    { value: 'gradient-red', label: 'Rojo', color: 'bg-red-700' },
    { value: 'dark', label: 'Oscuro', color: 'bg-zinc-800' },
    { value: 'gradient-dark', label: 'Gris', color: 'bg-zinc-700' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-maldonado-dark text-white px-6 py-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">
          {banner ? 'EDITAR PROMO/BANNER' : 'NUEVA PROMO/BANNER'}
        </h2>
        <button type="button" onClick={onCancel} className="hover:opacity-70">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block font-heading text-sm mb-1">TÍTULO PRINCIPAL *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
            placeholder="Ej: 20% OFF EN FRENOS"
          />
        </div>

        <div>
          <label className="block font-heading text-sm mb-1">SUBTÍTULO</label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
            placeholder="Ej: Solo por tiempo limitado"
          />
        </div>

        <div>
          <label className="block font-heading text-sm mb-1">DESCRIPCIÓN</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none resize-none"
            placeholder="Descripción adicional del banner..."
          />
        </div>

        {/* Campo de imagen */}
        <div>
          <label className="block font-heading text-sm mb-1">IMAGEN DEL PRODUCTO/PROMO</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
                placeholder="https://ejemplo.com/imagen-producto.jpg"
              />
              <p className="text-xs text-maldonado-chrome mt-1">
                URL de la imagen del producto o promoción que se mostrará en el slider
              </p>
            </div>
            {formData.image_url && (
              <div className="w-24 h-24 border-2 border-maldonado-dark bg-maldonado-light-gray overflow-hidden flex-shrink-0">
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-heading text-sm mb-1">TEXTO DEL BOTÓN</label>
            <input
              type="text"
              name="button_text"
              value={formData.button_text}
              onChange={handleChange}
              className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
              placeholder="VER MÁS"
            />
          </div>
          <div>
            <label className="block font-heading text-sm mb-1">ENLACE DEL BOTÓN</label>
            <input
              type="text"
              name="button_link"
              value={formData.button_link}
              onChange={handleChange}
              className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
              placeholder="/catalogo"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-heading text-sm mb-2">TIPO DE BANNER</label>
            <div className="grid grid-cols-2 gap-2">
              {bannerTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, banner_type: type.value }))}
                  className={`px-3 py-2 text-sm border-2 transition-all flex items-center gap-2 ${
                    formData.banner_type === type.value
                      ? 'border-maldonado-red bg-maldonado-red/10'
                      : 'border-maldonado-light-gray hover:border-maldonado-dark'
                  }`}
                >
                  <span>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-heading text-sm mb-2">COLOR DE FONDO</label>
            <div className="flex gap-2">
              {bgColors.map((bg) => (
                <button
                  key={bg.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, bg_color: bg.value }))}
                  className={`w-12 h-12 ${bg.color} border-2 transition-all ${
                    formData.bg_color === bg.value
                      ? 'border-maldonado-red ring-2 ring-maldonado-red ring-offset-2'
                      : 'border-transparent hover:border-maldonado-dark'
                  }`}
                  title={bg.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-heading text-sm mb-1">ORDEN (menor = primero)</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 accent-maldonado-red"
              />
              <span className="font-heading">Banner Activo (visible en el slider)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-maldonado-light-gray flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border-2 border-maldonado-dark bg-white hover:bg-maldonado-dark hover:text-white transition-colors font-heading"
        >
          CANCELAR
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-maldonado-red text-white hover:bg-maldonado-red-700 transition-colors font-heading flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> GUARDAR
        </button>
      </div>
    </form>
  )
}

