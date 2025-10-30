import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../Components/Layout/Navbar'
import Footer from '../Components/Layout/Footer'
import LazyImage from '../Components/LazyImage'
import LoadingSpinner from '../Components/LoadingSpinner'
import { api } from '../services/api'
import { Star, Users, Award, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredWorks, setFeaturedWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Interior Designer',
      content: 'The quality of craftsmanship is outstanding. I love supporting local artisans.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Collector',
      content: 'Found unique pieces I couldn\'t find anywhere else. Highly recommend!',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Home Owner',
      content: 'Beautiful products that tell a story. The artisans are incredibly talented.',
      rating: 5
    }
  ]

  const stats = [
    { icon: Users, value: "500+", label: "Active Artisans" },
    { icon: Award, value: "10K+", label: "Products Sold" },
    { icon: Star, value: "4.9", label: "Average Rating" },
    { icon: TrendingUp, value: "95%", label: "Customer Satisfaction" },
  ];

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await api.products.getAll({ limit: 4, featured: true });
        setFeaturedWorks(Array.isArray(response) ? response.slice(0, 4) : []);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
        setError("Failed to load featured products");

        // Fallback data if API fails
        setFeaturedWorks([
          {
            id: 1,
            title: "Ceramic Vase",
            description: "Handcrafted ceramic vase with a unique glaze.",
            image: "/images/ceramic-vase.jpg",
            price: 2500,
            artisan: "Mary Wanjiku",
          },
          {
            id: 2,
            title: "Woven Basket",
            description: "Woven basket with intricate patterns and natural dyes.",
            image: "/images/woven-basket.jpg",
            price: 1800,
            artisan: "John Kiprop",
          },
          {
            id: 3,
            title: "Wood Carving",
            description: "Detailed wood carving of a native animal.",
            image: "/images/wood-carving.jpg",
            price: 3200,
            artisan: "David Njoroge",
          },
          {
            id: 4,
            title: "Textile Art",
            description:
              "Colorful textile art piece depicting a local scene.",
            image: "/images/textile-art.jpg",
            price: 4500,
            artisan: "Grace Achieng",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (featuredWorks.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredWorks.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [featuredWorks.length]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Skip link target */}
      <a id="main-content" className="sr-only">Main content</a>

      {/* Enhanced Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
        aria-label="Hero section"
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800"
          style={{
            backgroundImage: "url(/images/hero-bg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Animated background circles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-20 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">
              Discover Authentic Kenyan Craftsmanship
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Empowering{" "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Local Artisans
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-2xl mx-auto leading-relaxed">
            Connect with talented Kenyan artisans and discover unique, handcrafted products that tell stories of culture, tradition, and creativity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="group bg-white text-primary-700 font-semibold rounded-xl px-8 py-4 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Join as Artisan
              <ArrowRight className="inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/explore"
              className="group bg-transparent border-2 border-white text-white font-semibold rounded-xl px-8 py-4 hover:bg-white hover:text-primary-700 transition-all duration-300 transform hover:scale-105"
            >
              Explore Marketplace
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-200">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>500+ Artisans</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Artworks
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover handcrafted treasures from our talented community of artisans
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" text="Loading featured products..." />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredWorks.map((work) => (
                <Link
                  key={work.id}
                  to={`/product/${work.id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden">
                    <LazyImage
                      src={work.image || "/images/placeholder.jpg"}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {work.title}
                      </h3>
                      <span className="text-lg font-bold text-primary-600">
                        KSh {work.price?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {work.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        by {work.artisan_name || work.artisan || "Unknown Artisan"}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold rounded-xl px-8 py-4 hover:bg-primary-700 transition-colors"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of artisans and customers connecting through authentic
            craftsmanship
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-700 font-semibold rounded-xl px-8 py-4 hover:bg-gray-50 transition-colors transform hover:scale-105"
            >
              Become an Artisan
            </Link>
            <Link
              to="/explore"
              className="border-2 border-white text-white font-semibold rounded-xl px-8 py-4 hover:bg-white hover:text-primary-700 transition-all"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
