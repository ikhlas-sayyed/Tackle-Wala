import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        paymentId: true,
        total: true,
        createdAt: true,
        updatedAt: true,
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
