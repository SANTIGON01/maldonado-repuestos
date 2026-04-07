/**
 * Admin Dashboard - Gestión de Productos y Categorías
 */
import { useState, useEffect, useRef } from 'react'
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
  Loader2,
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
        api.getProducts({ page_size: 1000 }),
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
    <div className="bg-white border-2 border-maldonado-dark overflow-x-auto">
      <table className="w-full">
        <thead className="bg-maldonado-dark text-white">
          <tr>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-heading">IMAGEN</th>
            <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-heading">CÓDIGO</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-heading">NOMBRE</th>
            <th className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-heading">CATEGORÍA</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-heading">PRECIO</th>
            <th className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center font-heading">STOCK</th>
            <th className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center font-heading">DESTACADO</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-heading">ACCIONES</th>
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
              <td className="px-2 sm:px-4 py-2 sm:py-3">
                <img
                  src={product.image_url || '/placeholder-product.svg'}
                  alt={product.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover border border-maldonado-light-gray"
                />
              </td>
              <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 font-mono text-sm">{product.code}</td>
              <td className="px-2 sm:px-4 py-2 sm:py-3 font-heading">{product.name}</td>
              <td className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-sm">
                {categories.find((c) => c.id === product.category_id)?.name || '-'}
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-mono text-maldonado-red font-bold">
                ${product.price?.toLocaleString('es-AR')}
              </td>
              <td className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center">
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
              <td className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center">
                {product.is_featured ? (
                  <span className="text-maldonado-red">★</span>
                ) : (
                  <span className="text-maldonado-chrome">○</span>
                )}
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 transition-colors"
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
    <div className="bg-white border-2 border-maldonado-dark overflow-x-auto">
      <table className="w-full">
        <thead className="bg-maldonado-dark text-white">
          <tr>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-heading">ICONO</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-heading">NOMBRE</th>
            <th className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-heading">SLUG</th>
            <th className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-heading">DESCRIPCIÓN</th>
            <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center font-heading">ACTIVA</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-heading">ACCIONES</th>
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
              <td className="px-2 sm:px-4 py-2 sm:py-3">
                <span className="text-2xl">{category.icon || '📦'}</span>
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3 font-heading">{category.name}</td>
              <td className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 font-mono text-sm text-maldonado-chrome">{category.slug}</td>
              <td className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-sm truncate max-w-xs">{category.description || '-'}</td>
              <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center">
                {category.is_active ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-red-600">✗</span>
                )}
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <button
                    onClick={() => onEdit(category)}
                    className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(category.id)}
                    className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 transition-colors"
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
    is_on_promotion: product?.is_on_promotion || false,
  })

  const [images, setImages] = useState(initialImages)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Agregar nueva imagen por URL
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

  // Subir imagen desde archivo
  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError('')

    for (const file of files) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setUploadError('Solo se permiten archivos de imagen (PNG, JPG, GIF, WebP)')
        continue
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('El archivo es demasiado grande. Máximo 5MB')
        continue
      }

      try {
        const result = await api.uploadImage(file)
        
        // Si es Cloudinary, la URL ya es completa. Si es local, construir la URL
        let fullImageUrl = result.image_url
        if (result.storage === 'local') {
          const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'
          fullImageUrl = `${backendUrl}${result.image_url}`
        }
        
        setImages(prev => [
          ...prev,
          {
            image_url: fullImageUrl,
            is_primary: prev.length === 0,
            alt_text: ''
          }
        ])
      } catch (err) {
        setUploadError(err.message || 'Error al subir la imagen')
      }
    }

    setIsUploading(false)
    // Limpiar el input para permitir subir el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // La imagen principal (legacy) es la primera que esté marcada como primary
    const primaryImage = images.find(img => img.is_primary)?.image_url || images[0]?.image_url || ''
    
    // Precio: si está vacío o es 0, enviamos 0 (mostrará "Consultar")
    const priceValue = formData.price === '' || formData.price === null 
      ? 0 
      : parseFloat(formData.price)
    
    onSave({
      ...formData,
      price: priceValue,
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
      <div className="bg-maldonado-dark text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <h2 className="font-display text-xl sm:text-2xl">{product ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}</h2>
        <button type="button" onClick={onCancel} className="hover:opacity-70">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-heading text-sm mb-1">
              PRECIO
              <span className="text-xs font-normal text-zinc-500 ml-2">(opcional)</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
              placeholder="0 = Consultar"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Dejá vacío o 0 para mostrar "Consultar precio"
            </p>
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

          {/* Subir imagen desde archivo */}
          <div className="border-2 border-dashed border-maldonado-light-gray p-4 rounded-lg bg-zinc-50">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center gap-2 px-4 py-2 bg-maldonado-red text-white font-heading 
                         cursor-pointer hover:bg-red-700 transition-colors
                         ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    SUBIENDO...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    SUBIR DESDE PC
                  </>
                )}
              </label>
              <span className="text-sm text-maldonado-chrome">
                PNG, JPG, GIF o WebP (máx. 5MB)
              </span>
            </div>
            {uploadError && (
              <p className="text-red-500 text-sm mt-2">{uploadError}</p>
            )}
          </div>

          {/* Agregar imagen por URL */}
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
              className="flex-1 border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
              placeholder="O pegar URL de imagen..."
            />
            <button
              type="button"
              onClick={handleAddImage}
              disabled={!newImageUrl.trim()}
              className="px-4 py-2 bg-maldonado-dark text-white font-heading hover:bg-maldonado-red 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              + URL
            </button>
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_on_promotion"
              checked={formData.is_on_promotion}
              onChange={handleChange}
              className="w-5 h-5 accent-maldonado-red"
            />
            <span className="font-heading">En Promoción</span>
          </label>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 bg-maldonado-light-gray flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-2 border-2 border-maldonado-dark bg-white hover:bg-maldonado-dark hover:text-white transition-colors font-heading"
        >
          CANCELAR
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-maldonado-red text-white hover:bg-maldonado-red-700 transition-colors font-heading flex items-center justify-center gap-2"
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
      <div className="bg-maldonado-dark text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <h2 className="font-display text-xl sm:text-2xl">
          {category ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}
        </h2>
        <button type="button" onClick={onCancel} className="hover:opacity-70">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
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

      <div className="px-4 sm:px-6 py-4 bg-maldonado-light-gray flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-2 border-2 border-maldonado-dark bg-white hover:bg-maldonado-dark hover:text-white transition-colors font-heading"
        >
          CANCELAR
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-maldonado-red text-white hover:bg-maldonado-red-700 transition-colors font-heading flex items-center justify-center gap-2"
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
    <div className="bg-white border-2 border-maldonado-dark overflow-x-auto">
      <table className="w-full">
        <thead className="bg-maldonado-dark text-white">
          <tr>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-heading">IMAGEN</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-heading">TÍTULO</th>
            <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center font-heading">ORDEN</th>
            <th className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center font-heading">TIPO</th>
            <th className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center font-heading">ACTIVO</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-heading">ACCIONES</th>
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
                <td className="px-2 sm:px-4 py-2 sm:py-3">
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
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <span className="font-heading block">{banner.title}</span>
                  {banner.subtitle && (
                    <span className="text-sm text-maldonado-chrome">{banner.subtitle}</span>
                  )}
                </td>
                <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 font-mono text-center">{banner.order}</td>
                <td className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center">
                  <span className={`px-2 py-1 text-xs font-mono ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                </td>
                <td className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center">
                  {banner.is_active ? (
                    <Eye className="w-5 h-5 text-green-600 mx-auto" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-red-600 mx-auto" />
                  )}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <button
                      onClick={() => onEdit(banner)}
                      className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(banner.id)}
                      className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 transition-colors"
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
    brand: banner?.brand || '',
    button_text: banner?.button_text || '',
    button_link: banner?.button_link || '',
    product_codes: banner?.product_codes || '',
    banner_type: banner?.banner_type || 'promo',
    bg_color: banner?.bg_color || 'gradient-red',
    order: banner?.order || 0,
    is_active: banner?.is_active ?? true,
  })

  const [showButton, setShowButton] = useState(
    !!(banner?.button_text && banner?.button_link)
  )

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar los 5MB')
      return
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setUploadError('El archivo debe ser una imagen')
      return
    }

    setIsUploading(true)
    setUploadError('')

    try {
      const result = await api.uploadImage(file)

      // Si es Cloudinary, la URL ya es completa. Si es local, construir la URL
      let fullImageUrl = result.image_url
      if (result.storage === 'local') {
        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'
        fullImageUrl = `${backendUrl}${result.image_url}`
      }

      setFormData((prev) => ({ ...prev, image_url: fullImageUrl }))
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadError(error.message || 'Error al subir la imagen')
    } finally {
      setIsUploading(false)
      // Limpiar el input para permitir subir el mismo archivo de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleToggleButton = (checked) => {
    setShowButton(checked)
    if (checked && !formData.button_text && !formData.button_link) {
      setFormData((prev) => ({ ...prev, button_text: 'VER MÁS', button_link: '/catalogo' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      order: parseInt(formData.order) || 0,
      button_text: showButton ? formData.button_text : '',
      button_link: showButton ? formData.button_link : '',
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

  // Lista de marcas disponibles
  const availableBrands = [
    'JOST', 'MASTER', 'SUSPENSYS', 'BOERO', 'HYVA', 'FRASLE',
    'SADAR', 'NEUMACARG', 'FERVI', 'BAIML', 'KINEDYNE', 'FESTO'
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-maldonado-dark text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <h2 className="font-display text-xl sm:text-2xl">
          {banner ? 'EDITAR PROMO/BANNER' : 'NUEVA PROMO/BANNER'}
        </h2>
        <button type="button" onClick={onCancel} className="hover:opacity-70">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
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
        <div className="space-y-3">
          <label className="block font-heading text-sm">IMAGEN DEL PRODUCTO/PROMO *</label>

          {/* Preview de la imagen actual */}
          {formData.image_url && (
            <div className="border-2 border-maldonado-dark bg-maldonado-light-gray p-4">
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-full max-h-48 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Subir imagen desde archivo */}
          <div className="border-2 border-dashed border-maldonado-dark p-4 rounded-lg bg-zinc-50">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                id="banner-file-upload"
              />
              <label
                htmlFor="banner-file-upload"
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-maldonado-red text-white font-heading
                         cursor-pointer hover:bg-red-700 transition-colors rounded-lg sm:rounded-none
                         ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    SUBIENDO...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    SUBIR IMAGEN
                  </>
                )}
              </label>
              <span className="text-sm text-maldonado-chrome text-center sm:text-left">
                PNG, JPG, GIF o WebP (máx. 5MB)
              </span>
            </div>
            {uploadError && (
              <p className="text-red-500 text-sm mt-2 font-bold">⚠️ {uploadError}</p>
            )}
          </div>

          {/* Campo URL alternativo */}
          <div className="flex gap-2 items-center">
            <span className="text-sm font-heading text-maldonado-chrome whitespace-nowrap">O pegar URL:</span>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="flex-1 border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <p className="text-xs text-maldonado-chrome">
            Podés subir una imagen desde tu dispositivo o pegar la URL de una imagen existente.
          </p>

        </div>

        {/* Selector de marca */}
        <div>
          <label className="block font-heading text-sm mb-1">MARCA DEL PRODUCTO (para mostrar logo)</label>
          <select
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none bg-white"
          >
            <option value="">Sin marca / No mostrar logo</option>
            {availableBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          <p className="text-xs text-maldonado-chrome mt-1">
            Si seleccionas una marca, se mostrará el logo en el banner (debe existir en /brands/)
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showButton}
              onChange={(e) => handleToggleButton(e.target.checked)}
              className="w-5 h-5 accent-maldonado-red"
            />
            <span className="font-heading text-sm">MOSTRAR BOTÓN EN EL BANNER</span>
          </label>

          {showButton && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className={`w-full border-2 px-4 py-2 focus:border-maldonado-red outline-none ${
                      formData.button_link?.startsWith('http')
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-maldonado-dark'
                    }`}
                    placeholder="/catalogo"
                  />
                </div>
              </div>
              {formData.button_link?.startsWith('http') ? (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 border border-blue-200 rounded">
                  <span>🔗</span>
                  <span>Enlace EXTERNO — se abrirá en una nueva pestaña</span>
                </div>
              ) : formData.button_link ? (
                <p className="text-xs text-maldonado-chrome">
                  Enlace interno del sitio. Para enlazar a un sitio externo, usá una URL completa (https://...)
                </p>
              ) : (
                <p className="text-xs text-maldonado-chrome">
                  Ingresá una ruta interna (/catalogo) o una URL externa (https://ejemplo.com)
                </p>
              )}
            </div>
          )}
        </div>

        <div className="col-span-2">
          <label className="block font-heading text-sm mb-1">
            CÓDIGOS DE PRODUCTOS (opcional)
          </label>
          <textarea
            name="product_codes"
            value={formData.product_codes}
            onChange={handleChange}
            className="w-full border-2 border-maldonado-dark px-4 py-2 focus:border-maldonado-red outline-none font-mono text-sm"
            placeholder="Ingrese códigos separados por coma o espacio: ABC123, DEF456, GHI789"
            rows="3"
          />
          <p className="text-xs text-maldonado-chrome mt-1">
            Si completás este campo, "VER MÁS" filtrará solo estos productos. Dejalo vacío para mostrar todos los productos en promoción.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <span className="font-heading text-sm sm:text-base">Banner Activo (visible en el slider)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 bg-maldonado-light-gray flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-2 border-2 border-maldonado-dark bg-white hover:bg-maldonado-dark hover:text-white transition-colors font-heading"
        >
          CANCELAR
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-maldonado-red text-white hover:bg-maldonado-red-700 transition-colors font-heading flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> GUARDAR
        </button>
      </div>
    </form>
  )
}

