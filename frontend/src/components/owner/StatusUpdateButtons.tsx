import React from 'react';
import { OrderStatus } from '../../types';

interface StatusUpdateButtonsProps {
  status: OrderStatus;
  isLoading?: boolean;
  onUpdateStatus: (nextStatus: OrderStatus) => void;
  size?: 'small' | 'middle' | 'large';
}

export const StatusUpdateButtons: React.FC<StatusUpdateButtonsProps> = ({
  status,
  isLoading = false,
  onUpdateStatus,
  size = 'middle',
}) => {
  if (status === 'delivered' || status === 'rejected') return null;

  const nextConfigs: Partial<Record<OrderStatus, { label: string; next: OrderStatus; icon: string; className: string }>> = {
    confirmed: {
      label: 'Start Preparing',
      next: 'preparing' as OrderStatus,
      icon: 'play_circle',
      className: 'bg-amber-500 hover:bg-amber-600 text-white font-semibold',
    },
    preparing: {
      label: 'Mark Prepared',
      next: 'prepared' as OrderStatus,
      icon: 'check_circle',
      className: 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold',
    },
    prepared: {
      label: 'Mark Delivered',
      next: 'delivered' as OrderStatus,
      icon: 'done_all',
      className: 'bg-emerald-950 hover:bg-emerald-900 text-white font-semibold',
    },
  };

  const config = nextConfigs[status];
  if (!config) return null;

  const sizeClasses = size === 'small' ? 'px-2 py-1 text-[10px]' : size === 'large' ? 'px-5 py-3 text-sm' : 'px-3 py-1.5 text-xs';

  return (
    <button
      disabled={isLoading}
      onClick={() => onUpdateStatus(config.next)}
      className={`${config.className} ${sizeClasses} rounded-lg flex items-center justify-center gap-1 border-none cursor-pointer active:scale-95 transition-all`}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <span className="material-symbols-outlined text-base font-bold">{config.icon}</span>
      )}
      <span>{config.label}</span>
    </button>
  );
};

export default StatusUpdateButtons;
