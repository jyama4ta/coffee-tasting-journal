import Link from "next/link";

const adminMenuItems = [
  {
    href: "/admin/origins",
    label: "産地マスター",
    icon: "🌍",
    description: "コーヒー豆の産地（国）を管理",
  },
  {
    href: "/admin/bean-masters",
    label: "銘柄マスター",
    icon: "📋",
    description: "コーヒー豆の銘柄を管理",
  },
  {
    href: "/admin/shops",
    label: "店舗マスター",
    icon: "🏪",
    description: "購入店舗を管理",
  },
  {
    href: "/admin/drippers",
    label: "ドリッパーマスター",
    icon: "🫖",
    description: "ドリッパーを管理",
  },
  {
    href: "/admin/filters",
    label: "フィルターマスター",
    icon: "📄",
    description: "フィルターを管理",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">⚙️ 管理画面</h1>
        <p className="text-gray-600">マスターデータを管理できます</p>
      </div>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {item.label}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
