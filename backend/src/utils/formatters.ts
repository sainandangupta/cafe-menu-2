import { Response } from 'express';

export const formatPrice = (price: number): string => {
  if (price === undefined || price === null || isNaN(price)) return '₹0.00';
  return `₹${price.toFixed(2)}`;
};

export const formatDate = (date?: Date | string | null): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
};

export const formatTimeAgo = (date?: Date | string | null): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return formatDate(dateObj);
};

export const sendResponse = (
  res: Response,
  statusCode: number,
  data: any = null,
  message: string | null = null
) => {
  const payload: any = {
    status: statusCode >= 400 ? 'error' : 'success',
  };

  if (message) {
    payload.message = message;
  }

  if (data !== null) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};
