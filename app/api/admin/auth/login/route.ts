import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { adminLoginSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = adminLoginSchema.parse(body)

    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    })

    if (!admin) {
      return errorResponse('Invalid credentials', 401)
    }

    // Verify password
    const isValidPassword = await AuthService.comparePassword(password, admin.password)
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401)
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: admin.id,
      email: admin.email,
      role: 'admin',
      name: admin.name,
    })

    return successResponse({
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    }, 'Login successful')

  } catch (error) {
    return errorResponse(error as Error)
  }
}
