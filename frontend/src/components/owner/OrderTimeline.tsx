import React from 'react';
import { Steps } from 'antd';
import {
  FileTextOutlined,
  LoadingOutlined,
  BellOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { OrderStatus } from '../../types';

interface OrderTimelineProps {
  status: OrderStatus;
  currentStepIndex: number;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const steps = [
    {
      title: 'Confirmed',
      description: 'Order placed',
      icon: <FileTextOutlined />,
    },
    {
      title: 'Preparing',
      description: 'In the kitchen',
      icon: status === 'preparing' ? <LoadingOutlined /> : <BellOutlined />,
    },
    {
      title: 'Prepared',
      description: 'Ready to serve',
      icon: <CheckCircleOutlined />,
    },
    {
      title: 'Delivered',
      description: 'Served to table',
      icon: <CheckCircleOutlined />,
    },
  ];

  const getStepIndex = (s: OrderStatus) => {
    switch (s) {
      case 'confirmed':
        return 0;
      case 'preparing':
        return 1;
      case 'prepared':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const current = getStepIndex(status);

  return (
    <Steps
      current={current}
      size="small"
      items={steps.map((step, idx) => ({
        title: step.title,
        description: idx <= current ? step.description : '',
        icon: step.icon,
      }))}
      className="py-4"
    />
  );
};

export default OrderTimeline;
