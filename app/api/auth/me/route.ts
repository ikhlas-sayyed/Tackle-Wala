import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const user = AuthService.getUserFromRequest(request)
    
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role === 'admin') {
      const admin = await prisma.adminUser.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })

      if (!admin) {
        return errorResponse('User not found', 404)
      }

      return successResponse({ ...admin, role: 'admin' })
    } else {
      const customer = await prisma.customer.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      })

      if (!customer) {
        return errorResponse('User not found', 404)
      }

      return successResponse({ ...customer, role: 'customer' })
    }

  } catch (error) {
    return errorResponse(error as Error)
  }
}
