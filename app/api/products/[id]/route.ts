import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: {
          where: { stock: { gt: 0 } }, // Only show variants in stock
          orderBy: [
            { size: 'asc' },
            { color: 'asc' },
          ],
        },
      },
    })

    if (!product) {
      return notFoundResponse('Product not found')
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
        stock: { gt: 0 },
      },
      take: 4,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
      },
    })

    return successResponse({
      product,
      relatedProducts,
    })

  } catch (error) {
    return errorResponse(error as Error)
  }
}
