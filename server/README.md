# SokoDigital Backend

Production-ready Flask API for SokoDigital marketplace.

## Production Deployment

### Environment Variables
```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET_KEY=your-jwt-secret
SECRET_KEY=your-flask-secret
FLASK_ENV=production
SENTRY_DSN=your-sentry-dsn (optional)
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Render Deployment
1. Connect GitHub repository to Render
2. Create Web Service with:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn production_app:app`
   - Environment: Python 3.11
3. Add environment variables
4. Create PostgreSQL database and set DATABASE_URL

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/session` - Get current user

### Products
- `GET /products/` - List products (with search/filter)
- `POST /products/` - Create product (artisan only)
- `GET /products/<id>` - Get product details
- `PUT /products/<id>` - Update product (owner only)

### Cart
- `GET /cart/` - Get user cart
- `POST /cart/` - Add to cart

### Reviews
- `POST /reviews/` - Create review
- `GET /reviews/product/<id>` - Get product reviews

### Health Check
- `GET /health` - Service health status

## Security Features
- JWT authentication
- Rate limiting
- Input validation
- Security headers
- CORS protection
- Error monitoring with Sentry

## Production Features
- JWT authentication with bcrypt
- Input validation with Marshmallow
- Rate limiting and security headers
- PostgreSQL with SQLAlchemy
- Error monitoring with Sentry
- Gunicorn WSGI server