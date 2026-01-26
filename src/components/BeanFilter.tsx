"use client";

import { useRouter } from "next/navigation";

interface Bean {
  id: number;
  name: string;
  beanMasterId: number | null;
}

interface BeanMaster {
  id: number;
  name: string;
}

interface BeanFilterProps {
  beans: Bean[];
  beanMasters: BeanMaster[];
  selectedBeanId?: string;
  selectedBeanMasterId?: string;
}

export default function BeanFilter({
  beans,
  beanMasters,
  selectedBeanId,
  selectedBeanMasterId,
}: BeanFilterProps) {
  const router = useRouter();

  const handleBeanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    router.push(value ? `/tastings?beanId=${value}` : "/tastings");
  };

  const handleBeanMasterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    router.push(value ? `/tastings?beanMasterId=${value}` : "/tastings");
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* 銘柄マスターでフィルタ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label
            htmlFor="beanMasterFilter"
            className="text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            銘柄で絞り込み:
          </label>
          <select
            id="beanMasterFilter"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            defaultValue={selectedBeanMasterId || ""}
            onChange={handleBeanMasterChange}
            disabled={!!selectedBeanId}
          >
            <option value="">すべて</option>
            {beanMasters.map((master) => (
              <option key={master.id} value={master.id}>
                {master.name}
              </option>
            ))}
          </select>
        </div>

        {/* 個別の豆でフィルタ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label
            htmlFor="beanFilter"
            className="text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            購入記録で絞り込み:
          </label>
          <select
            id="beanFilter"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            defaultValue={selectedBeanId || ""}
            onChange={handleBeanChange}
            disabled={!!selectedBeanMasterId}
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
    </div>
  );
}
