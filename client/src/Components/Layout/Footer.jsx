import { Link } from 'react-router-dom'
import { Diamond, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Heart } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-6 group">
                <div className="relative">
                  <Diamond className="w-8 h-8 text-primary-400 group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
                  <div className="absolute inset-0 bg-primary-400/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                </div>
                <span className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">SokoDigital</span>
              </Link>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Empowering Kenyan artisans by connecting them with customers worldwide. Discover authentic craftsmanship and support local talent.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/explore" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    Browse Products
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    Become an Artisan
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Customer Service</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/help" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-300">
                    <p>Nairobi, Kenya</p>
                    <p>Westlands Business Park</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <a href="tel:+254700000000" className="text-gray-300 hover:text-primary-400 transition-colors">
                    +254 700 000 000
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <a href="mailto:hello@sokodigital.com" className="text-gray-300 hover:text-primary-400 transition-colors">
                    hello@sokodigital.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold mb-4 text-white">Stay Updated</h4>
            <p className="text-gray-300 mb-6">Subscribe to our newsletter for the latest artisan stories and exclusive offers.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start space-x-6 text-sm text-gray-400">
              <Link to="/terms" className="hover:text-primary-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-primary-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="hover:text-primary-400 transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>© {currentYear} SokoDigital.</span>
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>in Kenya</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

