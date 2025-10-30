import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Diamond, Heart, Trash2, ShoppingCart, Share2 } from "lucide-react";
import Navbar from "../Components/Layout/Navbar";
import Footer from "../Components/Layout/Footer";

const CollectionPage = () => {
  const { id } = useParams();
  const [items, setItems] = useState([
    {
      id: 1,
      title: "Ceramic Vase",
      artisan: "Sarah Johnson",
      price: 45.0,
      image:
        "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop",
      inStock: true,
    },
    {
      id: 2,
      title: "Wood Carving",
      artisan: "John Smith",
      price: 120.0,
      image:
        "https://images.unsplash.com/photo-1551522435-a13afa10f103?w=400&h=400&fit=crop",
      inStock: true,
    },
    {
      id: 3,
      title: "Textile Art",
      artisan: "Maria Garcia",
      price: 85.0,
      image:
        "https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=400&h=400&fit=crop",
      inStock: false,
    },
    {
      id: 4,
      title: "Pottery Bowl",
      artisan: "Sarah Johnson",
      price: 38.0,
      image:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop",
      inStock: true,
    },
  ]);

  const collection = {
    id: id,
    name: "Favorites",
    description: "My favorite handcrafted pieces",
    itemCount: items.length,
    isPublic: false,
  };

  const removeFromCollection = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const addToCart = (itemId) => {
    console.log("Adding to cart:", itemId);
    // Add to cart logic
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Collection Header */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {collection.name}
                </h1>
                <p className="text-gray-600 mb-4">{collection.description}</p>
                <p className="text-sm text-gray-500">
                  {collection.itemCount} items
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="btn-secondary px-4 py-2 flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button className="btn-secondary px-4 py-2">
                  Edit Collection
                </button>
              </div>
            </div>
          </div>

          {/* Collection Items */}
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your collection is empty
              </h2>
              <p className="text-gray-600 mb-6">Start adding items you love!</p>
              <Link
                to="/explore"
                className="btn-primary inline-block px-6 py-3"
              >
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Link to={`/product/${item.id}`}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <button
                      onClick={() => removeFromCollection(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                      title="Remove from collection"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Link
                      to={`/product/${item.id}`}
                      className="text-lg font-bold text-gray-900 hover:text-primary mb-1 block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-600 mb-3">
                      by {item.artisan}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        KSH {item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(item.id)}
                        disabled={!item.inStock}
                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Add to cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CollectionPage;