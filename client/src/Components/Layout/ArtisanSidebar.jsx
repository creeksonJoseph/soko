import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Diamond, LayoutDashboard, Package, ShoppingBag, MessageSquare, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

const ArtisanSidebar = ({ activeTab, onTabChange, onAddProduct, isCollapsed, onToggleCollapse }) => {
  const location = useLocation()
  const isMessagesPage = location.pathname === '/messages'

  const handleTabClick = (tab) => {
    if (tab === 'addProduct') {
      onAddProduct()
    } else {
      onTabChange(tab)
    }
  }

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-80'} bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg transition-all duration-300`}>
      <div className="p-6">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-8`}>
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <Diamond className="w-7 h-7 text-white" fill="currentColor" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-gray-900">Artisan Hub</h2>
              <p className="text-sm text-gray-500">Manage your craft</p>
            </div>
          )}
        </div>
        
        <button
          onClick={onToggleCollapse}
          className={`mb-6 p-2 rounded-lg hover:bg-gray-100 transition-colors ${isCollapsed ? 'mx-auto' : 'ml-auto'} flex`}
        >
          <div className="w-5 h-5 text-gray-600">
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </div>
        </button>

        <nav className="space-y-3">
          {isMessagesPage ? (
            <>
              <Link
                to="/artisan-dashboard"
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <LayoutDashboard className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Dashboard</span>
                )}
              </Link>
              <Link
                to="/artisan-dashboard"
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <Package className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">My Products</span>
                )}
              </Link>
              <button
                onClick={() => handleTabClick('addProduct')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <Plus className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Add Product</span>
                )}
              </button>
              <Link
                to="/artisan-dashboard"
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <ShoppingBag className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Orders</span>
                )}
              </Link>
              <div
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]`}
              >
                <MessageSquare className="w-6 h-6 flex-shrink-0 text-white" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Messages</span>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => handleTabClick('dashboard')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                  activeTab === "dashboard"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <LayoutDashboard
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    activeTab === "dashboard"
                      ? "text-white"
                      : "text-primary-600 group-hover:text-primary-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Dashboard</span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('products')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                  activeTab === "products"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <Package
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    activeTab === "products"
                      ? "text-white"
                      : "text-primary-600 group-hover:text-primary-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">My Products</span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('addProduct')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01] border-2 border-dashed border-primary-300 hover:border-primary-400`}
              >
                <Plus
                  className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700"
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Add Product</span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('orders')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                  activeTab === "orders"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <ShoppingBag
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    activeTab === "orders"
                      ? "text-white"
                      : "text-primary-600 group-hover:text-primary-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Orders</span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('messages')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                  activeTab === "messages"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <MessageSquare
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    activeTab === "messages"
                      ? "text-white"
                      : "text-primary-600 group-hover:text-primary-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Messages</span>
                )}
              </button>
            </>
          )}
        </nav>
      </div>
    </aside>
  )
}

export default ArtisanSidebar