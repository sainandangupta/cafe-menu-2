import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService, CreateOrderInput } from '../services/orders';
import { OrderStatus } from '../types';
import { useSocket } from './useSocket';

export const useOrders = (cafeId: string | null, statuses?: OrderStatus[]) => {
  const queryClient = useQueryClient();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Connect to Socket.IO and join the cafe room
  const socket = useSocket({ cafeId, token });

  const query = useQuery({
    queryKey: ['orders', cafeId, statuses],
    queryFn: () => ordersService.getOrders(cafeId || '', statuses),
    enabled: !!cafeId,
    staleTime: 0, // Keep real-time fresh
  });

  useEffect(() => {
    if (!cafeId) return;

    // Handler for new orders — invalidate cache and play sound
    const handleNewOrder = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['orders', cafeId] });

      // Play sound alert for new orders if enabled
      const alertsEnabled = localStorage.getItem('sound_alerts') !== 'false';
      if (alertsEnabled) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav');
        audio.play().catch(() => {});
      }
    };

    // Handler for order status changes — invalidate cache
    const handleStatusChanged = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['orders', cafeId] });

      // Also invalidate the specific order detail if it's cached
      if (data?.order_id) {
        queryClient.invalidateQueries({ queryKey: ['order', data.order_id] });
      }
    };

    socket.on('newOrder', handleNewOrder);
    socket.on('orderStatusChanged', handleStatusChanged);

    return () => {
      socket.off('newOrder', handleNewOrder);
      socket.off('orderStatusChanged', handleStatusChanged);
    };
  }, [cafeId, socket, queryClient]);

  return query;
};

export const useOrderDetails = (orderId: string | undefined) => {
  const queryClient = useQueryClient();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const cafeId = typeof window !== 'undefined' ? localStorage.getItem('cafe_id') : null;

  // Connect to Socket.IO and join the cafe room (for owner detail view)
  const socket = useSocket({ cafeId, token });

  const query = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersService.getOrderById(orderId || ''),
    enabled: !!orderId,
    staleTime: 0,
  });

  useEffect(() => {
    if (!orderId) return;

    const handleStatusChanged = (data: any) => {
      if (data?.order_id === orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      }
    };

    socket.on('orderStatusChanged', handleStatusChanged);

    return () => {
      socket.off('orderStatusChanged', handleStatusChanged);
    };
  }, [orderId, socket, queryClient]);

  return query;
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (data: CreateOrderInput) => ordersService.createOrder(data),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersService.updateOrderStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders', data.cafe_id] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
    },
  });
};

export const useCallStaff = () => {
  return useMutation({
    mutationFn: (orderId: string) => ordersService.callStaff(orderId),
  });
};
