import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Smartphone, Lock, CheckCircle, Loader } from 'lucide-react'
import Navbar from '../Components/Layout/Navbar'
import Footer from '../Components/Layout/Footer'
import { useCart } from '../hooks/useCart.jsx'
import { api } from '../services/api'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cartItems, loading, clearCart } = useCart()
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Confirmation
  const [processing, setProcessing] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    phone: "",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    phoneNumber: '',
    paymentMethod: 'mpesa'
  })

  useEffect(() => {
    if (!loading && (!cartItems || cartItems.length === 0)) {
      navigate('/cart')
    }
  }, [cartItems, loading, navigate])

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    const validPrice = isNaN(numPrice) ? 0 : numPrice
    return sum + (validPrice * item.quantity)
  }, 0)
  const shipping = 150.00 // KSH 150 shipping
  const tax = subtotal * 0.16 // 16% VAT in Kenya
  const total = subtotal + shipping + tax

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo({ ...paymentInfo, [name]: value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    
    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }
    
    try {
      setProcessing(true)
      
      // Create order
      const orderData = {
        total_amount: total,
        status: 'pending'
      }
      
      const order = await api.orders.create(orderData)
      const orderId = order.order?.id || order.id
      
      // Create order items
      for (const item of cartItems) {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
        await api.orders.createItem({
          order_id: orderId,
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          unit_price: price,
          total_price: price * item.quantity,
          artisan_id: item.product?.artisan_id || item.artisan_id || 1
        })
      }
      
      // Clear cart after successful order creation
      await clearCart()
      
      // Initiate M-Pesa payment
      const paymentData = {
        order_id: orderId,
        phone_number: paymentInfo.phoneNumber
      }
      
      console.log('Initiating M-Pesa payment...', paymentData)
      
      try {
        const response = await api.payments.mpesa.stkPush(paymentData)
        
        if (response && (response.success || response.message)) {
          alert('Payment request sent to your phone. Please complete the payment.')
          setStep(3)
        } else {
          throw new Error(response?.error || 'Payment initiation failed')
        }
      } catch (apiError) {
        console.warn('M-Pesa API not available, simulating payment for demo')
        alert('Demo mode: Payment request sent to your phone. Please complete the payment.')
        setStep(3)
      }
      
    } catch (error) {
      console.error('Payment failed:', error)
      alert(`Payment failed: ${error.message}. Please try again.`)
    } finally {
      setProcessing(false)
    }
  }



  const handleConfirmOrder = () => {
    alert("Order confirmed! Thank you for shopping with us.");
    navigate("/");
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target
    setShippingInfo({ ...shippingInfo, [name]: value })
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    setStep(2)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Shipping Information
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        className="w-full border border-gray-300 rounded-lg p-3"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        className="w-full border border-gray-300 rounded-lg p-3"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-between pt-6">
                    <Link to="/cart" className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg">
                      Back to Cart
                    </Link>
                    <button type="submit" className="bg-primary-600 text-white px-6 py-3 rounded-lg">
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Payment Information
                </h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={paymentInfo.phoneNumber}
                      onChange={handlePaymentChange}
                      placeholder="254712345678"
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                  </div>
                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={processing}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
                    >
                      {processing ? 'Processing...' : 'Pay with M-Pesa'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Order Confirmed!
                </h2>
                <p className="text-gray-600 mb-8">
                  Thank you for your purchase.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/" className="bg-primary-600 text-white px-6 py-3 rounded-lg">
                    Go Home
                  </Link>
                  <Link to="/explore" className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.product?.title || item.title}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900">KSH {(() => {
                      const price = item.product?.price || item.price || 0
                      const numPrice = typeof price === 'string' ? parseFloat(price) : price
                      const validPrice = isNaN(numPrice) ? 0 : numPrice
                      return (validPrice * item.quantity).toFixed(2)
                    })()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">KSH {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CheckoutPage
