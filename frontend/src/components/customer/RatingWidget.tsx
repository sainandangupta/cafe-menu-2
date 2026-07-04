import React, { useState } from 'react';
import { Rate } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { Rating } from '../../types';

interface RatingWidgetProps {
  ratings: Rating[];
  readonly?: boolean;
  value?: number;
  onChange?: (val: number) => void;
}

export const RatingWidget: React.FC<RatingWidgetProps> = ({
  ratings = [],
  readonly = true,
  value,
  onChange,
}) => {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  const count = ratings.length;
  const average =
    count > 0 ? ratings.reduce((sum, item) => sum + item.rating, 0) / count : 0;

  if (readonly) {
    return (
      <div className="flex items-center gap-2">
        <Rate
          disabled
          allowHalf
          value={average}
          character={<StarFilled style={{ fontSize: '16px' }} />}
          className="text-amber-400"
        />
        <span className="text-sm font-semibold text-gray-800">
          {average > 0 ? average.toFixed(1) : 'No ratings'}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          ({count} {count === 1 ? 'rating' : 'ratings'})
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-700">How was this dish?</p>
      <div className="flex items-center gap-2">
        <Rate
          value={value}
          onChange={onChange}
          onHoverChange={(val) => setHoverValue(val)}
          character={<StarFilled style={{ fontSize: '28px' }} />}
          className="text-amber-400 cursor-pointer"
        />
        {hoverValue !== undefined || value !== undefined ? (
          <span className="text-sm font-bold text-amber-600">
            {hoverValue || value} / 5
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default RatingWidget;
