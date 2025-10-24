interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: any[]
  message?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'customer'
  phone?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  category?: string
  createdAt: string
  updatedAt: string
  images: ProductImage[]
  variants: ProductVariant[]
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  displayOrder: number
}

export interface ProductVariant {
  id: string
  productId: string
  size?: string
  color?: string
  price: number
  stock: number
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
  displayOrder: number
  isActive: boolean
  createdAt: string
}

export interface Address {
  id: string
  customerId: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface Order {
  id: string
  customerId?: string
  addressId?: string
  status: string
  total: number
  paymentStatus: string
  paymentId?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  customer?: User
  address?: Address
}

export interface OrderItem {
  id: string
  orderId: string
  productId?: string
  variantId?: string
  quantity: number
  price: number
  product?: Product
  variant?: ProductVariant
}

class ApiClient {
  private baseUrl = '/api'
  private token: string | null = null

  constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  getToken() {
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }


    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: 'Network error occurred',
      }
    }
  }

  // In your ApiClient class

  // Dashboard
  async getAdminDashboard() {
    return this.request<{
      stats: {
        totalProducts: number;
        totalOrders: number;
        totalCustomers: number;
        totalRevenue: number;
      };
      recentOrders: {
        id: string;
        customerId?: string;
        status: string;
        total: number;
        createdAt: string;
        updatedAt: string;
        customer?: {
          id: string;
          name: string;
          email?: string;
          phone?: string;
        };
      }[];
    }>('/admin/info');
  }


  // Authentication
  async adminLogin(email: string, password: string) {
    return this.request<{ user: User; token: string }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async customerLogin(email: string, password: string) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async customerRegister(data: {
    name: string
    email: string
    password: string
    phone?: string
  }) {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me')
  }

  // Products (Public)
  async getProducts(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    sortOrder?: string
  }) {
    const queryString = params ? new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value.toString()
        }
        return acc
      }, {} as Record<string, string>)
    ).toString() : ''

    return this.request<{
      products: Product[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
      filters: {
        categories: string[]
      }
    }>(`/products${queryString ? `?${queryString}` : ''}`)
  }

  async getProduct(id: string) {
    return this.request<{
      success: boolean
      data: {
        product: Product
        relatedProducts: Product[]
      }
    }>(`/products/${id}`)
  }

  // Admin Products
  async getAdminProducts(params?: { page?: number; limit?: number }) {
    const queryString = params ? new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value.toString()
        }
        return acc
      }, {} as Record<string, string>)
    ).toString() : ''

    return this.request<{
      products: Product[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>(`/admin/products${queryString ? `?${queryString}` : ''}`)
  }

  async createProduct(data: any) {
    return this.request<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProduct(id: string, data: any) {
    return this.request<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string) {
    return this.request<null>(`/admin/products/${id}`, {
      method: 'DELETE',
    })
  }

  // Banners
  async getBanners() {
    return this.request<Banner[]>('/banners')
  }

  async getAdminBanners() {
    return this.request<Banner[]>('/admin/banners')
  }

  async createBanner(data: any) {
    return this.request<Banner>('/admin/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBanner(id: string, data: any) {
    return this.request<Banner>(`/admin/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBanner(id: string) {
    return this.request<null>(`/admin/banners/${id}`, {
      method: 'DELETE',
    })
  }

  // Addresses
  async getAddresses() {
    return this.request<Address[]>('/customers/addresses')
  }

  async createAddress(data: any) {
    return this.request<Address>('/customers/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAddress(id: string, data: any) {
    return this.request<Address>(`/customers/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteAddress(id: string) {
    return this.request<null>(`/customers/addresses/${id}`, {
      method: 'DELETE',
    })
  }

  // Orders
  async createOrder(data: any) {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createGuestOrder(data: any) {
    return this.request<Order>('/orders/guest', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getOrders() {
    return this.request<Order[]>('/orders')
  }

  async getOrder(id: string) {
    return this.request<Order>(`/orders/${id}`)
  }

  // Admin Orders
  async getAdminOrders(params?: {
    page?: number
    limit?: number
    status?: string
    paymentStatus?: string
  }) {
    const queryString = params ? new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value.toString()
        }
        return acc
      }, {} as Record<string, string>)
    ).toString() : ''

    return this.request<{
      orders: Order[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>(`/admin/orders${queryString ? `?${queryString}` : ''}`)
  }

  async updateOrder(id: string, data: any) {
    return this.request<Order>(`/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Admin Customers
  async getAdminCustomers(params?: {
    page?: number
    limit?: number
    search?: string
  }) {
    const queryString = params ? new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value.toString()
        }
        return acc
      }, {} as Record<string, string>)
    ).toString() : ''

    return this.request<{
      customers: User[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>(`/admin/customers${queryString ? `?${queryString}` : ''}`)
  }

  async uploadImage(file: File) {
    // Step 1: Request a signed URL from your backend
    const res = await this.request<{ url: string; key: string }>('/upload', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, fileType: file.type }),
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('Upload image response:', res);

    const { url, key } = await res;
    console.log('Signed URL:', url, 'Key:', key);

    // Step 2: Upload file directly to S3 using the signed URL
    const res1 = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    console.log('S3 upload response:', res1);

    if (!res1.ok) throw new Error("Upload failed");
  console.log("File uploaded successfully");

    // Step 3: Return the public URL
    return { url: `https://${process.env.NEXT_PUBLIC_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}` };
  }


  async getAdminCustomer(id: string) {
    return this.request<User>(`/admin/customers/${id}`)
  }

  // Payment
  async initiatePayment(data: {
    orderId: string
    amount: number
    customerName: string
    customerEmail: string
    customerPhone: string
  }) {
    return this.request<{
      orderId: string
      razorOrder: {
        id: string
      }
    }>('/payment/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPaymentStatus(orderId: string) {
    return this.request<{
      id: string
      status: string
      paymentStatus: string
      paymentId?: string
      total: number
      createdAt: string
      updatedAt: string
    }>(`/payment/status/${orderId}`)
  }
}

export const apiClient = new ApiClient()
