import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { addressUpdateSchema } from '@/lib/validation'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'customer') {
      return unauthorizedResponse()
    }

    const address = await prisma.address.findFirst({
      where: { 
        id: params.id,
        customerId: user.userId,
      },
    })

    if (!address) {
      return notFoundResponse('Address not found')
    }

    return successResponse(address)

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
    if (!user || user.role !== 'customer') {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const validatedData = addressUpdateSchema.parse(body)

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { 
        id: params.id,
        customerId: user.userId,
      },
    })

    if (!existingAddress) {
      return notFoundResponse('Address not found')
    }

    // If this is set as default, remove default from other addresses
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { 
          customerId: user.userId,
          id: { not: params.id },
        },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.update({
      where: { id: params.id },
      data: validatedData,
    })

    return successResponse(address, 'Address updated successfully')

  } catch (error) {
    return errorResponse( error as Error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'customer') {
      return unauthorizedResponse()
    }

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { 
        id: params.id,
        customerId: user.userId,
      },
    })

    if (!existingAddress) {
      return notFoundResponse('Address not found')
    }

    await prisma.address.delete({
      where: { id: params.id },
    })

    return successResponse(null, 'Address deleted successfully')

  } catch (error) {
    return errorResponse(error as Error)
  }
}
