import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GrindSizeSlider from "@/components/GrindSizeSlider";

describe("GrindSizeSlider", () => {
  describe("表示", () => {
    it("ラベルが表示される", () => {
      render(<GrindSizeSlider name="grindSize" />);
      expect(screen.getByText("挽き目")).toBeInTheDocument();
    });

    it("カスタムラベルが表示される", () => {
      render(<GrindSizeSlider name="grindSize" label="挽き具合" />);
      expect(screen.getByText("挽き具合")).toBeInTheDocument();
    });

    it("スライダーが表示される", () => {
      render(<GrindSizeSlider name="grindSize" />);
      const slider = screen.getByRole("slider");
      expect(slider).toBeInTheDocument();
    });

    it("スライダーの範囲が1〜10に設定されている", () => {
      render(<GrindSizeSlider name="grindSize" />);
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("min", "1");
      expect(slider).toHaveAttribute("max", "10");
    });

    it("スライダーのステップが0.5に設定されている", () => {
      render(<GrindSizeSlider name="grindSize" />);
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("step", "0.5");
    });

    it("整数の目盛り（1〜10）に数字が表示される", () => {
      render(<GrindSizeSlider name="grindSize" />);
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
    });

    it("「細挽き」と「粗挽き」のラベルが表示される", () => {
      render(<GrindSizeSlider name="grindSize" />);
      expect(screen.getByText("細挽き")).toBeInTheDocument();
      expect(screen.getByText("粗挽き")).toBeInTheDocument();
    });

    it("値が未設定の場合「未設定」が表示される", () => {
      render(<GrindSizeSlider name="grindSize" value={null} />);
      expect(screen.getByText("未設定")).toBeInTheDocument();
    });

    it("値が設定されている場合、その値が表示される", () => {
      render(<GrindSizeSlider name="grindSize" value={5.5} />);
      expect(screen.getByText("5.5")).toBeInTheDocument();
    });

    it("値が設定されている場合、クリアボタンが表示される", () => {
      render(<GrindSizeSlider name="grindSize" value={5} />);
      expect(screen.getByText("クリア")).toBeInTheDocument();
    });

    it("値が未設定の場合、クリアボタンが表示されない", () => {
      render(<GrindSizeSlider name="grindSize" value={null} />);
      expect(screen.queryByText("クリア")).not.toBeInTheDocument();
    });
  });

  describe("目盛り表示", () => {
    it("整数目盛りが長く表示される（h-3クラス）", () => {
      const { container } = render(<GrindSizeSlider name="grindSize" />);
      // 整数目盛り用のdivを探す
      const ticks = container.querySelectorAll(".h-3.w-0\\.5");
      expect(ticks.length).toBe(10); // 1〜10の整数
    });

    it("0.5目盛りが短く表示される（h-1.5クラス）", () => {
      const { container } = render(<GrindSizeSlider name="grindSize" />);
      // 0.5目盛り用のdivを探す
      const halfTicks = container.querySelectorAll(".h-1\\.5.w-px");
      expect(halfTicks.length).toBe(9); // 1.5〜9.5の9個
    });
  });

  describe("インタラクション", () => {
    it("スライダーを動かすとonChangeが呼ばれる", async () => {
      const handleChange = vi.fn();
      render(
        <GrindSizeSlider name="grindSize" onChange={handleChange} value={5} />,
      );

      const slider = screen.getByRole("slider");
      fireEvent.change(slider, { target: { value: "7" } });

      expect(handleChange).toHaveBeenCalledWith(7);
    });

    it("スライダーの値を0.5刻みで変更できる", async () => {
      const handleChange = vi.fn();
      render(
        <GrindSizeSlider
          name="grindSize"
          onChange={handleChange}
          value={5.5}
        />,
      );

      const slider = screen.getByRole("slider");
      fireEvent.change(slider, { target: { value: "6" } });

      expect(handleChange).toHaveBeenCalledWith(6);
    });

    it("クリアボタンをクリックすると値がnullになる", async () => {
      const handleChange = vi.fn();
      render(
        <GrindSizeSlider name="grindSize" onChange={handleChange} value={5} />,
      );

      const clearButton = screen.getByText("クリア");
      await userEvent.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith(null);
    });

    it("外部から値が変更されると表示が更新される", () => {
      const { rerender } = render(
        <GrindSizeSlider name="grindSize" value={3} />,
      );
      expect(screen.getByText("3.0")).toBeInTheDocument();

      rerender(<GrindSizeSlider name="grindSize" value={7.5} />);
      expect(screen.getByText("7.5")).toBeInTheDocument();
    });
  });

  describe("フォーム連携", () => {
    it("hidden inputにname属性が設定される", () => {
      const { container } = render(
        <GrindSizeSlider name="grindSize" value={5} />,
      );
      const hiddenInput = container.querySelector('input[type="hidden"]');
      expect(hiddenInput).toHaveAttribute("name", "grindSize");
    });

    it("hidden inputに現在の値が設定される", () => {
      const { container } = render(
        <GrindSizeSlider name="grindSize" value={5.5} />,
      );
      const hiddenInput = container.querySelector('input[type="hidden"]');
      expect(hiddenInput).toHaveAttribute("value", "5.5");
    });

    it("値がnullの場合、hidden inputの値は空文字", () => {
      const { container } = render(
        <GrindSizeSlider name="grindSize" value={null} />,
      );
      const hiddenInput = container.querySelector('input[type="hidden"]');
      expect(hiddenInput).toHaveAttribute("value", "");
    });
  });

  describe("アクセシビリティ", () => {
    it("スライダーにキーボードでアクセスできる", () => {
      render(<GrindSizeSlider name="grindSize" />);
      const slider = screen.getByRole("slider");
      expect(slider).not.toBeDisabled();
    });

    it("クリアボタンがbutton要素である", () => {
      render(<GrindSizeSlider name="grindSize" value={5} />);
      const clearButton = screen.getByText("クリア");
      expect(clearButton.tagName).toBe("BUTTON");
      expect(clearButton).toHaveAttribute("type", "button");
    });
  });

  describe("境界値", () => {
    it("最小値1が正しく表示される", () => {
      render(<GrindSizeSlider name="grindSize" value={1} />);
      expect(screen.getByText("1.0")).toBeInTheDocument();
    });

    it("最大値10が正しく表示される", () => {
      render(<GrindSizeSlider name="grindSize" value={10} />);
      expect(screen.getByText("10.0")).toBeInTheDocument();
    });

    it("最小の0.5刻み値（1.5）が正しく動作する", async () => {
      const handleChange = vi.fn();
      render(<GrindSizeSlider name="grindSize" onChange={handleChange} />);

      const slider = screen.getByRole("slider");
      fireEvent.change(slider, { target: { value: "1.5" } });

      expect(handleChange).toHaveBeenCalledWith(1.5);
    });

    it("最大の0.5刻み値（9.5）が正しく動作する", async () => {
      const handleChange = vi.fn();
      render(<GrindSizeSlider name="grindSize" onChange={handleChange} />);

      const slider = screen.getByRole("slider");
      fireEvent.change(slider, { target: { value: "9.5" } });

      expect(handleChange).toHaveBeenCalledWith(9.5);
    });
  });
});
