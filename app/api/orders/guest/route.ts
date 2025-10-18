import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { orderCreateSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = orderCreateSchema.parse(body)

    // Ensure guest information is provided for guest orders
    if (!validatedData.guestName || !validatedData.guestEmail) {
      return errorResponse('Guest name and email are required for guest orders', 400)
    }

    // Calculate total from items
    let total = 0
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
          total,
          guestName: validatedData.guestName,
          guestEmail: validatedData.guestEmail,
          guestPhone: validatedData.guestPhone,
          addressId: validatedData.addressId, // <-- Add this line
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

    return successResponse(order, 'Guest order created successfully', 201)

  } catch (error) {
    console.error(error); // <-- Add this line
    return errorResponse(error as Error)
  }
}

