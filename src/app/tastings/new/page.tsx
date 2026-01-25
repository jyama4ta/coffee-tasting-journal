import { Suspense } from "react";
import NewTastingForm from "./NewTastingForm";

export default function NewTastingPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📝 試飲記録</h1>
        <p className="text-gray-600">新しい試飲記録を追加します</p>
      </div>

      <Suspense
        fallback={<div className="text-center py-8">読み込み中...</div>}
      >
        <NewTastingForm />
      </Suspense>
    </div>
  );
}
