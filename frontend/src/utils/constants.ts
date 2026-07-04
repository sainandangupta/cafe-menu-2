export const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  CUSTOMER: 'customer',
} as const;

export const ORDER_STATUS = {
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  PREPARED: 'prepared',
  DELIVERED: 'delivered',
  REJECTED: 'rejected',
} as const;

export const STATUS_DETAILS = {
  [ORDER_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    color: '#1890ff', // Ant blue
    bg: '#e6f7ff',
    border: '#91d5ff',
  },
  [ORDER_STATUS.PREPARING]: {
    label: 'Preparing',
    color: '#faad14', // Ant orange
    bg: '#fffbe6',
    border: '#ffe58f',
  },
  [ORDER_STATUS.PREPARED]: {
    label: 'Prepared',
    color: '#52c41a', // Ant green
    bg: '#f6ffed',
    border: '#b7eb8f',
  },
  [ORDER_STATUS.DELIVERED]: {
    label: 'Delivered',
    color: '#00b96b', // Ant green-dark
    bg: '#e6ffec',
    border: '#85e89d',
  },
  [ORDER_STATUS.REJECTED]: {
    label: 'Rejected',
    color: '#ff4d4f', // Ant red
    bg: '#fff1f0',
    border: '#ffccc7',
  },
} as const;
