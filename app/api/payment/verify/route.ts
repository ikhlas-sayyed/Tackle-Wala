import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { RazorpayService } from '@/lib/razorpay'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body

    const isValid = RazorpayService.verifySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })

    if (!isValid) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      })
      return errorResponse('Invalid signature verification', 400)
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paymentId: razorpay_payment_id,
      },
    })

    return successResponse({ order: updatedOrder, message: 'Payment successful' })
  } catch (error) {
    return errorResponse(error as unknown as string)
  }
}
