import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Star, Package, CreditCard, Plus, Search, Filter, Grid, List, MapPin, ShoppingBag, MessageSquare, Heart } from 'lucide-react'
import ReviewModal from '../Components/ReviewModal'
import LazyImage from '../Components/LazyImage'
import DashboardNavbar from '../Components/Layout/DashboardNavbar'
import BuyerSidebar from '../Components/Layout/BuyerSidebar'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const BuyerDashboard = () => {
  const { user, isAuthenticated, isBuyer, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard')
  const [reviewModal, setReviewModal] = useState({ isOpen: false, product: null })

  // State for API data
  const [orders, setOrders] = useState([])
  const [messages, setMessages] = useState([])
  const [collections, setCollections] = useState([])
  const [payments, setPayments] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    total_orders: 0,
    total_collections: 0,
    total_messages: 0,
    total_spent: 0
  })

  // Explore tab state
  const [exploreProducts, setExploreProducts] = useState([])
  const [exploreCategories, setExploreCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState('grid')

  // Loading and error states
  const [loading, setLoading] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load dashboard data on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Loading buyer dashboard for user:', user)
      loadDashboardData()
      
      // Check URL parameter for tab
      const tabParam = searchParams.get('tab')
      if (tabParam === 'explore') {
        setActiveTab('explore')
        loadExploreData()
      }
    } else {
      console.log('User not authenticated, skipping dashboard load')
    }
  }, [isAuthenticated, user, searchParams])

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true)
      setError(null)

      // Load all dashboard data in parallel, but handle failures gracefully
      const results = await Promise.allSettled([
        api.orders.getAll(),
        api.messages.getConversations(),
        api.favorites.getAll(),
        api.payments.getAll()
      ])

      const ordersData = results[0].status === 'fulfilled' ? results[0].value : []
      const messagesData = results[1].status === 'fulfilled' ? results[1].value : []
      const collectionsData = results[2].status === 'fulfilled' ? results[2].value : []
      const paymentsData = results[3].status === 'fulfilled' ? results[3].value : []

      console.log('Dashboard data loaded:', { ordersData, messagesData, collectionsData, paymentsData })

      setOrders(ordersData || [])
      setMessages(messagesData || [])
      setCollections(collectionsData || [])
      setPayments(paymentsData || [])

      // Calculate dashboard stats
      const completedPayments = (paymentsData || []).filter(p => p.status === 'completed')
      const totalSpent = completedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
      
      setDashboardStats({
        total_orders: (ordersData || []).length,
        total_collections: (collectionsData || []).length,
        total_messages: (messagesData || []).length,
        total_spent: totalSpent
      })

      // Check if any critical errors occurred
      const failedRequests = results.filter(r => r.status === 'rejected')
      if (failedRequests.length > 0) {
        console.warn('Some dashboard data failed to load:', failedRequests.map(r => r.reason?.message))
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Set empty state instead of error for new users
      setOrders([])
      setMessages([])
      setCollections([])
      setPayments([])
      setDashboardStats({ total_orders: 0, total_collections: 0, total_messages: 0, total_spent: 0 })
      
      if (error.message.includes('Please log in')) {
        setError('Please log in to view your dashboard.')
      } else {
        console.warn('Dashboard endpoints failed, showing empty state for new user')
      }
    } finally {
      setDashboardLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await api.orders.getAll()
      setOrders(ordersData || [])
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
      const messagesData = await api.messages.getConversations()
      setMessages(messagesData || [])
    } catch (error) {
      console.error('Failed to load messages:', error)
      setError('Failed to load messages. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadCollections = async () => {
    try {
      setLoading(true)
      const collectionsData = await api.favorites.getAll()
      setCollections(collectionsData || [])
    } catch (error) {
      console.error('Failed to load collections:', error)
      setError('Failed to load collections. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadPayments = async () => {
    try {
      setLoading(true)
      const paymentsData = await api.payments.getAll()
      setPayments(paymentsData || [])
    } catch (error) {
      console.error('Failed to load payments:', error)
      setError('Failed to load payments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadExploreData = async () => {
    try {
      setLoading(true)
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll(),
      ])

      const productsArray = Array.isArray(productsResponse) ? productsResponse : []
      setExploreProducts(productsArray)

      const categoryMap = new Map()
      productsArray.forEach(product => {
        const category = product.category || 'other'
        categoryMap.set(category.toLowerCase(), (categoryMap.get(category.toLowerCase()) || 0) + 1)
      })
      
      const categoriesWithCounts = [
        { id: 'all', name: 'All Categories', count: productsArray.length },
        ...categoriesResponse.map(cat => ({
          id: cat.name.toLowerCase(),
          name: cat.name,
          count: categoryMap.get(cat.name.toLowerCase()) || 0
        }))
      ]
      
      setExploreCategories(categoriesWithCounts)
    } catch (error) {
      console.error('Failed to load explore data:', error)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'In Transit':
        return 'bg-blue-100 text-blue-800'
      case 'Processing':
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Ensure Unsplash images include formatting params and provide a network-safe fallback.
  const ensureUnsplashFormat = (url) => {
    if (!url) return url
    try {
      // If the hostname is images.unsplash.com and there is no auto=format param, append common params.
      const parsed = new URL(url)
      if (parsed.hostname.includes('images.unsplash.com')) {
        // If the URL already contains auto= or q= assume it's formatted
        if (!/auto=|q=/.test(parsed.search)) {
          const sep = parsed.search ? '&' : '?'
          return `${url}${sep}auto=format&fit=crop&q=80`
        }
      }
    } catch (e) {
      // ignore and return original
    }
    return url
  }

  const safeSrc = (url, w = 200, h = 200) => {
    const formatted = ensureUnsplashFormat(url)
    return formatted || '/images/placeholder.jpg'
  }

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in as a buyer to access your dashboard.</p>
          <Link to="/login" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // Show role mismatch if user is not a buyer
  if (user && !isBuyer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">This dashboard is only available for buyer accounts.</p>
          <Link to="/artisan-dashboard" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors mr-4">
            Go to Artisan Dashboard
          </Link>
          <Link to="/" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const handleSidebarClick = (tab) => {
    setActiveTab(tab)
    switch(tab) {
      case 'orders': loadOrders(); break;
      case 'messages': loadMessages(); break;
      case 'collections': loadCollections(); break;
      case 'explore': loadExploreData(); break;
      case 'payments': loadPayments(); break;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardNavbar />
      <div className="flex flex-col lg:flex-row">
        <BuyerSidebar activeTab={activeTab} setActiveTab={handleSidebarClick} />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                  <p className="text-gray-600">Welcome back! Here's your shopping activity at a glance.</p>
                </div>

                {dashboardLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-100 p-8 rounded-2xl border border-gray-200 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                          <div className="text-right">
                            <div className="w-16 h-6 bg-gray-300 rounded mb-2"></div>
                            <div className="w-12 h-8 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                        <div className="w-20 h-4 bg-gray-300 rounded"></div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500 rounded-xl">
                          <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-600">Total Orders</p>
                          <p className="text-3xl font-bold text-blue-900">{dashboardStats.total_orders}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-blue-700">
                        <span className="font-medium">+5%</span>
                        <span className="ml-1">from last month</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500 rounded-xl">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">Collections</p>
                          <p className="text-3xl font-bold text-green-900">{dashboardStats.total_collections}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-green-700">
                        <span className="font-medium">+12%</span>
                        <span className="ml-1">from last month</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500 rounded-xl">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-purple-600">Messages</p>
                          <p className="text-3xl font-bold text-purple-900">{dashboardStats.total_messages}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-purple-700">
                        <span className="font-medium">+8%</span>
                        <span className="ml-1">from last month</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-500 rounded-xl">
                          <span className="text-white font-bold text-lg">KSH</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-orange-600">Total Spent</p>
                          <p className="text-3xl font-bold text-orange-900">{dashboardStats.total_spent.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-orange-700">
                        <span className="font-medium">+15%</span>
                        <span className="ml-1">from last month</span>
                      </div>
                    </div>
                  </div>
                )}


              </>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
                  <p className="text-gray-600">Track your purchases and manage your order history.</p>
                </div>

                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-pulse">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                          <div className="flex-1 ml-6">
                            <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
                            <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="w-40 h-4 bg-gray-200 rounded"></div>
                          </div>
                          <div className="text-right">
                            <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="w-20 h-6 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                          <div className="w-24 h-8 bg-gray-200 rounded"></div>
                          <div className="w-28 h-8 bg-gray-200 rounded"></div>
                          <div className="w-32 h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">Start your shopping journey by exploring beautiful handmade crafts from talented artisans.</p>
                    <Link
                      to="/explore"
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-8 py-4 rounded-xl inline-flex items-center space-x-3 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <span>Explore Products</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="p-8">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start space-x-6">
                              <div className="relative">
                                <img
                                  src={safeSrc(order.image)}
                                  alt={order.title || order.product}
                                  className="w-24 h-24 rounded-xl object-cover shadow-md"
                                />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-xl mb-2">{order.title || order.product}</h3>
                                <p className="text-gray-600 mb-1">by {order.artisan_name || order.artisan}</p>
                                <p className="text-sm text-gray-500">Order #{order.id} • {order.created_at ? new Date(order.created_at).toLocaleDateString() : order.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-primary-600 mb-3">KSH {(order.total_amount || order.price).toLocaleString()}</p>
                              <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${
                                (order.status || '').toLowerCase() === 'completed' || (order.status || '').toLowerCase() === 'delivered'
                                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                  : (order.status || '').toLowerCase() === 'in transit' || (order.status || '').toLowerCase() === 'processing'
                                  ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300'
                                  : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                              }`}>
                                {order.status || 'Processing'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 pt-6 border-t border-gray-100">
                            <Link to={`/product/${order.product_id || order.id.replace('#', '')}`} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                              <span>View Product</span>
                            </Link>
                            {(order.status || '').toLowerCase() === 'completed' || (order.status || '').toLowerCase() === 'delivered' ? (
                              <button
                                onClick={() => setReviewModal({ isOpen: true, product: order })}
                                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                              >
                                <Star className="w-4 h-4" />
                                <span>Write Review</span>
                              </button>
                            ) : null}
                            <Link to={`/messages/${order.artisan_id}`} className="flex-1 bg-blue-50 text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-blue-100 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                              <MessageSquare className="w-4 h-4" />
                              <span>Message Artisan</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Messages</h1>
                  <p className="text-gray-600">Communicate with artisans about your orders and inquiries.</p>
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
                            <div className="w-16 h-4 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No messages yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">When you contact artisans or they respond to your inquiries, messages will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div key={message.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-xl font-bold text-gray-900">{message.sender_name || message.artisan}</h3>
                                {message.is_read === false && (
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-gray-600">{message.sender_email || 'Artisan'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {message.timestamp ? new Date(message.timestamp).toLocaleDateString() : message.time}
                            </span>
                          </div>
                        </div>
                        <p className={`p-4 rounded-xl border-l-4 ${
                          message.is_read === false
                            ? 'text-gray-700 bg-blue-50 border-blue-500'
                            : 'text-gray-700 bg-gray-50 border-gray-300'
                        }`}>
                          {message.message || message.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                          <div className="flex space-x-3">
                            <Link
                              to={`/messages/${message.sender_id}`}
                              className="bg-blue-50 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Reply
                            </Link>
                            {message.is_read === false && (
                              <button className="bg-gray-50 text-gray-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                Mark as Read
                              </button>
                            )}
                          </div>
                          <span className={`text-sm ${message.is_read === false ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                            {message.is_read === false ? 'New message' : 'Read'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Collections Tab */}
            {activeTab === 'collections' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Favorite Products</h1>
                  <p className="text-gray-600">Your saved favorite handcrafted items from talented artisans.</p>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
                        <div className="aspect-square bg-gray-200"></div>
                        <div className="p-6">
                          <div className="w-32 h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="w-20 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : collections.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No favorites yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">Start adding products to your favorites by clicking the heart icon on products you love.</p>
                    <Link
                      to="/buyer-dashboard?tab=explore"
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-8 py-4 rounded-xl inline-flex items-center space-x-3 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <span>Explore Products</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {collections.map((favorite) => (
                      <Link
                        key={favorite.id}
                        to={`/product/${favorite.product_id || favorite.id}`}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                      >
                        <div className="aspect-square overflow-hidden relative">
                          <img
                            src={safeSrc(favorite.product?.image || favorite.image, 400, 400)}
                            alt={favorite.product?.title || favorite.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 p-2 bg-white/80 rounded-full">
                            <Heart className="w-4 h-4 text-red-500 fill-current" />
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 mb-1">
                            {favorite.product?.title || favorite.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">by {favorite.product?.artisan_name || favorite.artisan_name || 'Unknown'}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-gray-900">
                              KSh {(favorite.product?.price || favorite.price || 0).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              Added {favorite.created_at ? new Date(favorite.created_at).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Explore Tab */}
            {activeTab === 'explore' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Products</h1>
                  <p className="text-gray-600">Discover unique handcrafted pieces from talented artisans.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <div className="relative max-w-2xl">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search for products, artisans, or categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {exploreCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === category.id
                              ? "bg-primary-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {category.name} ({category.count})
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="featured">Featured</option>
                        <option value="newest">Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                      </select>

                      <div className="flex border border-gray-300 rounded-lg">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-2 ${
                            viewMode === "grid"
                              ? "bg-primary-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Grid className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`p-2 ${
                            viewMode === "list"
                              ? "bg-primary-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <List className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {(() => {
                  const filteredProducts = exploreProducts.filter(product => {
                    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                         product.artisan_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchesCategory = selectedCategory === 'all' || product.category?.toLowerCase() === selectedCategory
                    return matchesSearch && matchesCategory
                  })

                  const sortedProducts = [...filteredProducts].sort((a, b) => {
                    switch (sortBy) {
                      case "price-low":
                        return (a.price || 0) - (b.price || 0)
                      case "price-high":
                        return (b.price || 0) - (a.price || 0)
                      case "rating":
                        return (b.rating || 0) - (a.rating || 0)
                      case "newest":
                        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
                      default:
                        return 0
                    }
                  })

                  return (
                    <div className={`${
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "space-y-4"
                    }`}>
                      {sortedProducts.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                            viewMode === "list" ? "flex" : ""
                          }`}
                        >
                          <div className={`relative ${
                            viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-square"
                          } overflow-hidden`}>
                            <LazyImage
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                            </button>
                          </div>

                          <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 mb-1">
                              {product.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <MapPin className="w-3 h-3" />
                              <span>{product.location || "Kenya"}</span>
                              <span>•</span>
                              <span>by {product.artisan_name || "Unknown"}</span>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {product.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-gray-900">
                                KSh {product.price?.toLocaleString() || "N/A"}
                              </span>
                              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                product.in_stock
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {product.in_stock ? "In Stock" : "Out of Stock"}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )
                })()} 

                {loading && (
                  <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
                  </div>
                )}
                {!loading && exploreProducts.length === 0 && (
                  <div className="text-center py-16 text-gray-600">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No products found. Try adjusting your filters.</p>
                  </div>
                )}
              </>
            )}

            {/* Payment History Tab */}
            {activeTab === 'payments' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment History</h1>
                  <p className="text-gray-600">View all your payment transactions and receipts.</p>
                </div>

                {loading ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
                    <div className="p-6 border-b border-gray-200">
                      <div className="grid grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="w-full h-6 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-6 border-b border-gray-100 last:border-0">
                        <div className="grid grid-cols-5 gap-4">
                          {[1, 2, 3, 4, 5].map((j) => (
                            <div key={j} className="w-full h-4 bg-gray-200 rounded"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : payments.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CreditCard className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No payment history</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">Your completed payment transactions will appear here once you make purchases.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                          <tr>
                            <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Order ID</th>
                            <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Date</th>
                            <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Method</th>
                            <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Amount</th>
                            <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-8 py-6 text-sm font-semibold text-gray-900">
                                #{payment.order_id || payment.orderId}
                              </td>
                              <td className="px-8 py-6 text-sm text-gray-600">
                                {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : payment.date}
                              </td>
                              <td className="px-8 py-6 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <CreditCard className="w-4 h-4 text-gray-400" />
                                  <span>{payment.method || 'M-Pesa'}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-sm font-bold text-primary-600">
                                KSH {(payment.amount || 0).toLocaleString()}
                              </td>
                              <td className="px-8 py-6">
                                <span className={`px-4 py-2 text-xs font-semibold rounded-full border ${
                                  (payment.status || '').toLowerCase() === 'completed'
                                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                    : (payment.status || '').toLowerCase() === 'pending'
                                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                                    : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                                }`}>
                                  {payment.status || 'Completed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, product: null })}
        product={reviewModal.product}
      />
    </div>
  )
}

export default BuyerDashboard
