import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { productUpdateSchema } from '@/lib/validation'
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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: true,
        _count: {
          select: { orderItems: true },
        },
      },
    })

    if (!product) {
      return notFoundResponse('Product not found')
    }

    return successResponse(product)

  } catch (error) {
    return errorResponse( error as Error)
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
    const validatedData = productUpdateSchema.parse(body)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return notFoundResponse('Product not found')
    }

    // Update product with transaction
    const product = await prisma.$transaction(async (tx) => {
      // Update main product data
      const updatedProduct = await tx.product.update({
        where: { id: params.id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          price: validatedData.price,
          stock: validatedData.stock,
          category: validatedData.category,
        },
      })

      // Update images if provided
      if (validatedData.images) {
        await tx.productImage.deleteMany({
          where: { productId: params.id },
        })
        
        await tx.productImage.createMany({
          data: validatedData.images.map((img, index) => ({
            productId: params.id,
            url: img.url,
            displayOrder: img.displayOrder || index,
          })),
        })
      }

      // Update variants if provided
      if (validatedData.variants) {
        await tx.productVariant.deleteMany({
          where: { productId: params.id },
        })
        
        await tx.productVariant.createMany({
          data: validatedData.variants.map((variant) => ({
            productId: params.id,
            size: variant.size,
            color: variant.color,
            price: variant.price,
            stock: variant.stock || 0,
          })),
        })
      }

      return updatedProduct
    })

    // Fetch updated product with relations
    const updatedProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: true,
      },
    })

    return successResponse(updatedProduct, 'Product updated successfully')

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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return notFoundResponse('Product not found')
    }

    // Delete product (cascading deletes will handle images and variants)
    await prisma.product.delete({
      where: { id: params.id },
    })

    return successResponse(null, 'Product deleted successfully')

  } catch (error) {
    return errorResponse(error as Error)
  }
}
