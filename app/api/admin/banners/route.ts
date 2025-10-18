import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { bannerCreateSchema } from '@/lib/validation'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return unauthorizedResponse()
    }

    const banners = await prisma.banner.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return successResponse(banners)

  } catch (error) {
    return errorResponse(error as Error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const validatedData = bannerCreateSchema.parse(body)

    const banner = await prisma.banner.create({
      data: validatedData,
    })

    return successResponse(banner, 'Banner created successfully', 201)

  } catch (error) {
    return errorResponse(error as Error)
  }
}
