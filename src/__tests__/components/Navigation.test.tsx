import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Navigation from "@/components/Navigation";

// usePathnameをモック
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";

describe("Navigation コンポーネント", () => {
  const mockUsePathname = usePathname as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  describe("レンダリング", () => {
    it("ロゴが表示される", () => {
      render(<Navigation />);
      expect(screen.getByText("Coffee Tasting Journal")).toBeInTheDocument();
    });

    it("全てのナビゲーションリンクが表示される", () => {
      render(<Navigation />);

      expect(screen.getByText(/ホーム/)).toBeInTheDocument();
      expect(screen.getByText(/試飲記録/)).toBeInTheDocument();
      expect(screen.getByText(/豆/)).toBeInTheDocument();
      expect(screen.getByText(/店舗/)).toBeInTheDocument();
      expect(screen.getByText(/ドリッパー/)).toBeInTheDocument();
      expect(screen.getByText(/フィルター/)).toBeInTheDocument();
    });

    it("ロゴがホームへのリンクを持つ", () => {
      render(<Navigation />);
      const logoLink = screen.getByText("Coffee Tasting Journal").closest("a");
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });

  describe("ナビゲーションリンク", () => {
    it("各リンクが正しいhrefを持つ", () => {
      render(<Navigation />);

      const links = screen.getAllByRole("link");
      const hrefs = links.map((link) => link.getAttribute("href"));

      expect(hrefs).toContain("/");
      expect(hrefs).toContain("/tastings");
      expect(hrefs).toContain("/beans");
      expect(hrefs).toContain("/shops");
      expect(hrefs).toContain("/drippers");
      expect(hrefs).toContain("/filters");
    });
  });

  describe("アクティブ状態", () => {
    it("ホームページでホームリンクがアクティブスタイルを持つ", () => {
      mockUsePathname.mockReturnValue("/");
      render(<Navigation />);

      // ホームリンクを取得（hrefが"/"のリンク、ロゴ以外）
      const links = screen.getAllByRole("link");
      const homeNavLink = links.find(
        (link) =>
          link.getAttribute("href") === "/" &&
          link.textContent?.includes("ホーム"),
      );

      expect(homeNavLink?.className).toContain("bg-amber-800");
    });

    it("試飲記録ページで試飲記録リンクがアクティブスタイルを持つ", () => {
      mockUsePathname.mockReturnValue("/tastings");
      render(<Navigation />);

      const links = screen.getAllByRole("link");
      const tastingsLink = links.find((link) =>
        link.textContent?.includes("試飲記録"),
      );

      expect(tastingsLink?.className).toContain("bg-amber-800");
    });

    it("サブページでも親ページがアクティブになる", () => {
      mockUsePathname.mockReturnValue("/tastings/new");
      render(<Navigation />);

      const links = screen.getAllByRole("link");
      const tastingsLink = links.find((link) =>
        link.textContent?.includes("試飲記録"),
      );

      expect(tastingsLink?.className).toContain("bg-amber-800");
    });

    it("非アクティブなリンクはアクティブスタイルを持たない", () => {
      mockUsePathname.mockReturnValue("/tastings");
      render(<Navigation />);

      const links = screen.getAllByRole("link");
      const shopsLink = links.find((link) =>
        link.textContent?.includes("店舗"),
      );

      // アクティブスタイル（bg-amber-800 text-white）ではなく、
      // 非アクティブスタイル（text-amber-100）が適用されていることを確認
      // hover:bg-amber-800 は含まれるが、それ以外のbg-amber-800は含まれない
      expect(shopsLink?.className).toContain("text-amber-100");
      expect(shopsLink?.className).toContain("hover:bg-amber-800");
      // classNameをスペースで分割して、独立した"bg-amber-800"クラスがないことを確認
      const classes = shopsLink?.className.split(" ") || [];
      expect(classes).not.toContain("bg-amber-800");
    });
  });
});
