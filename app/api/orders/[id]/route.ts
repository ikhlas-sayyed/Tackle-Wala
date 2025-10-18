import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'customer') {
      return unauthorizedResponse()
    }

    const order = await prisma.order.findFirst({
      where: { 
        id: params.id,
        customerId: user.userId,
      },
      include: {
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: {
                  take: 1,
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
            variant: {
              select: {
                id: true,
                size: true,
                color: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!order) {
      return notFoundResponse('Order not found')
    }

    return successResponse(order)

  } catch (error) {
    return errorResponse(error as Error)
  }
}
