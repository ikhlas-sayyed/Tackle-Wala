import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { customerRegisterSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password } = customerRegisterSchema.parse(body)

    // Check if customer already exists
    if (email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email },
      })

      if (existingCustomer) {
        return errorResponse('Customer with this email already exists', 400)
      }
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password)

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        authUserId: hashedPassword, // Store hashed password in authUserId field for now
      },
    })

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
    }, 'Registration successful', 201)

  } catch (error) {
    return errorResponse(error as Error)
  }
}
