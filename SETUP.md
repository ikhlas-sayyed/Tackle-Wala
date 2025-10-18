# ShopHub E-Commerce Platform Setup Guide

## Overview

This is a complete e-commerce platform with:
- Customer-facing storefront
- Shopify-style admin dashboard
- Supabase backend with PostgreSQL
- Paytm payment integration
- Full product, order, and customer management

## Quick Start

### 1. Database Setup

The database schema is ready to be applied. You need to execute the migration SQL on your Supabase database:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the schema creation SQL (provided below)

### 2. Enable Supabase Authentication

1. In Supabase Dashboard, go to Authentication > Settings
2. Enable Email provider
3. Disable email confirmation (or configure as needed)

### 3. Deploy Edge Functions

Deploy the payment processing functions:

```bash
supabase functions deploy process-payment
supabase functions deploy payment-callback
```

### 4. Configure Paytm (Optional)

Set environment variables in Supabase:
- `PAYTM_MERCHANT_ID`
- `PAYTM_MERCHANT_KEY`

### 5. Run the Application

```bash
npm install
npm run dev
```

## Features

### Storefront
- Browse products with search and filters
- Product detail pages with variants (size, color)
- Shopping cart with persistent storage
- User authentication (signup/login)
- Checkout with address management
- Paytm payment integration

### Admin Dashboard
Access at `/admin/login`

**Demo Credentials:**
- Email: admin@shophub.com
- Password: admin123

**Features:**
- Dashboard with analytics
- Product management (add, edit, delete)
- Multiple product images
- Product variants (size, color, price, stock)
- Order management with status updates
- Banner management for homepage
- Customer management
- View order history and revenue

## Database Schema

### Tables:
- **products**: Product catalog with pricing and inventory
- **product_images**: Multiple images per product
- **product_variants**: Size/color variations with individual pricing
- **customers**: Customer accounts linked to Supabase Auth
- **addresses**: Customer shipping addresses
- **orders**: Order records with status tracking
- **order_items**: Individual items in each order
- **banners**: Homepage promotional banners
- **admin_users**: Admin user accounts

## Default Admin Access

The admin panel uses simple authentication with hardcoded credentials for demo purposes.

For production:
1. Replace with proper authentication
2. Use the `admin_users` table
3. Implement role-based access control

## Payment Integration

The Paytm integration is set up with demo credentials. For production:

1. Register with Paytm
2. Get production credentials
3. Update environment variables
4. Change gateway URL from staging to production

## Seed Data

You can add sample products through the admin panel or run SQL inserts directly.

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Payment**: Paytm Payment Gateway
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/          # Shared components
│   ├── admin/          # Admin-specific components
│   ├── Navbar.tsx
│   └── Footer.tsx
├── pages/
│   ├── storefront/     # Customer pages
│   └── admin/          # Admin dashboard pages
├── store/              # Zustand state management
├── lib/                # Supabase client & utilities
└── App.tsx             # Main routing

supabase/
└── functions/          # Edge functions for payment
```

## Security Notes

1. All tables have Row Level Security (RLS) enabled
2. Customer data is protected by authentication checks
3. Admin functions should be further secured for production
4. Never commit API keys or secrets to version control

## Support

For issues or questions, refer to the documentation:
- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com)
- [Paytm Payment Gateway](https://developer.paytm.com)