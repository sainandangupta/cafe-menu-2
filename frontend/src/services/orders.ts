import api from './api';
import { Order, OrderStatus } from '../types';

export interface CreateOrderInput {
  table_id: string;
  items: {
    dish_id: string;
    quantity: number;
    special_instructions?: string;
  }[];
  customer_notes?: string;
}

export const ordersService = {
  getOrders: async (cafeId: string, statusIn?: OrderStatus[]): Promise<Order[]> => {
    const params: Record<string, any> = { cafe_id: cafeId };
    if (statusIn && statusIn.length > 0) {
      params.status_in = statusIn.join(',');
    }
    const response = await api.get<Order[]>('/orders', { params });
    return response.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (data: CreateOrderInput): Promise<Order & { order_token: string }> => {
    const response = await api.post<Order & { order_token: string }>('/orders', data);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}`, { status });
    return response.data;
  },

  callStaff: async (orderId: string): Promise<void> => {
    await api.post(`/orders/${orderId}/call-staff`);
  },

  getOrderHistory: async (
    cafeId: string,
    params: { startDate?: string; endDate?: string } = {}
  ): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/history', {
      params: { cafe_id: cafeId, ...params },
    });
    return response.data;
  },
};
