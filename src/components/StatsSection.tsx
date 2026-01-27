import Card from "./Card";

interface Stats {
  tastingsCount: number;
  beansCount: number;
  inStockBeansCount: number;
  shopsCount: number;
  drippersCount: number;
  filtersCount: number;
}

interface StatsSectionProps {
  stats: Stats;
}

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 統計</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card
          href="/tastings"
          icon="📝"
          title="ドリップ記録"
          description="全ての記録"
          count={stats.tastingsCount}
        />
        <Card
          href="/beans"
          icon="🫘"
          title="豆"
          description="登録済み"
          count={stats.beansCount}
        />
        <Card
          href="/beans?status=IN_STOCK"
          icon="📦"
          title="在庫中"
          description="今ある豆"
          count={stats.inStockBeansCount}
          color="bg-green-50"
        />
        <Card
          href="/shops"
          icon="🏪"
          title="店舗"
          description="購入店"
          count={stats.shopsCount}
        />
        <Card
          href="/drippers"
          icon="🫖"
          title="ドリッパー"
          description="器具"
          count={stats.drippersCount}
        />
        <Card
          href="/filters"
          icon="📄"
          title="フィルター"
          description="器具"
          count={stats.filtersCount}
        />
      </div>
    </section>
  );
}
