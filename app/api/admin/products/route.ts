import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { productCreateSchema, paginationSchema } from '@/lib/validation'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            orderBy: { displayOrder: 'asc' },
          },
          variants: true,
          _count: {
            select: { orderItems: true },
          },
        },
        where: { deleted: false },
      }),
      prisma.product.count({
        where: { deleted: false },
      }),
    ])

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    return errorResponse(error as Error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return unauthorizedResponse()
    }

    const body = await request.json()
    try {
      const validatedData = productCreateSchema.parse(body)
      const slug = validatedData.name
  .split(' ')
  .join('-')
  .toLowerCase()
  .slice(0, 20); // limit to 20 chars
      const product = await prisma.product.create({
        data: {
          //make in limit 30 characters
          id: `${slug}-${Date.now().toString().slice(-4)}`,
          name: validatedData.name,
          description: validatedData.description,
          price: validatedData.price,
          stock: validatedData.stock || 0,
          category: validatedData.category,
          images: validatedData.images ? {
            create: validatedData.images.map((img, index) => ({
              url: img.url,
              displayOrder: img.displayOrder || index,
            })),
          } : undefined,
          variants: validatedData.variants ? {
            create: validatedData.variants.map((variant) => ({
              size: variant.size,
              color: variant.color,
              price: variant.price,
              stock: variant.stock || 0,
            })),
          } : undefined,
        },
        include: {
          images: {
            orderBy: { displayOrder: 'asc' },
          },
          variants: true,
        },
      })
      return successResponse(product, 'Product created successfully', 201)
    } catch (error) {
      return errorResponse(error as Error)
    }
  } catch (err:Error | any  ) {
    console.log('Validation failed:', err.format())
    return errorResponse(err as Error)
  }
}
