import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "@/components/Card";

describe("Card コンポーネント", () => {
  const defaultProps = {
    href: "/test",
    icon: "☕",
    title: "テストタイトル",
    description: "テスト説明文",
  };

  describe("レンダリング", () => {
    it("リンクが正しいhrefを持つ", () => {
      render(<Card {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/test");
    });

    it("アイコンが表示される", () => {
      render(<Card {...defaultProps} />);
      expect(screen.getByText("☕")).toBeInTheDocument();
    });

    it("タイトルが表示される", () => {
      render(<Card {...defaultProps} />);
      expect(screen.getByText("テストタイトル")).toBeInTheDocument();
    });

    it("説明が表示される", () => {
      render(<Card {...defaultProps} />);
      expect(screen.getByText("テスト説明文")).toBeInTheDocument();
    });
  });

  describe("count プロパティ", () => {
    it("countが指定された場合バッジが表示される", () => {
      render(<Card {...defaultProps} count={42} />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("countが0の場合もバッジが表示される", () => {
      render(<Card {...defaultProps} count={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("countが未指定の場合バッジが表示されない", () => {
      render(<Card {...defaultProps} />);
      // バッジのスタイルを持つ要素が存在しないことを確認
      const badge = screen.queryByText(/^\d+$/);
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe("color プロパティ", () => {
    it("デフォルトカラー（bg-amber-50）が適用される", () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByRole("link").firstChild as HTMLElement;
      expect(card.className).toContain("bg-amber-50");
    });

    it("カスタムカラーが適用される", () => {
      render(<Card {...defaultProps} color="bg-green-50" />);
      const card = screen.getByRole("link").firstChild as HTMLElement;
      expect(card.className).toContain("bg-green-50");
    });
  });

  describe("スタイル", () => {
    it("カードに必要な基本スタイルが適用される", () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByRole("link").firstChild as HTMLElement;
      expect(card.className).toContain("rounded-lg");
      expect(card.className).toContain("shadow-md");
      expect(card.className).toContain("cursor-pointer");
    });
  });
});
