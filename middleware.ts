import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from './lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/products') ||
    pathname.startsWith('/api/banners') ||
    pathname.startsWith('/api/payment/callback') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Admin routes protection
  if (pathname.startsWith('/api/admin')) {
    const user = AuthService.getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
  }

  // Customer protected routes
  if (
    pathname.startsWith('/api/customers/profile') ||
    pathname.startsWith('/api/customers/addresses') ||
    pathname.startsWith('/api/orders') && !pathname.startsWith('/api/orders/guest')
  ) {
    const user = AuthService.getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}
