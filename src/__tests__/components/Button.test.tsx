import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/Button";

describe("Button コンポーネント", () => {
  describe("レンダリング", () => {
    it("子要素を正しくレンダリングする", () => {
      render(<Button>テストボタン</Button>);
      expect(screen.getByText("テストボタン")).toBeInTheDocument();
    });

    it("button要素としてレンダリングされる（hrefなしの場合）", () => {
      render(<Button>ボタン</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("Link要素としてレンダリングされる（hrefありの場合）", () => {
      render(<Button href="/test">リンクボタン</Button>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/test");
    });
  });

  describe("variant スタイル", () => {
    it("primary variant - amber背景・白文字のスタイルを適用する", () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-amber-600");
      expect(button.className).toContain("text-white");
    });

    it("secondary variant - gray背景・白文字のスタイルを適用する", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-gray-600");
      expect(button.className).toContain("text-white");
    });

    it("danger variant - red背景・白文字のスタイルを適用する", () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-red-600");
      expect(button.className).toContain("text-white");
    });

    it("outline variant - 白背景・amber文字・amber枠線のスタイルを適用する", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-white");
      expect(button.className).toContain("text-amber-600");
      expect(button.className).toContain("border-amber-600");
    });

    it("outline-light variant - 透明背景・白文字・白枠線のスタイルを適用する", () => {
      render(<Button variant="outline-light">Outline Light</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-transparent");
      expect(button.className).toContain("text-white");
      expect(button.className).toContain("border-white");
    });

    it("デフォルトはprimary variantが適用される", () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-amber-600");
    });
  });

  describe("size スタイル", () => {
    it("sm size - 小さいパディングを適用する", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-3");
      expect(button.className).toContain("py-1.5");
      expect(button.className).toContain("text-sm");
    });

    it("md size - 中程度のパディングを適用する", () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-4");
      expect(button.className).toContain("py-2");
      expect(button.className).toContain("text-base");
    });

    it("lg size - 大きいパディングを適用する", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-6");
      expect(button.className).toContain("py-3");
      expect(button.className).toContain("text-lg");
    });

    it("デフォルトはmd sizeが適用される", () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-4");
      expect(button.className).toContain("py-2");
    });
  });

  describe("インタラクション", () => {
    it("クリック時にonClickハンドラが呼ばれる", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("disabled時はクリックしても反応しない", () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      );
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });
  });

  describe("属性", () => {
    it("type属性を指定できる", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("デフォルトのtype属性はbutton", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("追加のclassNameを適用できる", () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("custom-class");
    });
  });
});
