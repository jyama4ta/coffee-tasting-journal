"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-6">☕</div>
      <h1 className="text-2xl font-bold text-amber-900 mb-4">オフラインです</h1>
      <p className="text-amber-700 mb-6 max-w-md">
        インターネット接続がありません。
        <br />
        接続が回復したら、ページを再読み込みしてください。
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
      >
        再読み込み
      </button>
    </div>
  );
}
