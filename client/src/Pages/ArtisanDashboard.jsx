import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Diamond, Upload, Bell, User, Plus, Settings, Camera, Package, ShoppingBag, MessageSquare } from 'lucide-react'
import { api } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import { useAuth } from '../context/AuthContext'
import ArtisanSidebar from '../Components/Layout/ArtisanSidebar'

const ArtisanDashboard = () => {
  const { user, isAuthenticated, isArtisan } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: '',
    description: '',
    location: '',
    phone: '',
    profile_picture_url: ''
  })
  const [profileLoading, setProfileLoading] = useState(false)

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    price: ''
  })

  const [myProducts, setMyProducts] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0
  })
  const [artisanOrders, setArtisanOrders] = useState([])
  const [artisanMessages, setArtisanMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Loading artisan dashboard for user:', user)
      loadDashboardData()
      loadProducts()
      loadProfileData()
    } else {
      console.log('User not authenticated, skipping dashboard load')
    }
  }, [isAuthenticated, user])

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true)
      setError(null)
      
      // Check authentication first
      const session = await api.auth.getSession()
      if (!session.authenticated) {
        setError('Please log in to view your dashboard.')
        return
      }
      
      const dashboardData = await api.artisan.getDashboard()
      if (dashboardData && dashboardData.stats) {
        setDashboardStats(dashboardData.stats)
      } else {
        setDashboardStats({ total_products: 0, total_orders: 0, total_revenue: 0 })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setDashboardStats({ total_products: 0, total_orders: 0, total_revenue: 0 })
      if (error.message.includes('Authentication')) {
        setError('Please log in to view your dashboard.')
      }
    } finally {
      setDashboardLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const products = await api.artisan.getProducts(user?.id)
      setMyProducts(Array.isArray(products) ? products : [])
    } catch (error) {
      console.error('Failed to load products:', error)
      setMyProducts([])
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const orders = await api.artisan.getOrders()
      setArtisanOrders(orders)
    } catch (error) {
      console.error('Failed to load orders:', error)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      const messages = await api.artisan.getMessages()
      setArtisanMessages(messages)
    } catch (error) {
      console.error('Failed to load messages:', error)
      setError('Failed to load messages. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadProfileData = async () => {
    try {
      const profile = await api.profile.get()
      setProfileData({
        full_name: profile.full_name || '',
        description: profile.description || '',
        location: profile.location || '',
        phone: profile.phone || '',
        profile_picture_url: profile.profile_picture_url || ''
      })
    } catch (error) {
      console.error('Failed to load profile data:', error)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      setProfileLoading(true)
      await api.profile.update({
        full_name: profileData.full_name,
        description: profileData.description,
        location: profileData.location,
        phone: profileData.phone
      })
      alert('Profile updated successfully!')
      setShowProfileSettings(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        setProfileLoading(true)
        const uploadResult = await api.profile.uploadImage(file)
        setProfileData(prev => ({
          ...prev,
          profile_picture_url: uploadResult.url
        }))
        // Update profile with new picture URL
        await api.profile.update({
          profile_picture_url: uploadResult.url
        })
        alert('Profile picture updated successfully!')
      } catch (error) {
        console.error('Failed to upload profile picture:', error)
        alert('Failed to upload profile picture. Please try again.')
      } finally {
        setProfileLoading(false)
      }
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // Check authentication first
      const session = await api.auth.getSession()
      if (!session.authenticated) {
        alert('Please log in to add products')
        return
      }
      
      let imageUrl = null
      
      // Upload image to Cloudinary if selected
      if (selectedFile) {
        try {
          imageUrl = await uploadToCloudinary(selectedFile)
        } catch (error) {
          console.error('Image upload failed:', error)
          alert('Image upload failed, but product will be created without image')
        }
      }
      
      // Create product data object
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory,
        stock: 10,
        currency: 'KSH'
      }

      // Add image URL if uploaded
      if (imageUrl) {
        productData.image = imageUrl
      }

      console.log('Creating product with data:', productData)
      await api.products.create(productData)
      await loadProducts() // Reload products
      
      setShowAddProduct(false)
      setFormData({ title: '', category: '', subcategory: '', description: '', price: '' })
      setUploadedImage(null)
      setSelectedFile(null)
      
      alert('Product added successfully!')
    } catch (error) {
      console.error('Product creation failed:', error)
      if (error.message.includes('Authentication')) {
        alert('Please log in to add products')
      } else {
        alert('Failed to add product: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setLoading(true)
      await api.products.delete(productId)
      setMyProducts(prev => prev.filter(p => p.id !== productId))
      alert('Product deleted successfully!')
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in as an artisan to access your dashboard.</p>
          <Link to="/login" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // Show role mismatch if user is not an artisan
  if (user && !isArtisan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">This dashboard is only available for artisan accounts.</p>
          <Link to="/buyer-dashboard" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors mr-4">
            Go to Buyer Dashboard
          </Link>
          <Link to="/" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <Diamond className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">SokoDigital</span>
            </Link>

            <div className="flex items-center space-x-4">
              <button className="p-3 text-gray-600 hover:text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-200 hover:scale-110">
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowProfileSettings(true)}
                className="flex items-center space-x-3 p-2 text-gray-600 hover:text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-200 hover:scale-105"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                  {profileData.profile_picture_url ? (
                    <img
                      src={profileData.profile_picture_url.startsWith('http') ? profileData.profile_picture_url : ''}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="font-semibold hidden sm:block">{(profileData.full_name || 'Artisan').replace(/[<>"'&]/g, '')}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row">
        <ArtisanSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab)
            setShowAddProduct(false)
            if (tab === 'orders') loadOrders()
            if (tab === 'messages') loadMessages()
          }}
          onAddProduct={() => {
            setActiveTab('products')
            setShowAddProduct(true)
          }}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                  <p className="text-gray-600">Welcome back! Here's what's happening with your artisan business.</p>
                </div>
                {dashboardLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-100 p-8 rounded-2xl border border-gray-200 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                          <div className="text-right">
                            <div className="w-20 h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="w-16 h-8 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                        <div className="w-24 h-4 bg-gray-300 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-12">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold">!</span>
                      </div>
                      <div>
                        <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    </div>
                    <button
                      onClick={loadDashboardData}
                      className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500 rounded-xl">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-600">Total Products</p>
                          <p className="text-3xl font-bold text-blue-900">{dashboardStats.total_products}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-blue-700">
                        <span className="font-medium">+12%</span>
                        <span className="ml-1">from last month</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500 rounded-xl">
                          <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">Total Orders</p>
                          <p className="text-3xl font-bold text-green-900">{dashboardStats.total_orders}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-green-700">
                        <span className="font-medium">+8%</span>
                        <span className="ml-1">from last month</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500 rounded-xl">
                          <span className="text-white font-bold text-lg">KSH</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-purple-600">Revenue</p>
                          <p className="text-3xl font-bold text-purple-900">{dashboardStats.total_revenue.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-purple-700">
                        <span className="font-medium">+15%</span>
                        <span className="ml-1">from last month</span>
                      </div>
                    </div>
                  </div>
                )}


              </>
            )}

            {activeTab === 'products' && !showAddProduct && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">
                    My Products ({myProducts.length})
                  </h1>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="btn-primary px-6 py-3 flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                  </button>
                </div>

                {myProducts.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No products yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">Start your artisan journey by adding your first beautiful creation to showcase your craftsmanship.</p>
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-8 py-4 rounded-xl inline-flex items-center space-x-3 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-6 h-6" />
                      <span>Add Your First Product</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {myProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="p-6">
                          <div className="flex items-start space-x-4 mb-4">
                            <div className="relative">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-24 h-24 rounded-xl object-cover shadow-md"
                              />
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-2 text-lg">{product.title}</h3>
                              <p className="text-2xl font-bold text-primary-600 mb-3">KSH {product.price.toFixed(2)}</p>
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-sm font-semibold rounded-full border border-green-300">
                                  {product.status}
                                </span>
                                <span className="text-sm text-gray-500">• In Stock</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                            <button className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="flex-1 bg-red-50 text-red-600 font-semibold py-3 px-4 rounded-xl hover:bg-red-100 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                <span>Delete</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'products' && showAddProduct && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Add New Product
                  </h1>
                  <button
                    onClick={() => setShowAddProduct(false)}
                    className="btn-secondary px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-8">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Product Image
                    </label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer ${
                        dragActive
                          ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 scale-105'
                          : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                      }`}
                    >
                      {uploadedImage ? (
                        <div className="space-y-6">
                          <div className="relative inline-block">
                            <img src={uploadedImage} alt="Preview" className="w-40 h-40 object-cover rounded-2xl shadow-lg mx-auto" />
                            <button
                              type="button"
                              onClick={() => setUploadedImage(null)}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">Click to change image</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Upload className="w-8 h-8 text-primary-600" />
                          </div>
                          <div className="mb-4">
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <span className="text-primary-600 hover:text-primary-700 font-semibold text-lg">
                                Click to upload
                              </span>
                              <span className="text-gray-600 font-medium"> or drag and drop</span>
                            </label>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              onChange={handleFileInput}
                              accept=".png,.jpg,.jpeg,.gif"
                            />
                          </div>
                          <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg inline-block">
                            PNG, JPG or GIF (MAX. 800x400px)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-3">
                        Product Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Handcrafted Wooden Bowl"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-3">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 bg-white"
                        required
                      >
                        <option value="">Select category</option>
                        <option value="ceramics">🎨 Ceramics</option>
                        <option value="textiles">🧵 Textiles</option>
                        <option value="woodwork">🪵 Woodwork</option>
                        <option value="jewelry">💍 Jewelry</option>
                        <option value="painting">🎭 Painting</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="subcategory" className="block text-sm font-semibold text-gray-900 mb-3">
                        Subcategory
                      </label>
                      <select
                        id="subcategory"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 bg-white"
                        required
                      >
                        <option value="">Select subcategory</option>
                        <option value="functional">🔧 Functional</option>
                        <option value="decorative">🎨 Decorative</option>
                        <option value="wearable">👔 Wearable</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-3">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your masterpiece in detail..."
                      rows={6}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-3">
                      Price (KSH)
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                        <span className="text-gray-500 font-medium">KSH</span>
                        <div className="w-px h-6 bg-gray-300"></div>
                      </div>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full pl-20 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 text-lg font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="px-8 py-4 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Submit Product</span>
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === 'orders' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders</h1>
                  <p className="text-gray-600">Manage your customer orders and track their progress.</p>
                </div>
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-pulse">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                          <div className="flex-1 ml-4">
                            <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
                            <div className="w-32 h-4 bg-gray-200 rounded"></div>
                          </div>
                          <div className="text-right">
                            <div className="w-20 h-6 bg-gray-200 rounded mb-2"></div>
                            <div className="w-16 h-8 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div>
                              <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                              <div className="w-32 h-3 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-28 h-3 bg-gray-200 rounded mb-1"></div>
                            <div className="w-28 h-3 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : artisanOrders.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">When customers purchase your products, their orders will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {artisanOrders.map((order) => (
                      <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
                              <p className="text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''} • {order.user_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${
                              order.status === 'completed'
                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                : order.status === 'pending'
                                ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                                : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <p className="text-2xl font-bold text-gray-900 mt-2">KSH {order.total_amount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="space-y-3 mb-6">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                  <Package className="w-4 h-4 text-primary-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{item.product_title}</p>
                                  <p className="text-sm text-gray-600">Qty: {item.quantity} × KSH {item.unit_price.toLocaleString()}</p>
                                </div>
                              </div>
                              <p className="font-bold text-gray-900">KSH {item.total_price.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{order.user_name}</p>
                              <p className="text-sm text-gray-500">{order.user_email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Ordered: {new Date(order.created_at).toLocaleDateString()}</p>
                            {order.updated_at && (
                              <p className="text-sm text-gray-500">Updated: {new Date(order.updated_at).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'messages' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Messages</h1>
                  <p className="text-gray-600">Communicate with your customers and respond to inquiries.</p>
                </div>
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-pulse">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 ml-4">
                            <div className="w-32 h-6 bg-gray-200 rounded mb-2"></div>
                            <div className="w-48 h-4 bg-gray-200 rounded"></div>
                          </div>
                          <div className="text-right">
                            <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                          </div>
                        </div>
                        <div className="w-full h-16 bg-gray-200 rounded-xl mb-6"></div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex space-x-3">
                            <div className="w-16 h-8 bg-gray-200 rounded"></div>
                            <div className="w-20 h-8 bg-gray-200 rounded"></div>
                          </div>
                          <div className="w-24 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : artisanMessages.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No messages yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">When customers contact you about your products, their messages will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {artisanMessages.map((message) => (
                      <div key={message.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900">{message.sender_name}</h3>
                              <p className="text-gray-600">{message.sender_email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {new Date(message.timestamp).toLocaleDateString()}
                            </span>
                            {!message.is_read && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mx-auto"></div>
                            )}
                          </div>
                        </div>
                        <p className={`p-4 rounded-xl border-l-4 ${
                          message.is_read
                            ? 'text-gray-700 bg-gray-50 border-gray-300'
                            : 'text-gray-700 bg-blue-50 border-blue-500'
                        }`}>
                          {message.message}
                        </p>
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                          <div className="flex space-x-3">
                            <button className="bg-blue-50 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                              Reply
                            </button>
                            {!message.is_read && (
                              <button className="bg-gray-50 text-gray-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                Mark as Read
                              </button>
                            )}
                          </div>
                          <span className={`text-sm ${message.is_read ? 'text-gray-500' : 'text-blue-600 font-semibold'}`}>
                            {message.is_read ? 'Read' : 'New message'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                <button
                  onClick={() => setShowProfileSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.profile_picture_url ? (
                      <img
                        src={profileData.profile_picture_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-primary-600" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={profileLoading}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                  <p className="text-sm text-gray-600">Upload a photo to personalize your profile</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="+254 XXX XXX XXX"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="e.g., Nairobi, Kenya"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                    Bio / Description
                  </label>
                  <textarea
                    id="description"
                    value={profileData.description}
                    onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                    placeholder="Tell customers about yourself, your craft, and what makes your work special..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowProfileSettings(false)}
                  className="px-6 py-3 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profileLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Settings className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArtisanDashboard
