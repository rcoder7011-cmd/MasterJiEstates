import React from 'react';

/**
 * Professional Indian Rupee (INR) Monetary Value Display
 * Supports raw integer amounts or crore/lakh conversion.
 */
export default function MoneyDisplay({
  amount = 0,
  showFull = false,
  className = '',
  symbolClassName = 'text-amber-500 font-normal',
}) {
  const num = Number(amount) || 0;
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formatShort = (val) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const formatted = showFull
    ? `₹${absNum.toLocaleString('en-IN')}`
    : formatShort(absNum);

  return (
    <span className={`font-mono font-bold inline-flex items-center gap-0.5 ${className}`}>
      {isNegative && <span className="text-red-500 mr-0.5">-</span>}
      <span className={symbolClassName}>₹</span>
      <span>{formatted.replace('₹', '')}</span>
    </span>
  );
}

