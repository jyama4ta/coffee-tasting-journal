import { Suspense } from "react";
import NewBeanForm from "./NewBeanForm";

export default function NewBeanPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🫘 豆登録</h1>
        <p className="text-gray-600">新しいコーヒー豆を登録します</p>
      </div>

      <Suspense
        fallback={<div className="text-center py-8">読み込み中...</div>}
      >
        <NewBeanForm />
      </Suspense>
    </div>
  );
}
