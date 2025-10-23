import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { productFilterSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, category, search, minPrice, maxPrice, sortBy, sortOrder } =
      productFilterSchema.parse({
        page: searchParams.get('page') ?? undefined,
        limit: searchParams.get('limit') ?? undefined,
        category: searchParams.get('category') ?? undefined,
        search: searchParams.get('search') ?? undefined,
        minPrice: searchParams.get('minPrice') ?? undefined,
        maxPrice: searchParams.get('maxPrice') ?? undefined,
        sortBy: searchParams.get('sortBy') ?? undefined,
        sortOrder: searchParams.get('sortOrder') ?? undefined,
      })


    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      stock: { gt: 0 }, // Only show products in stock
    }

    if (category) {
      where.category = { equals: category}
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    if (minPrice) where.price.gte = Number(minPrice)
    if (maxPrice) where.price.lte = Number(maxPrice)



    // Build orderBy clause
    const orderBy: any = {}
    const order: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc'
    if (sortBy === 'name') orderBy.name = order
    else if (sortBy === 'price') orderBy.price = order
    else orderBy.createdAt = order


    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: {
            orderBy: { displayOrder: 'asc' },
            take: 1, // Only first image for listing
          },
          variants: {
            select: {
              id: true,
              size: true,
              color: true,
              price: true,
              stock: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
      // Get available categories for filtering
      prisma.product.findMany({
        where: { stock: { gt: 0 } },
        select: { category: true },
        distinct: ['category'],
      }),
    ])

    const availableCategories = categories
      .map(p => p.category)
      .filter(Boolean)
      .sort()

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        categories: availableCategories,
      },
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return errorResponse(error as Error)
  }
}
