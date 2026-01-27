import Button from "./Button";

export default function HeroSection() {
  return (
    <section className="bg-linear-to-r from-amber-800 to-amber-600 rounded-xl p-6 sm:p-8 text-white shadow-lg">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        ☕ Coffee Tasting Journal
      </h1>
      <p className="text-amber-100 mb-6">
        ハンドドリップコーヒーのドリップ記録を管理しましょう
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button href="/tastings/new" variant="outline-light">
          + ドリップ記録を追加
        </Button>
        <Button href="/beans/new" variant="outline-light">
          + コーヒー豆を登録
        </Button>
      </div>
    </section>
  );
}
