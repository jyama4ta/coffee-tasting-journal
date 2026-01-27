import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Button from "@/components/Button";
import DeleteButton from "./DeleteButton";
import { formatDate } from "@/lib/dateUtils";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getOrigin(id: number) {
  return await prisma.originMaster.findUnique({
    where: { id },
  });
}

export default async function OriginDetailPage({ params }: PageProps) {
  const { id } = await params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    notFound();
  }

  const origin = await getOrigin(parsedId);

  if (!origin) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/admin" className="hover:text-gray-900">
          管理画面
        </Link>
        <span>/</span>
        <Link href="/admin/origins" className="hover:text-gray-900">
          産地マスター一覧
        </Link>
        <span>/</span>
        <span className="text-gray-900">{origin.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🌍 {origin.name}</h1>
          <p className="text-gray-600">産地マスター詳細</p>
        </div>
        <div className="flex gap-2">
          <Button href={`/admin/origins/${origin.id}/edit`} variant="secondary">
            編集
          </Button>
          <DeleteButton id={origin.id} name={origin.name} />
        </div>
      </div>

      {/* Detail Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">産地名</dt>
            <dd className="mt-1 text-gray-900">{origin.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">登録日</dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(origin.createdAt)}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500">メモ</dt>
            <dd className="mt-1 text-gray-900 whitespace-pre-wrap">
              {origin.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Back Button */}
      <div className="flex">
        <Button href="/admin/origins" variant="secondary">
          ← 一覧に戻る
        </Button>
      </div>
    </div>
  );
}
