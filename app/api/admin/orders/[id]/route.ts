import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { orderUpdateSchema } from '@/lib/validation'
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
            variant: {
              select: {
                id: true,
                size: true,
                color: true,
                price: true,
              },
            },
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
    const validatedData = orderUpdateSchema.parse(body)

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!existingOrder) {
      return notFoundResponse('Order not found')
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
            variant: {
              select: {
                id: true,
                size: true,
                color: true,
                price: true,
              },
            },
          },
        },
      },
    })

    return successResponse(order, 'Order updated successfully')

  } catch (error) {
    return errorResponse(error as Error)
  }
}
