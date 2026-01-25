"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "ホーム", icon: "☕" },
  { href: "/tastings", label: "試飲記録", icon: "📝" },
  { href: "/beans", label: "豆", icon: "🫘" },
  { href: "/shops", label: "店舗", icon: "🏪" },
  { href: "/drippers", label: "ドリッパー", icon: "🫖" },
  { href: "/filters", label: "フィルター", icon: "📄" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-amber-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span>☕</span>
            <span className="hidden sm:inline">Coffee Tasting Journal</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-amber-800 text-white"
                      : "text-amber-100 hover:bg-amber-800 hover:text-white"
                  }`}
                >
                  <span className="sm:hidden">{item.icon}</span>
                  <span className="hidden sm:inline">
                    {item.icon} {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
