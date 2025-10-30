const API_URL = import.meta.env.VITE_API_URL;

// API request helper with comprehensive error handling
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...options.headers
      },
      credentials: 'include', // Essential for Flask session cookies
      ...options
    };
    
    // Always set Content-Type for non-GET requests unless it's FormData
    if (config.method !== 'GET') {
      if (!(options.body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(url, config);
    
    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: response.statusText };
    }
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API] Error for ${endpoint}:`, error.message);
    throw error;
  }
};

// Helper to enhance product data
const enhanceProduct = (product) => {
  if (!product) return product;
  return {
    ...product,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    stock: typeof product.stock === 'string' ? parseInt(product.stock) : product.stock,
    currency: product.currency || 'KSh',
    image: product.image || '/images/placeholder.jpg',
    artisan_name: product.artisan_name || 'Unknown Artisan',
    location: product.location || 'Kenya',
    rating: product.rating || 4.5,
    review_count: product.review_count || 0,
    in_stock: product.stock > 0
  };
};

export const api = {
  // Authentication endpoints
  auth: {
    login: async (credentials) => {
      try {
        return await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
      } catch (error) {
        throw new Error(error.message || 'Login failed');
      }
    },
    register: async (userData) => {
      try {
        return await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
      } catch (error) {
        throw new Error(error.message || 'Registration failed');
      }
    },
    logout: async () => {
      try {
        return await apiRequest('/auth/logout', { method: 'POST' });
      } catch (error) {
        return { success: true }; // Always succeed locally
      }
    },
    getSession: async () => {
      try {
        return await apiRequest('/auth/session');
      } catch (error) {
        return { authenticated: false };
      }
    },
    getProfile: async () => {
      try {
        const result = await apiRequest('/auth/profile');
        return result.user || result;
      } catch (error) {
        throw new Error('Failed to load profile');
      }
    },
    updateProfile: async (data) => {
      try {
        const result = await apiRequest('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        return result.user || result;
      } catch (error) {
        throw new Error('Failed to update profile');
      }
    },
  },

  // User management endpoints
  users: {
    getAll: () => apiRequest('/users/'),
    getById: (id) => apiRequest(`/users/${id}`),
    update: (id, data) => apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },

  // Product endpoints
  products: {
    getAll: async (params) => {
      try {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        const products = await apiRequest(`/products/${query}`);
        return Array.isArray(products) ? products.map(enhanceProduct) : [];
      } catch (error) {
        console.warn('Products getAll failed:', error.message);
        return [];
      }
    },
    getById: async (id) => {
      try {
        const product = await apiRequest(`/products/${id}`);
        return enhanceProduct(product);
      } catch (error) {
        throw new Error('Product not found');
      }
    },
    create: async (data) => {
      try {
        return await apiRequest('/products/', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (error) {
        throw new Error(error.message || 'Failed to create product');
      }
    },
    update: async (id, data) => {
      try {
        return await apiRequest(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } catch (error) {
        throw new Error('Failed to update product');
      }
    },
    delete: async (id) => {
      try {
        return await apiRequest(`/products/${id}`, { method: 'DELETE' });
      } catch (error) {
        throw new Error('Failed to delete product');
      }
    },
  },

  // Category endpoints
  categories: {
    getAll: async () => {
      try {
        return await apiRequest('/categories/')
      } catch (error) {
        console.warn('Categories failed:', error.message)
        return []
      }
    },
    getById: (id) => apiRequest(`/categories/${id}`),
    create: (data) => apiRequest('/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
    
    // Subcategory endpoints
    subcategories: {
      getAll: async () => {
        try {
          return await apiRequest('/categories/subcategories/')
        } catch (error) {
          console.warn('Subcategories failed:', error.message)
          return []
        }
      },
      getById: (id) => apiRequest(`/categories/subcategories/${id}`),
      create: (data) => apiRequest('/categories/subcategories/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      update: (id, data) => apiRequest(`/categories/subcategories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
      delete: (id) => apiRequest(`/categories/subcategories/${id}`, { method: 'DELETE' }),
    }
  },

  // Cart endpoints
  cart: {
    get: async () => {
      try {
        const result = await apiRequest('/cart/');
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.warn('Cart get failed:', error.message);
        return [];
      }
    },
    add: async (productId, quantity = 1) => {
      try {
        return await apiRequest('/cart/', {
          method: 'POST',
          body: JSON.stringify({ product_id: productId, quantity }),
        });
      } catch (error) {
        throw new Error(error.message || 'Failed to add to cart');
      }
    },
    update: async (itemId, quantity) => {
      try {
        return await apiRequest(`/cart/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify({ quantity }),
        });
      } catch (error) {
        throw new Error('Failed to update cart item');
      }
    },
    remove: async (itemId) => {
      try {
        return await apiRequest(`/cart/${itemId}`, { method: 'DELETE' });
      } catch (error) {
        throw new Error('Failed to remove cart item');
      }
    },
    clear: async () => {
      try {
        return await apiRequest('/cart/clear', { method: 'DELETE' });
      } catch (error) {
        throw new Error('Failed to clear cart');
      }
    },
  },

  // Order endpoints
  orders: {
    getAll: async () => {
      try {
        const orders = await apiRequest('/orders/');
        return Array.isArray(orders) ? orders : [];
      } catch (error) {
        console.warn('Orders failed:', error.message);
        return [];
      }
    },
    getById: async (id) => {
      try {
        return await apiRequest(`/orders/${id}`);
      } catch (error) {
        throw new Error('Order not found');
      }
    },
    create: async (orderData) => {
      try {
        return await apiRequest('/orders/', {
          method: 'POST',
          body: JSON.stringify(orderData),
        });
      } catch (error) {
        throw new Error(error.message || 'Failed to create order');
      }
    },
    updateStatus: async (id, status) => {
      try {
        return await apiRequest(`/orders/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });
      } catch (error) {
        throw new Error('Failed to update order status');
      }
    },
  },

  // Review endpoints
  reviews: {
    getByProduct: (productId) => apiRequest(`/reviews/product/${productId}`),
    create: (data) => apiRequest('/reviews/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => apiRequest(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => apiRequest(`/reviews/${id}`, { method: 'DELETE' }),
  },

  // Message endpoints
  messages: {
    getConversations: async () => {
      try {
        return await apiRequest('/messages/conversations')
      } catch (error) {
        console.warn('Messages failed:', error.message)
        return []
      }
    },
    getMessages: (userId) => apiRequest(`/messages/${userId}`),
    send: (receiverId, content) => apiRequest('/messages/', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, message: content }),
    }),
    sendWithAttachment: (receiverId, message, file) => {
      const formData = new FormData()
      formData.append('receiver_id', receiverId)
      if (message) formData.append('message', message)
      if (file) formData.append('attachment', file)
      
      return apiRequest('/messages/', {
        method: 'POST',
        body: formData,
      })
    },
    updateStatus: (messageId, status) => apiRequest(`/messages/${messageId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  },

  // Favorite endpoints
  favorites: {
    getAll: async () => {
      try {
        return await apiRequest('/favorites/')
      } catch (error) {
        console.warn('Favorites failed:', error.message)
        return []
      }
    },
    add: (productId) => apiRequest('/favorites/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    }),
    remove: (productId) => apiRequest(`/favorites/${productId}`, { method: 'DELETE' }),
  },

  // Follow endpoints
  follows: {
    follow: (artisanId) => apiRequest('/follows/', {
      method: 'POST',
      body: JSON.stringify({ artisan_id: artisanId }),
    }),
    unfollow: (artisanId) => apiRequest(`/follows/${artisanId}`, { method: 'DELETE' }),
    getFollowing: () => apiRequest('/follows/following'),
    getFollowers: () => apiRequest('/follows/followers'),
  },

  // Notification endpoints
  notifications: {
    getAll: () => apiRequest('/notifications/'),
    markAsRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
    markMessagesAsDelivered: async (messageIds) => {
      try {
        await Promise.all(
          messageIds.map(id => 
            apiRequest(`/messages/${id}/status`, {
              method: 'PUT',
              body: JSON.stringify({ status: 'delivered' })
            })
          )
        )
      } catch (error) {
        console.warn('Failed to mark messages as delivered:', error.message)
      }
    },
    markAllAsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),
  },

  // Artisan endpoints
  artisan: {
    getProfile: async (id) => {
      try {
        return await apiRequest(`/artisan/${id}`);
      } catch (error) {
        throw new Error('Artisan profile not found');
      }
    },
    getProducts: async (id) => {
      try {
        const products = await apiRequest(`/artisan/${id}/products`);
        return Array.isArray(products) ? products : [];
      } catch (error) {
        console.warn('Artisan products failed:', error.message);
        return [];
      }
    },
    getDashboard: async () => {
      try {
        return await apiRequest('/artisan/dashboard');
      } catch (error) {
        console.warn('Artisan dashboard failed:', error.message);
        return { 
          stats: { total_products: 0, total_orders: 0, total_revenue: 0 },
          products: [],
          orders: []
        };
      }
    },
    getOrders: async () => {
      try {
        const orders = await apiRequest('/artisan/orders');
        return Array.isArray(orders) ? orders : [];
      } catch (error) {
        console.warn('Artisan orders failed:', error.message);
        return [];
      }
    },
    getMessages: async () => {
      try {
        const messages = await apiRequest('/artisan/messages');
        return Array.isArray(messages) ? messages : [];
      } catch (error) {
        console.warn('Artisan messages failed:', error.message);
        return [];
      }
    },
  },

  // User profile endpoints
  profile: {
    get: async () => {
      try {
        const response = await apiRequest('/auth/profile')
        // Backend returns { user: { ... } }, extract the user data
        return response.user || { full_name: '', description: '', location: '', phone: '', profile_picture_url: '' }
      } catch (error) {
        console.warn('Profile get failed:', error.message)
        return { full_name: '', description: '', location: '', phone: '', profile_picture_url: '' }
      }
    },
    update: async (data) => {
      const response = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      // Backend returns { user: { ... } }, extract the user data
      return response.user || response
    },
    uploadImage: async (file) => {
      const { uploadToCloudinary } = await import('./cloudinary');
      const url = await uploadToCloudinary(file);
      return { url };
    },
  },

  // Payment endpoints
  payments: {
    getAll: async () => {
      try {
        return await apiRequest('/payments/')
      } catch (error) {
        console.warn('Payments failed:', error.message)
        return []
      }
    },
    create: (data) => apiRequest('/payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getById: (id) => apiRequest(`/payments/${id}`),
    initiate: (data) => apiRequest('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getStatus: (id) => apiRequest(`/payments/status/${id}`),
    mpesa: {
      stkPush: (data) => apiRequest('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    },
  },

  // Upload endpoints
  upload: {
    image: async (file) => {
      // Use Cloudinary directly for better performance
      const { uploadToCloudinary } = await import('./cloudinary');
      return uploadToCloudinary(file);
    },
  },
};
