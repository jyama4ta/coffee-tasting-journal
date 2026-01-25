import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  describe("モバイルメニュー（ハンバーガーメニュー）", () => {
    it("ハンバーガーメニューボタンが表示される", () => {
      render(<Navigation />);
      const menuButton = screen.getByRole("button", { name: /メニュー/i });
      expect(menuButton).toBeInTheDocument();
    });

    it("初期状態ではモバイルメニューが閉じている", () => {
      render(<Navigation />);
      const mobileMenu = screen.queryByTestId("mobile-menu");
      expect(mobileMenu).not.toBeInTheDocument();
    });

    it("ハンバーガーボタンをクリックするとモバイルメニューが開く", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /メニュー/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByTestId("mobile-menu");
      expect(mobileMenu).toBeInTheDocument();
    });

    it("モバイルメニューに全てのナビゲーションリンクが表示される", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /メニュー/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByTestId("mobile-menu");
      expect(mobileMenu).toHaveTextContent("ホーム");
      expect(mobileMenu).toHaveTextContent("試飲記録");
      expect(mobileMenu).toHaveTextContent("豆");
      expect(mobileMenu).toHaveTextContent("店舗");
      expect(mobileMenu).toHaveTextContent("ドリッパー");
      expect(mobileMenu).toHaveTextContent("フィルター");
    });

    it("モバイルメニューが開いている時に再度ボタンをクリックすると閉じる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /メニュー/i });
      await user.click(menuButton); // 開く
      expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();

      await user.click(menuButton); // 閉じる
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });

    it("モバイルメニュー内のリンクをクリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /メニュー/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByTestId("mobile-menu");
      const tastingsLink = mobileMenu.querySelector('a[href="/tastings"]');
      expect(tastingsLink).toBeInTheDocument();

      await user.click(tastingsLink!);
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });
  });

  describe("デスクトップメニューリンクのクリック", () => {
    it("ホームリンクをクリックできる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      // デスクトップメニューのホームリンクを取得
      const links = screen.getAllByRole("link");
      const homeLink = links.find(
        (link) =>
          link.getAttribute("href") === "/" &&
          link.textContent?.includes("ホーム"),
      );

      expect(homeLink).toBeInTheDocument();
      await user.click(homeLink!);
      // Next.jsのLinkコンポーネントなのでナビゲーションが発生する
      // （実際のナビゲーションはjsdomでは発生しないが、クリック可能であることを確認）
    });

    it("試飲記録リンクをクリックできる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const links = screen.getAllByRole("link");
      const tastingsLink = links.find(
        (link) =>
          link.getAttribute("href") === "/tastings" &&
          link.textContent?.includes("試飲記録"),
      );

      expect(tastingsLink).toBeInTheDocument();
      await user.click(tastingsLink!);
    });

    it("豆リンクをクリックできる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const links = screen.getAllByRole("link");
      const beansLink = links.find(
        (link) =>
          link.getAttribute("href") === "/beans" &&
          link.textContent?.includes("豆"),
      );

      expect(beansLink).toBeInTheDocument();
      await user.click(beansLink!);
    });

    it("店舗リンクをクリックできる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const links = screen.getAllByRole("link");
      const shopsLink = links.find(
        (link) =>
          link.getAttribute("href") === "/shops" &&
          link.textContent?.includes("店舗"),
      );

      expect(shopsLink).toBeInTheDocument();
      await user.click(shopsLink!);
    });

    it("ドリッパーリンクをクリックできる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const links = screen.getAllByRole("link");
      const drippersLink = links.find(
        (link) =>
          link.getAttribute("href") === "/drippers" &&
          link.textContent?.includes("ドリッパー"),
      );

      expect(drippersLink).toBeInTheDocument();
      await user.click(drippersLink!);
    });

    it("フィルターリンクをクリックできる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const links = screen.getAllByRole("link");
      const filtersLink = links.find(
        (link) =>
          link.getAttribute("href") === "/filters" &&
          link.textContent?.includes("フィルター"),
      );

      expect(filtersLink).toBeInTheDocument();
      await user.click(filtersLink!);
    });
  });

  describe("モバイルメニューリンクのクリック", () => {
    it("モバイルメニューのホームリンクをクリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /メニュー/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByTestId("mobile-menu");
      const homeLink = mobileMenu.querySelector('a[href="/"]');
      expect(homeLink).toBeInTheDocument();

      await user.click(homeLink!);
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });

    it("モバイルメニューの試飲記録リンクをクリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /メニュー/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByTestId("mobile-menu");
      const tastingsLink = mobileMenu.querySelector('a[href="/tastings"]');
      expect(tastingsLink).toBeInTheDocument();

      await user.click(tastingsLink!);
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });

    it("モバイルメニューの豆リンクをクリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /メニュー/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByTestId("mobile-menu");
      const beansLink = mobileMenu.querySelector('a[href="/beans"]');
      expect(beansLink).toBeInTheDocument();

      await user.click(beansLink!);
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });

    it("モバイルメニューの店舗リンクをクリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /メニュー/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByTestId("mobile-menu");
      const shopsLink = mobileMenu.querySelector('a[href="/shops"]');
      expect(shopsLink).toBeInTheDocument();

      await user.click(shopsLink!);
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });

    it("モバイルメニューのドリッパーリンクをクリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /メニュー/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByTestId("mobile-menu");
      const drippersLink = mobileMenu.querySelector('a[href="/drippers"]');
      expect(drippersLink).toBeInTheDocument();

      await user.click(drippersLink!);
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });

    it("モバイルメニューのフィルターリンクをクリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /メニュー/i });
      await user.click(menuButton);

      const mobileMenu = screen.getByTestId("mobile-menu");
      const filtersLink = mobileMenu.querySelector('a[href="/filters"]');
      expect(filtersLink).toBeInTheDocument();

      await user.click(filtersLink!);
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    });
  });
});
