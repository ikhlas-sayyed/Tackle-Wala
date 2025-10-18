import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { customerLoginSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = customerLoginSchema.parse(body)

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { email },
    })

    if (!customer || !customer.authUserId) {
      return errorResponse('Invalid credentials', 401)
    }

    // Verify password (stored in authUserId field)
    const isValidPassword = await AuthService.comparePassword(password, customer.authUserId)
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401)
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: customer.id,
      email: customer.email || '',
      role: 'customer',
      name: customer.name,
    })

    return successResponse({
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      token,
    }, 'Login successful')

  } catch (error) {
    return errorResponse(error as Error)
  }
}
