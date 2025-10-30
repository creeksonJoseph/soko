import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Grid, List, Heart, Star, MapPin, Clock } from 'lucide-react'
import Navbar from '../Components/Layout/Navbar'
import Footer from '../Components/Layout/Footer'
import LazyImage from '../Components/LazyImage'
import LoadingSpinner from '../Components/LoadingSpinner'
import { api } from '../services/api'

const ExplorePage = () => {
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  // Categories will be loaded from API

  // Products will be loaded from API

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsResponse, categoriesResponse] = await Promise.all([
          api.products.getAll(),
          api.categories.getAll(),
        ]);

        const productsArray = Array.isArray(productsResponse)
          ? productsResponse
          : [];
        setProducts(productsArray);

        // Build categories with product counts
        const categoryMap = new Map()
        productsArray.forEach(product => {
          const category = product.category || 'other'
          categoryMap.set(category.toLowerCase(), (categoryMap.get(category.toLowerCase()) || 0) + 1)
        })
        
        const categoriesWithCounts = [
          { id: 'all', name: 'All Categories', count: productsArray.length },
          ...categoriesResponse.map(cat => ({
            id: cat.name.toLowerCase(), // Use category name as ID for matching
            name: cat.name,
            count: categoryMap.get(cat.name.toLowerCase()) || 0
          }))
        ]
        
        setCategories(categoriesWithCounts)
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load products. Please try again later.");

        const fallbackProducts = await api.products.getAll().catch(() => []);
        const fallbackCategories = await api.categories.getAll().catch(() => []);

        setProducts(fallbackProducts);
        setCategories([
          { id: "all", name: "All Categories", count: fallbackProducts.length },
          ...fallbackCategories.map((cat) => ({ ...cat, count: 0 })),
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredWorks = products.filter(work => {
    const matchesSearch = work.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         work.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         work.artisan_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || work.category?.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedWorks = [...filteredWorks].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      default:
        return 0;
    }
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Artisan Treasures
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              Explore unique handcrafted pieces from talented Kenyan artisans
              across the country.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for artisans, products, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300 text-lg"
              />
            </div>
          </div>
        </section>

        {/* Filters and Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Filter Controls */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
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

              {/* Sort + View Controls */}
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

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid/List */}
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }`}
          >
            {sortedWorks.map((work) => (
              <Link
                key={work.id}
                to={`/product/${work.id}`}
                className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                <div
                  className={`relative ${
                    viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-square"
                  } overflow-hidden`}
                >
                  <LazyImage
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                  </button>
                </div>

                <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 mb-1">
                    {work.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{work.location || "Kenya"}</span>
                    <span>•</span>
                    <span>by {work.artisan || "Unknown"}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {work.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      KSh {work.price?.toLocaleString() || "N/A"}
                    </span>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        work.in_stock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {work.in_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Loading & Empty States */}
          {loading && (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" text="Loading products..." />
            </div>
          )}
          {!loading && !error && sortedWorks.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No products found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExplorePage;
