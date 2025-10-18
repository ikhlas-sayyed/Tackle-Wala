import React, { useEffect, useState } from 'react';
import { apiClient, Order } from '@/lib/api-client';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null); // Address
  const [openItemsAccordion, setOpenItemsAccordion] = useState<string | null>(null); // Items

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    const params: any = {
      page: 1,
      limit: 10,
    };

    if (selectedStatus && selectedStatus !== 'all') {
      params.status = selectedStatus;
    }

    try {
      const res = await apiClient.getAdminOrders(params);
      if (res.success && res.data) setOrders(res.data.orders);
      else console.error('Failed to load orders:', res.error);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const res = await apiClient.updateOrder(orderId, { status: newStatus });
    if (res.success) loadOrders();
  };

  const toggleAccordion = (orderId: string) => {
    setOpenAccordion(openAccordion === orderId ? null : orderId);
  };

  const toggleItemsAccordion = (orderId: string) => {
    setOpenItemsAccordion(openItemsAccordion === orderId ? null : orderId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Orders</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {order.customer?.name || order.guestName || 'Guest'}
                      </div>
                      <div className="text-gray-500">{order.customer?.email || order.guestEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <button
                      className="text-blue-600 underline text-xs"
                      onClick={() => toggleItemsAccordion(order.id)}
                    >
                      {openItemsAccordion === order.id ? 'Hide Items' : `${order.items?.length || 0} items`}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{order.total}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${
                        order.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : order.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-blue-600 underline text-xs"
                      onClick={() => toggleAccordion(order.id)}
                    >
                      {openAccordion === order.id ? 'Hide' : 'Show'} Address
                    </button>
                  </td>
                </tr>

                {/* Items Accordion */}
                {openItemsAccordion === order.id && (
                  <tr>
                    <td colSpan={8} className="bg-gray-50 px-6 py-4">
                      {order.items?.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              {item.product?.name}
                              {item.variant
                                ? ` (${item.variant.size || ''}${item.variant.color ? ', ' + item.variant.color : ''})`
                                : ''}
                              x {item.quantity}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-gray-500">No items found</div>
                      )}
                    </td>
                  </tr>
                )}

                {/* Address Accordion */}
                {openAccordion === order.id && (
                  <tr>
                    <td colSpan={8} className="bg-gray-50 px-6 py-4">
                      {order.address ? (
                        <div>
                          <div className="font-semibold mb-1">Shipping Address:</div>
                          <div>{order.address.fullName}</div>
                          <div>
                            {order.address.line1}
                            {order.address.line2 ? `, ${order.address.line2}` : ''}
                          </div>
                          <div>
                            {order.address.city}, {order.address.state} - {order.address.postalCode}
                          </div>
                          <div>{order.address.country}</div>
                          <div>Phone: {order.address.phone}</div>
                        </div>
                      ) : (
                        <div className="text-gray-500">No address found</div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">No orders found</div>
        )}
      </div>
    </div>
  );
}
