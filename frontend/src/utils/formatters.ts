export const formatPrice = (price: number): string => {
  if (price === undefined || price === null || isNaN(price)) return '₹0.00';
  return `₹${price.toFixed(2)}`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const formatTimeAgo = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return formatDate(dateString);
};

export const calculateGst = (
  subtotal: number,
  gstPercentage: number = 5.0
): { gstAmount: number; total: number } => {
  const gstAmount = (subtotal * gstPercentage) / 100;
  const total = subtotal + gstAmount;
  return { gstAmount, total };
};
