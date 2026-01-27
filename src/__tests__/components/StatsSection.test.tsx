import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatsSection from "@/components/StatsSection";

const mockStats = {
  tastingsCount: 10,
  beansCount: 5,
  inStockBeansCount: 3,
  shopsCount: 2,
  drippersCount: 4,
  filtersCount: 6,
};

describe("StatsSection コンポーネント", () => {
  describe("レンダリング", () => {
    it("セクションタイトルが表示される", () => {
      render(<StatsSection stats={mockStats} />);
      expect(screen.getByText(/📊 統計/)).toBeInTheDocument();
    });

    it("すべての統計カードが表示される", () => {
      render(<StatsSection stats={mockStats} />);
      expect(screen.getByText("ドリップ記録")).toBeInTheDocument();
      expect(screen.getByText("コーヒー豆")).toBeInTheDocument();
      expect(screen.getByText("在庫中")).toBeInTheDocument();
      expect(screen.getByText("店舗")).toBeInTheDocument();
      expect(screen.getByText("ドリッパー")).toBeInTheDocument();
      expect(screen.getByText("フィルター")).toBeInTheDocument();
    });

    it("正しいカウント数が表示される", () => {
      render(<StatsSection stats={mockStats} />);
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("6")).toBeInTheDocument();
    });
  });

  describe("モバイルレスポンシブ", () => {
    it("グリッドコンテナがレスポンシブクラスを持つ", () => {
      render(<StatsSection stats={mockStats} />);
      // グリッドコンテナを取得（Cardを含むdiv）
      const gridContainer = screen
        .getByText("ドリップ記録")
        .closest("a")?.parentElement;
      // スマホで1列、sm:2列、md:3列、lg:6列
      expect(gridContainer?.className).toContain("grid-cols-1");
      expect(gridContainer?.className).toContain("sm:grid-cols-2");
      expect(gridContainer?.className).toContain("md:grid-cols-3");
      expect(gridContainer?.className).toContain("lg:grid-cols-6");
    });
  });
});
