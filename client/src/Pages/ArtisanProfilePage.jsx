import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Star, MapPin, MessageSquare, Award, Package } from "lucide-react";
import Navbar from "../Components/Layout/Navbar";
import Footer from "../Components/Layout/Footer";

const ArtisanProfilePage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("products");

  // Mock artisan data
  const artisan = {
    id: id,
    name: "Sarah Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=400&fit=crop",
    location: "Portland, Oregon",
    memberSince: "2023",
    rating: 4.8,
    totalReviews: 124,
    totalSales: 450,
    bio: "Passionate ceramic artist specializing in handcrafted pottery and decorative pieces. I draw inspiration from nature and traditional techniques passed down through generations. Each piece is unique and made with love and attention to detail.",
    specialties: ["Ceramics", "Pottery", "Sculpture"],
    products: [
      {
        id: 1,
        title: "Ceramic Vase",
        price: 45.0,
        image:
          "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop",
        sales: 45,
      },
      {
        id: 2,
        title: "Pottery Bowl",
        price: 38.0,
        image:
          "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop",
        sales: 32,
      },
      {
        id: 3,
        title: "Decorative Plate",
        price: 52.0,
        image:
          "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
        sales: 28,
      },
      {
        id: 4,
        title: "Tea Set",
        price: 95.0,
        image:
          "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop",
        sales: 18,
      },
    ],
    reviews: [
      {
        id: 1,
        user: "John Doe",
        rating: 5,
        comment:
          "Amazing craftsmanship! The attention to detail is incredible. Highly recommend!",
        date: "2 weeks ago",
        product: "Ceramic Vase",
      },
      {
        id: 2,
        user: "Jane Smith",
        rating: 5,
        comment:
          "Beautiful work and excellent communication. Will definitely order again.",
        date: "1 month ago",
        product: "Pottery Bowl",
      },
      {
        id: 3,
        user: "Mike Wilson",
        rating: 4,
        comment:
          "Great quality pieces. Shipping was a bit slow but worth the wait.",
        date: "1 month ago",
        product: "Decorative Plate",
      },
      {
        id: 4,
        user: "Emily Davis",
        rating: 5,
        comment: "Absolutely stunning! Exceeded my expectations. Thank you!",
        date: "2 months ago",
        product: "Tea Set",
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        {/* Cover Image */}
        <div
          className="h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${artisan.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="relative -mt-20 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <img
                  src={artisan.avatar}
                  alt={artisan.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {artisan.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{artisan.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>Member since {artisan.memberSince}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(artisan.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{artisan.rating}</span>
                      <span className="text-gray-600">
                        ({artisan.totalReviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{artisan.totalSales}</span>
                      <span className="text-gray-600">sales</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {artisan.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  to={`/messages/${artisan.id}`}
                  className="btn-primary px-6 py-3 flex items-center space-x-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Contact Artisan</span>
                </Link>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{artisan.bio}</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-8">
                <button
                  onClick={() => setActiveTab("products")}
                  className={`py-4 border-b-2 font-medium transition-colors ${
                    activeTab === "products"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Products ({artisan.products.length})
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`py-4 border-b-2 font-medium transition-colors ${
                    activeTab === "reviews"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Reviews ({artisan.reviews.length})
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Products Tab */}
              {activeTab === "products" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {artisan.products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group"
                    >
                      <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-2">
                            {product.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              ${product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {product.sales} sold
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {artisan.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-6 last:border-0"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <p className="font-bold text-gray-900">
                              {review.user}
                            </p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Purchased: {review.product}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.date}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArtisanProfilePage;