import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('123', 12)
  
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@tacklewala.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@tacklewala.com',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create sample products
  const products = [
    {
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
      price: 199.99,
      stock: 50,
      category: 'Electronics',
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500', displayOrder: 1 },
      ],
      variants: [
        { color: 'Black', price: 199.99, stock: 25 },
        { color: 'White', price: 199.99, stock: 25 },
      ],
    },
    {
      name: 'Smart Fitness Watch',
      description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring and GPS.',
      price: 299.99,
      stock: 30,
      category: 'Electronics',
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', displayOrder: 0 },
      ],
      variants: [
        { size: 'Small', color: 'Black', price: 299.99, stock: 10 },
        { size: 'Medium', color: 'Black', price: 299.99, stock: 10 },
        { size: 'Large', color: 'Black', price: 299.99, stock: 10 },
      ],
    },
    {
      name: 'Organic Cotton T-Shirt',
      description: 'Comfortable and sustainable organic cotton t-shirt available in multiple colors.',
      price: 29.99,
      stock: 100,
      category: 'Clothing',
      images: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', displayOrder: 0 },
      ],
      variants: [
        { size: 'S', color: 'White', price: 29.99, stock: 20 },
        { size: 'M', color: 'White', price: 29.99, stock: 20 },
        { size: 'L', color: 'White', price: 29.99, stock: 20 },
        { size: 'S', color: 'Black', price: 29.99, stock: 20 },
        { size: 'M', color: 'Black', price: 29.99, stock: 20 },
      ],
    },
    {
      name: 'Premium Coffee Beans',
      description: 'Single-origin premium coffee beans roasted to perfection for the ultimate coffee experience.',
      price: 24.99,
      stock: 75,
      category: 'Food & Beverages',
      images: [
        { url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', displayOrder: 0 },
      ],
    },
    {
      name: 'Yoga Mat Pro',
      description: 'Non-slip premium yoga mat perfect for all types of yoga and fitness exercises.',
      price: 49.99,
      stock: 40,
      category: 'Sports & Fitness',
      images: [
        { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500', displayOrder: 0 },
      ],
      variants: [
        { color: 'Purple', price: 49.99, stock: 20 },
        { color: 'Blue', price: 49.99, stock: 20 },
      ],
    },
  ]

  for (const productData of products) {
    const { images, variants, ...productInfo } = productData
    
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        images: images ? {
          create: images,
        } : undefined,
        variants: variants ? {
          create: variants,
        } : undefined,
      },
    })

    console.log('✅ Product created:', product.name)
  }

  // Create sample banners
  const banners = [
    {
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on selected items',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
      linkUrl: '/products?category=Electronics',
      displayOrder: 0,
      isActive: true,
    },
    {
      title: 'New Arrivals',
      subtitle: 'Check out our latest products',
      imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200',
      linkUrl: '/products',
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'Free Shipping',
      subtitle: 'Free shipping on orders over $100',
      imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200',
      displayOrder: 2,
      isActive: true,
    },
  ]

  for (const bannerData of banners) {
    const banner = await prisma.banner.create({
      data: bannerData,
    })

    console.log('✅ Banner created:', banner.title)
  }

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 12)
  
  const customer = await prisma.customer.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'customer@example.com',
      phone: '+1234567890',
      authUserId: customerPassword,
    },
  })

  console.log('✅ Sample customer created:', customer.email)

  // Create sample address for the customer
  const address = await prisma.address.create({
    data: {
      customerId: customer.id,
      fullName: 'John Doe',
      phone: '+1234567890',
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      isDefault: true,
    },
  })

  console.log('✅ Sample address created for customer')

  console.log('🎉 Database seed completed successfully!')
  console.log('\n📝 Login credentials:')
  console.log('Admin: admin@ecom.com / admin123')
  console.log('Customer: customer@example.com / customer123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
