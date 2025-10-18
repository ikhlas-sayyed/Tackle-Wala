import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { AuthService } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const user = AuthService.getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return unauthorizedResponse();
    }

    // Total Products
    const totalProducts = await prisma.product.count();

    // Total Orders
    const totalOrders = await prisma.order.count();

    // Total Customers
    const totalCustomers = await prisma.customer.count();

    // Total Revenue (only from CONFIRMED orders)
    const revenueOrders = await prisma.order.findMany({
      where: { status: 'CONFIRMED' },
      select: { total: true },
    });
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + Number(order.total), 0);

    // Recent Orders (latest 5 orders)
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return successResponse({
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}
