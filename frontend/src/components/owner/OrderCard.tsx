import React from 'react';
import { Card, Button, Divider, Space, Tooltip } from 'antd';
import { ClockCircleOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { Order, OrderStatus } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { PriceDisplay } from '../shared/PriceDisplay';
import { formatTimeAgo } from '../../utils/formatters';
import { StatusUpdateButtons } from './StatusUpdateButtons';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onViewDetails: (order: Order) => void;
  onDelete?: (id: string) => void;
  isUpdating?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  onViewDetails,
  onDelete,
  isUpdating = false,
}) => {
  const itemsText = order.order_items
    ?.map((item) => `${item.quantity}x ${item.dish?.name || 'Dish'}`)
    .join(', ') || 'No items';

  return (
    <Card
      className="shadow-sm border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300"
      bodyStyle={{ padding: '16px' }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-extrabold text-lg text-slate-800">
            Table #{order.table?.table_number || 'N/A'}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold mt-0.5">
            <ClockCircleOutlined />
            <span>{formatTimeAgo(order.placed_at || order.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          {onDelete && (
            <Tooltip title="Cancel Order">
              <Button
                type="text"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(order.id)}
                size="small"
              />
            </Tooltip>
          )}
        </div>
      </div>

      <p className="text-gray-700 text-sm font-semibold mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100 line-clamp-2">
        {itemsText}
      </p>

      {order.customer_notes && (
        <div className="mb-3 text-xs bg-amber-50/50 border border-amber-200/50 p-2 rounded-lg text-amber-800">
          <span className="font-bold">Notes: </span>
          {order.customer_notes}
        </div>
      )}

      <div className="flex justify-between items-center text-sm mb-4">
        <span className="text-gray-400 font-semibold uppercase text-xs tracking-wider">Total Amount</span>
        <PriceDisplay price={order.total} size="md" className="font-bold text-gray-900" />
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div className="flex justify-between gap-2">
        <Button
          icon={<EyeOutlined />}
          onClick={() => onViewDetails(order)}
          size="middle"
          className="flex-1 flex items-center justify-center font-medium border-gray-200 text-gray-600 hover:text-emerald-800 hover:border-emerald-800"
        >
          Details
        </Button>
        <div className="flex-1 flex justify-end">
          <StatusUpdateButtons
            status={order.status}
            isLoading={isUpdating}
            onUpdateStatus={(nextStatus) => onUpdateStatus(order.id, nextStatus)}
            size="middle"
          />
        </div>
      </div>
    </Card>
  );
};

export default OrderCard;
