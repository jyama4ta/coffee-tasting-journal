"use client";

import { useState, useCallback } from "react";

interface StarRatingProps {
  name: string;
  label: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  icon?: "star" | "bean";
  minValue?: 0 | 1;
}

function StarIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      data-testid="star-icon"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

function BeanIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      data-testid="bean-icon"
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* コーヒー豆の外形 */}
      <ellipse
        cx="12"
        cy="12"
        rx="6"
        ry="9"
        fill={filled ? "#92400e" : "none"}
        stroke={filled ? "#78350f" : "#d1d5db"}
        strokeWidth="1.5"
      />
      {/* コーヒー豆の中央線（溝） */}
      <path
        d="M12 4c0 4-2.5 6-2.5 8s2.5 4 2.5 8"
        fill="none"
        stroke={filled ? "#78350f" : "#d1d5db"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function StarRating({
  name,
  label,
  value = null,
  onChange,
  icon = "star",
  minValue = 1,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  // valueの表示用値（nullまたは0の場合で0として扱う）
  const displayValue = value ?? 0;

  const handleClick = useCallback(
    (rating: number) => {
      if (onChange) {
        // 同じ値をクリックしたらクリア（minValueに応じて0か null）
        if (value === rating) {
          onChange(minValue === 0 ? 0 : null);
        } else {
          onChange(rating);
        }
      }
    },
    [value, onChange, minValue],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!onChange) return;

      const currentValue = value ?? 0;

      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        const newValue = Math.min(currentValue + 1, 5);
        onChange(newValue);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        if (minValue === 0) {
          const newValue = Math.max(currentValue - 1, 0);
          onChange(newValue);
        } else {
          // minValue === 1
          if (currentValue === 1) {
            onChange(null);
          } else {
            const newValue = Math.max(currentValue - 1, 1);
            onChange(newValue);
          }
        }
      }
    },
    [value, onChange, minValue],
  );

  const IconComponent = icon === "bean" ? BeanIcon : StarIcon;

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-label={label}
        data-testid="star-container"
        data-hover={hoverValue}
        className="flex gap-1"
        onMouseLeave={() => setHoverValue(0)}
      >
        {[1, 2, 3, 4, 5].map((rating) => {
          const isHighlighted =
            hoverValue > 0 ? rating <= hoverValue : rating <= displayValue;

          return (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={rating <= displayValue}
              aria-label={String(rating)}
              tabIndex={rating === (displayValue || 1) ? 0 : -1}
              className={`w-8 h-8 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 rounded ${
                isHighlighted ? "text-amber-500" : "text-gray-300"
              } hover:text-amber-400`}
              onClick={() => handleClick(rating)}
              onMouseEnter={() => setHoverValue(rating)}
              onKeyDown={handleKeyDown}
            >
              <IconComponent filled={isHighlighted} className="w-full h-full" />
            </button>
          );
        })}
      </div>
      <input
        type="hidden"
        name={name}
        value={value === null ? "" : String(value)}
      />
    </div>
  );
}
