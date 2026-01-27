import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroSection from "@/components/HeroSection";

describe("HeroSection コンポーネント", () => {
  describe("レンダリング", () => {
    it("タイトルが表示される", () => {
      render(<HeroSection />);
      expect(
        screen.getByRole("heading", { name: /Coffee Tasting Journal/i }),
      ).toBeInTheDocument();
    });

    it("説明文が表示される", () => {
      render(<HeroSection />);
      expect(
        screen.getByText(
          /ハンドドリップコーヒーのドリップ記録を管理しましょう/,
        ),
      ).toBeInTheDocument();
    });

    it("ドリップ記録を追加ボタンが表示される", () => {
      render(<HeroSection />);
      expect(
        screen.getByRole("link", { name: /ドリップ記録を追加/ }),
      ).toBeInTheDocument();
    });

    it("コーヒー豆を登録ボタンが表示される", () => {
      render(<HeroSection />);
      expect(
        screen.getByRole("link", { name: /コーヒー豆を登録/ }),
      ).toBeInTheDocument();
    });
  });

  describe("リンク", () => {
    it("ドリップ記録追加ボタンが正しいhrefを持つ", () => {
      render(<HeroSection />);
      const link = screen.getByRole("link", { name: /ドリップ記録を追加/ });
      expect(link).toHaveAttribute("href", "/tastings/new");
    });

    it("コーヒー豆登録ボタンが正しいhrefを持つ", () => {
      render(<HeroSection />);
      const link = screen.getByRole("link", { name: /コーヒー豆を登録/ });
      expect(link).toHaveAttribute("href", "/beans/new");
    });
  });

  describe("モバイルレスポンシブ", () => {
    it("ボタンコンテナがレスポンシブクラスを持つ", () => {
      render(<HeroSection />);
      const buttonContainer = screen
        .getByRole("link", { name: /ドリップ記録を追加/ })
        .closest("div");
      // スマホで縦並び、タブレット以上で横並び
      expect(buttonContainer?.className).toContain("flex-col");
      expect(buttonContainer?.className).toContain("sm:flex-row");
    });
  });
});
