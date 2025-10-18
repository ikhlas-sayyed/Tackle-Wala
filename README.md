# E-Commerce Backend with Next.js API Routes

A complete e-commerce backend built with Next.js API routes, Prisma ORM, MySQL database, and Paytm payment gateway integration.

## 🚀 Features

### Admin Features
- **Authentication**: JWT-based admin login/logout
- **Product Management**: Full CRUD operations with images and variants
- **Banner Management**: Create and manage promotional banners
- **Order Management**: View and update order status
- **Customer Management**: View customer details and order history

### Customer Features
- **Authentication**: Customer registration and login
- **Address Management**: Add, update, delete shipping addresses
- **Order Placement**: Place orders as registered user or guest
- **Order History**: View past orders and status

### Shopping Features
- **Product Catalog**: Browse products with filtering and search
- **Product Variants**: Support for size, color, and other variants
- **Stock Management**: Real-time inventory tracking
- **Guest Checkout**: Allow purchases without registration

### Payment Integration
- **Paytm Gateway**: Complete payment flow with callbacks
- **Payment Verification**: Secure transaction verification
- **Stock Management**: Automatic stock updates based on payment status

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Zod schema validation
- **Payment**: Paytm payment gateway
- **Language**: TypeScript

## 📁 Project Structure

```
├── app/api/                    # Next.js API routes
│   ├── admin/                  # Admin-only endpoints
│   │   ├── auth/              # Admin authentication
│   │   ├── products/          # Product management
│   │   ├── banners/           # Banner management
│   │   ├── orders/            # Order management
│   │   └── customers/         # Customer management
│   ├── auth/                  # Customer authentication
│   ├── products/              # Public product endpoints
│   ├── banners/               # Public banner endpoints
│   ├── customers/             # Customer profile & addresses
│   ├── orders/                # Order management
│   └── payment/               # Payment processing
├── lib/                       # Utility libraries
│   ├── auth.ts               # Authentication utilities
│   ├── db.ts                 # Database connection
│   ├── paytm.ts              # Paytm integration
│   ├── response.ts           # API response helpers
│   └── validation.ts         # Zod validation schemas
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma         # Database schema
│   └── seed.ts              # Sample data seeding
└── middleware.ts            # Route protection middleware
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL database
- Paytm merchant account (for payments)

### Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/ecom1"

# JWT Secret (generate a strong secret)
JWT_SECRET="your-super-secret-jwt-key-here"

# Paytm Configuration
PAYTM_MID="your-paytm-merchant-id"
PAYTM_KEY="your-paytm-merchant-key"
PAYTM_WEBSITE="WEBSTAGING"  # Use "DEFAULT" for production
PAYTM_INDUSTRY_TYPE="Retail"
PAYTM_CHANNEL_ID="WEB"
PAYTM_CALLBACK_URL="http://localhost:3000/api/payment/callback"
```

3. **Set up the database**:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

4. **Start the development server**:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## 📚 API Documentation

### Authentication

#### Admin Login
```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@ecom.com",
  "password": "admin123"
}
```

#### Customer Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Customer Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Products

#### Get Products (Public)
```http
GET /api/products?page=1&limit=10&category=Electronics&search=headphones
```

#### Get Product Details (Public)
```http
GET /api/products/[productId]
```

#### Create Product (Admin)
```http
POST /api/admin/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "stock": 50,
  "category": "Electronics",
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "displayOrder": 0
    }
  ],
  "variants": [
    {
      "size": "M",
      "color": "Blue",
      "price": 99.99,
      "stock": 25
    }
  ]
}
```

### Orders

#### Create Order (Authenticated)
```http
POST /api/orders
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "addressId": "address-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "price": 99.99
    }
  ]
}
```

#### Create Guest Order
```http
POST /api/orders/guest
Content-Type: application/json

{
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 1,
      "price": 99.99
    }
  ]
}
```

### Payment

#### Initiate Payment
```http
POST /api/payment/initiate
Content-Type: application/json

{
  "orderId": "order-uuid",
  "amount": 99.99,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890"
}
```

## 🔒 Authentication & Authorization

- **JWT Tokens**: Used for authentication with 7-day expiry
- **Role-based Access**: Admin and customer roles with different permissions
- **Middleware Protection**: Automatic route protection based on user roles
- **Password Security**: bcrypt hashing with salt rounds of 12

## 💳 Payment Flow

1. **Order Creation**: Customer creates an order
2. **Payment Initiation**: Call `/api/payment/initiate` with order details
3. **Redirect to Paytm**: Customer is redirected to Paytm payment page
4. **Payment Processing**: Customer completes payment on Paytm
5. **Callback Verification**: Paytm sends callback to `/api/payment/callback`
6. **Order Update**: Order status and payment status are updated
7. **Stock Management**: Stock is adjusted based on payment result

## 🗄️ Database Schema

The application uses the following main entities:

- **AdminUser**: Admin accounts
- **Customer**: Customer accounts
- **Address**: Customer shipping addresses
- **Product**: Product catalog
- **ProductImage**: Product images
- **ProductVariant**: Product variants (size, color, etc.)
- **Banner**: Promotional banners
- **Order**: Customer orders
- **OrderItem**: Individual items in orders

## 🔧 Development

### Adding New API Endpoints

1. Create route file in `app/api/` directory
2. Add validation schema in `lib/validation.ts`
3. Update middleware if authentication is required
4. Add proper error handling using response helpers

### Database Changes

1. Update `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Update seed file if needed

## 🚀 Deployment

### Environment Setup
- Set `NODE_ENV=production`
- Use production database URL
- Set `PAYTM_WEBSITE="DEFAULT"` for production
- Use strong JWT secrets

### Database Migration
```bash
npm run db:push
npm run db:seed
```

## 🔐 Security Features

- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **Authentication**: JWT tokens with secure secrets
- **Password Hashing**: bcrypt with high salt rounds
- **CORS Protection**: Next.js built-in CORS handling
- **Rate Limiting**: Can be added with middleware

## 📝 Sample Data

After running the seed script, you'll have:

**Admin Account**:
- Email: `admin@ecom.com`
- Password: `admin123`

**Customer Account**:
- Email: `customer@example.com`
- Password: `customer123`

**Sample Products**:
- Electronics (headphones, smartwatch)
- Clothing (t-shirts)
- Food & Beverages (coffee)
- Sports & Fitness (yoga mat)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.