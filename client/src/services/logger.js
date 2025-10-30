// Frontend logging for user journey tracking
export const logger = {
  login: (user) => {
    console.log(`[FRONTEND_LOGIN] User logged in: ${user.email} (${user.role})`);
    console.log(`[FRONTEND_LOGIN] User ID: ${user.id}`);
  },
  
  productList: (count) => {
    console.log(`[FRONTEND_PRODUCTS] Loaded ${count} products in explore page`);
  },
  
  productClick: (product) => {
    console.log(`[FRONTEND_PRODUCT_CLICK] User clicked on product: ${product.title} (ID: ${product.id})`);
    console.log(`[FRONTEND_PRODUCT_CLICK] Product price: ${product.price} ${product.currency}`);
  },
  
  addToCart: (product, quantity) => {
    console.log(`[FRONTEND_ADD_CART] User adding to cart: ${product.title} x${quantity}`);
    console.log(`[FRONTEND_ADD_CART] Product ID: ${product.id}, Total: ${product.price * quantity}`);
  },
  
  buyNow: (product, quantity) => {
    console.log(`[FRONTEND_BUY_NOW] User buying now: ${product.title} x${quantity}`);
    console.log(`[FRONTEND_BUY_NOW] Product ID: ${product.id}, Total: ${product.price * quantity}`);
  }
};