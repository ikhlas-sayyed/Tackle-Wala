import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { RazorpayService } from '@/lib/razorpay'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, customerName, customerEmail, customerPhone } = body

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) return notFoundResponse('Order not found')
    if (Number(order.total) !== amount) return errorResponse('Order amount mismatch', 400)

    const razorOrder = await RazorpayService.createOrder({ orderId, amount })

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PENDING' },
    })

    return successResponse({
      orderId,
      razorOrder,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error(error)
    return errorResponse(error as string)
  }
}
