import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { orderCreateSchema } from '@/lib/validation'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'customer') {
      return unauthorizedResponse()
    }

    const orders = await prisma.order.findMany({
      where: { customerId: user.userId },
      orderBy: { createdAt: 'desc' },
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
      },
    })

    return successResponse(orders)

  } catch (error) {
    return errorResponse(error as Error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = orderCreateSchema.parse(body)

    // Calculate total from items
    let total = 0
    //ignore tslint errors:disable-next-line:no-explicit-any
    const itemsData: typeof validatedData.items = []

    for (const item of validatedData.items) {
      let itemPrice = item.price

      // Verify product/variant exists and get actual price
      if (item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { price: true, stock: true },
        })

        if (!product) {
          return errorResponse(`Product ${item.productId} not found`, 400)
        }

        if (product.stock < item.quantity) {
          return errorResponse(`Insufficient stock for product ${item.productId}`, 400)
        }

        itemPrice = Number(product.price)
      }

      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          select: { price: true, stock: true },
        })

        if (!variant) {
          return errorResponse(`Product variant ${item.variantId} not found`, 400)
        }

        if (variant.stock < item.quantity) {
          return errorResponse(`Insufficient stock for variant ${item.variantId}`, 400)
        }

        itemPrice = Number(variant.price)
      }

      total += itemPrice * item.quantity
      itemsData.push({
        ...item,
        price: itemPrice,
      })
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerId: validatedData.customerId,
          addressId: validatedData.addressId,
          total,
          guestName: validatedData.guestName,
          guestEmail: validatedData.guestEmail,
          guestPhone: validatedData.guestPhone,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
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
          address: true,
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

      // Update stock for products and variants
      for (const item of validatedData.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          })
        }

        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
            },
          })
        }
      }

      return newOrder
    })

    return successResponse(order, 'Order created successfully', 201)

  } catch (error) {
    return errorResponse(error as Error)
  }
}
