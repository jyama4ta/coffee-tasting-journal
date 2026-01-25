import Link from "next/link";

interface CardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  count?: number;
  color?: string;
}

export default function Card({
  href,
  icon,
  title,
  description,
  count,
  color = "bg-amber-50",
}: CardProps) {
  return (
    <Link href={href}>
      <div
        className={`${color} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-amber-200`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-4xl">{icon}</span>
          {count !== undefined && (
            <span className="bg-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
}
