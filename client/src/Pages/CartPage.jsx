import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, Loader } from 'lucide-react'
import DashboardNavbar from '../Components/Layout/DashboardNavbar'
import BuyerSidebar from '../Components/Layout/BuyerSidebar'
import { useCart } from '../hooks/useCart.jsx'
import { useAuth } from '../context/AuthContext'

const CartPage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isBuyer, logout } = useAuth()
  const { cartItems, loading, updateQuantity, removeFromCart } = useCart()
  const [updating, setUpdating] = useState({})

  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return
    try {
      setUpdating(prev => ({ ...prev, [id]: true }))
      await updateQuantity(id, newQuantity)
    } catch (error) {
      alert('Failed to update quantity. Please try again.')
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleRemoveItem = async (id) => {
    try {
      setUpdating(prev => ({ ...prev, [id]: true }))
      await removeFromCart(id)
    } catch (error) {
      alert('Failed to remove item. Please try again.')
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }))
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    const validPrice = isNaN(numPrice) ? 0 : numPrice
    return sum + (validPrice * item.quantity)
  }, 0)

  const shipping = 150.00 // KSH 150 shipping
  const tax = subtotal * 0.16 // 16% VAT
  const total = subtotal + shipping + tax

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }
    navigate("/checkout")
  }

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your cart.</p>
          <Link to="/login" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardNavbar />
      <div className="flex flex-col lg:flex-row">
        <BuyerSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Shopping Cart
          </h1>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Loader className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading your cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Add some beautiful handcrafted items to get started!
              </p>
              <Link to="/buyer-dashboard?tab=explore" className="btn-primary inline-block px-6 py-3">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-start space-x-4">
                      <Link to={`/product/${item.product_id || item.productId}`}>
                        <img
                          src={
                            item.product?.image ||
                            item.image ||
                            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop'
                          }
                          alt={item.product?.title || item.title}
                          className="w-24 h-24 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop'
                          }}
                        />
                      </Link>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link 
                              to={`/product/${item.product_id || item.productId}`}
                              className="text-lg font-bold text-gray-900 hover:text-primary"
                            >
                              {item.product?.title || item.title}
                            </Link>
                            <p className="text-sm text-gray-600">by {item.product?.artisan_name || item.artisan || 'Unknown Artisan'}</p>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={updating[item.id]}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            {updating[item.id] ? (
                              <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={updating[item.id] || item.quantity <= 1}
                              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <span className="text-lg font-medium w-8 text-center">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updating[item.id]}
                              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xl font-bold text-gray-900">
                            KSH {(() => {
                              const price = item.product?.price || item.price || 0
                              const numPrice = typeof price === 'string' ? parseFloat(price) : price
                              const validPrice = isNaN(numPrice) ? 0 : numPrice
                              return (validPrice * item.quantity).toFixed(2)
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span className="font-medium">KSH {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Shipping</span>
                      <span className="font-medium">KSH {shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Tax (16%)</span>
                      <span className="font-medium">KSH {tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-gray-900">KSH {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleCheckout} className="w-full btn-primary py-3 text-lg mb-4">
                    Proceed to Checkout
                  </button>

                  <Link
                    to="/buyer-dashboard?tab=explore"
                    className="block text-center text-primary hover:text-primary-hover font-medium"
                  >
                    Continue Shopping
                  </Link>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">We accept:</p>
                    <div className="flex items-center flex-wrap gap-2">
                      <div className="px-3 py-2 bg-green-100 rounded text-xs font-medium text-green-700">
                        M-Pesa
                      </div>
                      <div className="px-3 py-2 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        Visa
                      </div>
                      <div className="px-3 py-2 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        Mastercard
                      </div>
                      <div className="px-3 py-2 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        PayPal
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default CartPage
