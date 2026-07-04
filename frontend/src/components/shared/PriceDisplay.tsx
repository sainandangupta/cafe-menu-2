import React from 'react';
import { formatPrice } from '../../utils/formatters';

interface PriceDisplayProps {
  price: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-sm font-medium',
    md: 'text-base font-semibold',
    lg: 'text-lg md:text-xl font-bold text-gray-900',
  };

  return (
    <span className={`${sizeClasses[size]} text-slate-800 ${className}`}>
      {formatPrice(price)}
    </span>
  );
};

export default PriceDisplay;
