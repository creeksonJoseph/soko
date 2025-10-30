import { Link, useLocation } from "react-router-dom";
import {
  Diamond,
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const BuyerSidebar = ({ activeTab, setActiveTab }) => {
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";
  const isMessagesPage = location.pathname.startsWith("/messages");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTabClick = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-full lg:w-80"} bg-gradient-to-b from-white to-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 shadow-lg transition-all duration-300`}
    >
      <div className="p-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between mb-8 p-2 rounded-xl hover:bg-primary-50 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Diamond className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  Buyer Hub
                </h2>
                <p className="text-xs text-gray-500">
                  click to collapse sidebar
                </p>
              </div>
            )}
          </div>
          <div className="text-gray-600 group-hover:text-primary-600 transition-colors">
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </div>
        </button>
        <nav className="space-y-3">
          {isCartPage || isMessagesPage ? (
            <>
              <Link
                to="/buyer-dashboard"
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <LayoutDashboard className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Dashboard</span>
                )}
              </Link>
              <Link
                to="/buyer-dashboard"
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <ShoppingBag className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">My Orders</span>
                )}
              </Link>
              {isMessagesPage ? (
                <div
                  className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]`}
                >
                  <MessageSquare className="w-6 h-6 flex-shrink-0 text-white" />
                  {!isCollapsed && (
                    <span className="font-semibold text-lg">Messages</span>
                  )}
                </div>
              ) : (
                <Link
                  to="/messages"
                  className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
                >
                  <MessageSquare className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                  {!isCollapsed && (
                    <span className="font-semibold text-lg">Messages</span>
                  )}
                </Link>
              )}
              <Link
                to="/buyer-dashboard"
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <Heart className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Collections</span>
                )}
              </Link>
              <Link
                to="/buyer-dashboard"
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <Search className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Explore</span>
                )}
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => handleTabClick("dashboard")}
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
                onClick={() => handleTabClick("orders")}
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
                  <span className="font-semibold text-lg">My Orders</span>
                )}
              </button>

              <button
                onClick={() => handleTabClick("messages")}
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

              <button
                onClick={() => handleTabClick("collections")}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                  activeTab === "collections"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <Heart
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    activeTab === "collections"
                      ? "text-white"
                      : "text-primary-600 group-hover:text-primary-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Collections</span>
                )}
              </button>

              <button
                onClick={() => handleTabClick("explore")}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                  activeTab === "explore"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <Search
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    activeTab === "explore"
                      ? "text-white"
                      : "text-primary-600 group-hover:text-primary-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Explore</span>
                )}
              </button>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default BuyerSidebar;
