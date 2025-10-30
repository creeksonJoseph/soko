import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Star, MessageSquare, ArrowLeft, User, Truck, Shield, RotateCcw, MapPin, Clock, CheckCircle, Share2, Plus, Minus, Eye } from 'lucide-react'
import Navbar from '../Components/Layout/Navbar'
import Footer from '../Components/Layout/Footer'
import LazyImage from '../Components/LazyImage'
import LoadingSpinner from '../Components/LoadingSpinner'
import ReviewModal from '../Components/ReviewModal'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await api.products.getById(id);
        setProduct(productData);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <LoadingSpinner size="lg" text="Loading product..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist.
            </p>
            <Link to="/explore" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Fill missing product data
  const productWithDefaults = {
    ...product,
    images:
      product.images && product.images.length
        ? product.images
        : ["/images/placeholder.svg"],
    category: product.category || "Handcraft",
    subcategory: product.subcategory || "Art",
    inStock: product.stock > 0,
    stockCount: product.stock || 0,
    tags: product.tags || [],
    relatedProducts: product.relatedProducts || [],
    artisan: {
      id: product.artisan_id || 1,
      name: product.artisan_name || "Master Artisan",
      avatar: "/images/placeholder.svg",
      rating: 4.5,
      totalReviews: 12,
      location: "Kenya",
      responseTime: "< 24 hours",
    },
    shipping: {
      cost: 300,
      time: "3-5 business days",
      freeThreshold: 5000,
    },
    reviews: product.reviews || [],
  };

  // Handlers
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please log in to add items to your cart')
      navigate('/login')
      return
    }

    try {
      setAddingToCart(true)
      const productId = product.id || id
      if (!productId) {
        throw new Error('Product ID not found')
      }
      
      // Check session first
      console.log('Checking session before adding to cart...')
      const session = await api.auth.getSession()
      console.log('Session check result:', session)
      
      if (!session || !session.authenticated) {
        alert('Your session has expired. Please log in again.')
        navigate('/login')
        return
      }
      
      await api.cart.add(productId, quantity)
      alert(`Added ${quantity} ${product.title} to cart!`)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      if (error.message.includes('Internal Server Error')) {
        alert('Please log in to add items to your cart')
        navigate('/login')
      } else {
        alert(error.message || 'Failed to add item to cart. Please try again.')
      }
    } finally {
      setAddingToCart(false)
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      alert('Please log in to purchase items')
      navigate('/login')
      return
    }

    try {
      setBuyingNow(true)
      
      // Ensure we have a valid product ID
      const productId = product.id || id
      if (!productId) {
        throw new Error('Product ID not found')
      }
      
      console.log('Buy now - adding to cart:', { productId, quantity })
      await api.cart.add(productId, quantity)
      
      // Navigate to checkout immediately
      navigate('/checkout')
      
    } catch (error) {
      console.error('Failed to add to cart for buy now:', error)
      if (error.message.includes('Internal Server Error')) {
        alert('Please log in to purchase items')
        navigate('/login')
      } else {
        alert(error.message || 'Failed to add item to cart. Please try again.')
      }
    } finally {
      setBuyingNow(false)
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) await api.favorites.remove(product.id);
      else await api.favorites.add(product.id);
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      alert("Failed to update wishlist. Please try again.");
    }
  };

  const handleWriteReview = () => setShowReviewModal(true);

  const handleReviewSubmit = async (reviewData) => {
    try {
      await api.reviews.create({
        product_id: product.id,
        rating: reviewData.rating,
        comment: reviewData.review,
      });
      alert("Review submitted successfully!");
      setShowReviewModal(false);
    } catch {
      alert("Failed to submit review. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-primary-600">
              Home
            </Link>
            <span>/</span>
            <Link to="/explore" className="hover:text-primary-600">
              Explore
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm relative group">
                <LazyImage
                  src={productWithDefaults.images[activeImage] || '/images/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-[500px] object-cover"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {productWithDefaults.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      activeImage === index
                        ? 'border-primary-600 ring-2 ring-primary-100'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <LazyImage
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-primary-600 font-medium bg-primary-50 px-3 py-1 rounded-full">
                        {productWithDefaults.category}
                      </span>
                      {productWithDefaults.subcategory && (
                        <>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{productWithDefaults.subcategory}</span>
                        </>
                      )}
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {product.title}
                    </h1>
                    <div className="flex items-center mt-2 space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i <
                            Math.floor(productWithDefaults.artisan.rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-gray-600">
                        ({productWithDefaults.artisan.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-full ${
                      isWishlisted
                        ? "bg-red-100 text-red-500"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        isWishlisted ? "fill-current" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        KSh {product.price.toLocaleString()}
                      </span>
                    {product.originalPrice && (
                      <span className="text-xl text-gray-500 line-through">
                        KSh {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-1 rounded-full">
                        Save KSh {(product.originalPrice - product.price).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`flex items-center space-x-2 text-sm font-medium ${
                      productWithDefaults.inStock ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      <span>{productWithDefaults.inStock ? `In Stock (${productWithDefaults.stockCount} left)` : 'Out of Stock'}</span>
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {productWithDefaults.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Size
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {product.sizes.map((size, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSize(size)}
                          className={`py-3 px-4 border-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedSize === size
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-primary-300 text-gray-700'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-semibold w-16 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleBuyNow}
                    disabled={!productWithDefaults.inStock || buyingNow}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {buyingNow ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Buy Now</span>
                        <span className="text-lg">•</span>
                        <span>KSh {(product.price * quantity).toLocaleString()}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={!productWithDefaults.inStock || addingToCart}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Artisan Info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="font-semibold text-lg mb-4">
                  Meet the Artisan
                </h3>
                <Link
                  to={`/artisan/${productWithDefaults.artisan.id}`}
                  className="flex items-center space-x-4"
                >
                  <img
                    src={productWithDefaults.artisan.avatar}
                    alt={productWithDefaults.artisan.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {productWithDefaults.artisan.name}
                    </h4>
                    <p className="text-gray-600">
                      {productWithDefaults.artisan.location}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {product.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Materials</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Locally sourced clay</li>
                      <li>• Natural mineral glazes</li>
                      <li>• Traditional firing techniques</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Care Instructions</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Hand wash only</li>
                      <li>• Food safe glaze</li>
                      <li>• Avoid extreme temperature changes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div id="reviews" className="mt-12">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Customer Reviews ({productWithDefaults.reviews.length})
                </h2>
                <button
                  onClick={handleWriteReview}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Write a Review
                </button>
              </div>

              <div className="space-y-8">
                {productWithDefaults.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={review.avatar}
                          alt={review.user}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-gray-900">{review.user}</p>
                            {review.verified && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {review.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-primary-600 text-sm">
                        Helpful ({review.helpful})
                      </button>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productWithDefaults.relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
                >
                  <div className="aspect-square overflow-hidden">
                    <LazyImage
                      src={relatedProduct.image}
                      alt={relatedProduct.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                      {relatedProduct.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        KSh {relatedProduct.price.toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{relatedProduct.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {showReviewModal && (
        <ReviewModal
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
