import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { bannerUpdateSchema } from '@/lib/validation'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return unauthorizedResponse()
    }

    const banner = await prisma.banner.findUnique({
      where: { id: params.id },
    })

    if (!banner) {
      return notFoundResponse('Banner not found')
    }

    return successResponse(banner)

  } catch (error) {
    return errorResponse(error as Error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const validatedData = bannerUpdateSchema.parse(body)

    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id: params.id },
    })

    if (!existingBanner) {
      return notFoundResponse('Banner not found')
    }

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: validatedData,
    })

    return successResponse(banner, 'Banner updated successfully')

  } catch (error) {
    return errorResponse(error as Error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return unauthorizedResponse()
    }

    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id: params.id },
    })

    if (!existingBanner) {
      return notFoundResponse('Banner not found')
    }

    await prisma.banner.delete({
      where: { id: params.id },
    })

    return successResponse(null, 'Banner deleted successfully')

  } catch (error) {
    return errorResponse( error as Error)
  }
}
