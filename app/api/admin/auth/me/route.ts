import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const user = AuthService.getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return unauthorizedResponse()
    }

    // Get fresh admin data
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
      return errorResponse('Admin not found', 404)
    }

    return successResponse(admin)

  } catch (error) {
    return errorResponse(error as Error)
  }
}
