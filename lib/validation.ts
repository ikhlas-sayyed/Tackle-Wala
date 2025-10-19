import { z } from 'zod'

// Admin schemas
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const adminCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().default('admin'),
})

// Customer schemas
export const customerRegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const customerLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// Product schemas
export const productCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  category: z.string().optional(),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    displayOrder: z.number().int().default(0),
  })).optional(),
variants: z.array(z.object({
  size: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  price: z.number().positive('Variant price must be positive'),
  stock: z.number().int().min(0, 'Variant stock cannot be negative').default(0),
})).optional(),

})

export const productUpdateSchema = productCreateSchema.partial()

// Banner schemas
export const bannerCreateSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  imageUrl: z.string().min(1, 'Image URL is required'),
  linkUrl: z.string().optional(),
  displayOrder: z.number().int().default(0).optional(),
  isActive: z.boolean().default(true).optional(),
})

export const bannerUpdateSchema = bannerCreateSchema.partial()

// Address schemas
export const addressCreateSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().default(false),
})

export const addressUpdateSchema = addressCreateSchema.partial()

// Order schemas
export const orderItemSchema = z.object({
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
})

export const orderCreateSchema = z.object({
  customerId: z.string().uuid().optional(),
  addressId: z.string().uuid().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
})

export const orderUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
})

// Payment schemas
export const paymentInitiateSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  amount: z.number().positive('Amount must be positive'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email format'),
  customerPhone: z.string().min(1, 'Phone number is required'),
})


export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

export const productFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).merge(paginationSchema)

