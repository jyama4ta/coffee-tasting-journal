"use client";

import { useRouter } from "next/navigation";

interface Bean {
  id: number;
  name: string;
}

interface BeanFilterProps {
  beans: Bean[];
  selectedBeanId?: string;
}

export default function BeanFilter({ beans, selectedBeanId }: BeanFilterProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    router.push(value ? `/tastings?beanId=${value}` : "/tastings");
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label
          htmlFor="beanFilter"
          className="text-sm font-medium text-gray-700"
        >
          豆で絞り込み:
        </label>
        <select
          id="beanFilter"
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          defaultValue={selectedBeanId || ""}
          onChange={handleChange}
        >
          <option value="">すべて</option>
          {beans.map((bean) => (
            <option key={bean.id} value={bean.id}>
              {bean.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
