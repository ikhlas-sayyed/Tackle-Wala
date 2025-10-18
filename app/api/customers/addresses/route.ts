import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/auth'
import { addressCreateSchema } from '@/lib/validation'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const user = AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'customer') {
      return unauthorizedResponse()
    }

    const addresses = await prisma.address.findMany({
      where: { customerId: user.userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return successResponse(addresses)

  } catch (error) {
    return errorResponse(error as Error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = AuthService.getUserFromRequest(request);

    const body = await request.json();
    const validatedData = addressCreateSchema.parse(body);
    console.log(validatedData);

    const addressData: any = {
      fullName: body.fullName,
      phone: body.phone,
      line1: body.line1,
      line2: body.line2,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
      isDefault: body.isDefault ?? false,
    };

    // Only set customerId if user is logged in
    if (user && user.userId) {
      addressData.customerId = user.userId;

      // If this is set as default, remove default from other addresses
      if (validatedData.isDefault) {
        await prisma.address.updateMany({
          where: { customerId: user.userId },
          data: { isDefault: false },
        });
      }
    }

    const address = await prisma.address.create({
      data: addressData,
    });

    return successResponse(address, 'Address created successfully', 201);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

