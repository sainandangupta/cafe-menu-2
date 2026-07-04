import React from 'react';
import { Tag } from 'antd';
import { OrderStatus } from '../../types';
import { STATUS_DETAILS } from '../../utils/constants';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const details = STATUS_DETAILS[status];
  
  if (!details) {
    return <Tag className={className}>{status}</Tag>;
  }

  return (
    <Tag
      color={details.color}
      style={{
        backgroundColor: details.bg,
        borderColor: details.border,
        color: details.color,
        fontWeight: 600,
        fontSize: '12px',
        padding: '2px 8px',
        borderRadius: '4px',
      }}
      className={className}
    >
      {details.label.toUpperCase()}
    </Tag>
  );
};

export default StatusBadge;
