"use client";

import { useState } from "react";

interface GrindSizeSliderProps {
  name: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  label?: string;
}

export default function GrindSizeSlider({
  name,
  value,
  onChange,
  label = "挽き目",
}: GrindSizeSliderProps) {
  // 制御・非制御の両方に対応
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(
    null,
  );

  const currentValue = isControlled ? (value ?? null) : uncontrolledValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleClear = () => {
    if (!isControlled) {
      setUncontrolledValue(null);
    }
    onChange?.(null);
  };

  // 1から10まで0.5刻みで目盛りを生成
  const ticks = [];
  for (let i = 1; i <= 10; i += 0.5) {
    ticks.push(i);
  }

  const getTickPosition = (tickValue: number) => {
    // 1-10の範囲を0-100%に変換
    return ((tickValue - 1) / 9) * 100;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {currentValue !== null && (
            <>
              <span className="text-lg font-semibold text-amber-700">
                {currentValue.toFixed(1)}
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                クリア
              </button>
            </>
          )}
          {currentValue === null && (
            <span className="text-sm text-gray-400">未設定</span>
          )}
        </div>
      </div>

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={currentValue ?? ""} />

      <div className="relative pt-1 pb-6">
        {/* スライダー */}
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={currentValue ?? 5}
          onChange={handleChange}
          className="w-full h-2 bg-linear-to-r from-amber-200 to-amber-600 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-amber-600
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-amber-600
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer"
        />

        {/* 目盛り */}
        <div className="absolute left-0 right-0 top-5">
          <div className="relative h-8">
            {ticks.map((tick) => {
              const isInteger = Number.isInteger(tick);
              const position = getTickPosition(tick);

              return (
                <div
                  key={tick}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${position}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {/* 目盛り線 */}
                  <div
                    className={`bg-gray-400 ${
                      isInteger ? "h-3 w-0.5" : "h-1.5 w-px"
                    }`}
                  />
                  {/* 整数のみ数字を表示 */}
                  {isInteger && (
                    <span className="text-xs text-gray-500 mt-0.5">{tick}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>細挽き</span>
        <span>粗挽き</span>
      </div>
    </div>
  );
}
