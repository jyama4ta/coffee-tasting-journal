import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StarRating from "@/components/StarRating";

describe("StarRating", () => {
  describe("表示", () => {
    it("5つの星アイコンが表示される", () => {
      render(<StarRating name="rating" label="評価" />);
      const stars = screen.getAllByRole("radio");
      expect(stars).toHaveLength(5);
    });

    it("ラベルが表示される", () => {
      render(<StarRating name="rating" label="酸味" />);
      expect(screen.getByText("酸味")).toBeInTheDocument();
    });

    it("指定された値がハイライトされる", () => {
      render(<StarRating name="rating" label="評価" value={3} />);
      const stars = screen.getAllByRole("radio");
      // 1, 2, 3番目の星がチェック済み（checked）として表示
      expect(stars[0]).toHaveAttribute("aria-checked", "true");
      expect(stars[1]).toHaveAttribute("aria-checked", "true");
      expect(stars[2]).toHaveAttribute("aria-checked", "true");
      expect(stars[3]).toHaveAttribute("aria-checked", "false");
      expect(stars[4]).toHaveAttribute("aria-checked", "false");
    });

    it("valueがnullの場合、全ての星がハイライトされない", () => {
      render(<StarRating name="rating" label="評価" value={null} />);
      const stars = screen.getAllByRole("radio");
      stars.forEach((star) => {
        expect(star).toHaveAttribute("aria-checked", "false");
      });
    });

    it("valueが0の場合、全ての星がハイライトされない", () => {
      render(<StarRating name="rating" label="評価" value={0} />);
      const stars = screen.getAllByRole("radio");
      stars.forEach((star) => {
        expect(star).toHaveAttribute("aria-checked", "false");
      });
    });

    it("星アイコンが5つ並んで表示される", () => {
      render(<StarRating name="rating" label="評価" />);
      // アイコンが表示されていることを確認（アクセシブルな名前で）
      expect(screen.getByLabelText("1")).toBeInTheDocument();
      expect(screen.getByLabelText("2")).toBeInTheDocument();
      expect(screen.getByLabelText("3")).toBeInTheDocument();
      expect(screen.getByLabelText("4")).toBeInTheDocument();
      expect(screen.getByLabelText("5")).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("星をクリックするとonChangeが呼ばれる", async () => {
      const handleChange = vi.fn();
      render(<StarRating name="rating" label="評価" onChange={handleChange} />);

      const star3 = screen.getByLabelText("3");
      await userEvent.click(star3);

      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it("2つ目の星をクリックすると値が2になる", async () => {
      const handleChange = vi.fn();
      render(<StarRating name="rating" label="評価" onChange={handleChange} />);

      const star2 = screen.getByLabelText("2");
      await userEvent.click(star2);

      expect(handleChange).toHaveBeenCalledWith(2);
    });

    it("同じ星を再度クリックすると値がクリアされる", async () => {
      const handleChange = vi.fn();
      render(
        <StarRating
          name="rating"
          label="評価"
          value={3}
          onChange={handleChange}
        />,
      );

      const star3 = screen.getByLabelText("3");
      await userEvent.click(star3);

      expect(handleChange).toHaveBeenCalledWith(null);
    });

    it("minValue=0のとき、同じ星を再度クリックすると0にリセットされる", async () => {
      const handleChange = vi.fn();
      render(
        <StarRating
          name="rating"
          label="評価"
          value={3}
          onChange={handleChange}
          minValue={0}
        />,
      );

      const star3 = screen.getByLabelText("3");
      await userEvent.click(star3);

      expect(handleChange).toHaveBeenCalledWith(0);
    });

    it("ホバー時に星がハイライトされる", async () => {
      render(<StarRating name="rating" label="評価" />);

      const star3 = screen.getByLabelText("3");
      fireEvent.mouseEnter(star3);

      // ホバー状態のクラスが適用されていることを確認
      const container = star3.closest('[data-testid="star-container"]');
      expect(container).toHaveAttribute("data-hover", "3");
    });

    it("マウスが離れるとホバーハイライトが消える", async () => {
      render(<StarRating name="rating" label="評価" />);

      const star3 = screen.getByLabelText("3");
      fireEvent.mouseEnter(star3);
      fireEvent.mouseLeave(star3);

      const container = star3.closest('[data-testid="star-container"]');
      expect(container).toHaveAttribute("data-hover", "0");
    });
  });

  describe("フォーム連携", () => {
    it("隠しinputに値が設定される", () => {
      render(<StarRating name="rating" label="評価" value={4} />);
      const hiddenInput = document.querySelector(
        'input[name="rating"][type="hidden"]',
      );
      expect(hiddenInput).toHaveValue("4");
    });

    it("valueがnullの場合、隠しinputは空文字", () => {
      render(<StarRating name="rating" label="評価" value={null} />);
      const hiddenInput = document.querySelector(
        'input[name="rating"][type="hidden"]',
      );
      expect(hiddenInput).toHaveValue("");
    });

    it("valueが0の場合、隠しinputは0", () => {
      render(<StarRating name="rating" label="評価" value={0} />);
      const hiddenInput = document.querySelector(
        'input[name="rating"][type="hidden"]',
      );
      expect(hiddenInput).toHaveValue("0");
    });
  });

  describe("アクセシビリティ", () => {
    it("キーボードでの操作が可能（ArrowRight）", async () => {
      const handleChange = vi.fn();
      render(
        <StarRating
          name="rating"
          label="評価"
          value={2}
          onChange={handleChange}
        />,
      );

      const star2 = screen.getByLabelText("2");
      star2.focus();
      await userEvent.keyboard("{ArrowRight}");

      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it("キーボードでの操作が可能（ArrowLeft）", async () => {
      const handleChange = vi.fn();
      render(
        <StarRating
          name="rating"
          label="評価"
          value={3}
          onChange={handleChange}
        />,
      );

      const star3 = screen.getByLabelText("3");
      star3.focus();
      await userEvent.keyboard("{ArrowLeft}");

      expect(handleChange).toHaveBeenCalledWith(2);
    });

    it("minValue=0のとき、ArrowLeftで0に移動できる", async () => {
      const handleChange = vi.fn();
      render(
        <StarRating
          name="rating"
          label="評価"
          value={1}
          onChange={handleChange}
          minValue={0}
        />,
      );

      const star1 = screen.getByLabelText("1");
      star1.focus();
      await userEvent.keyboard("{ArrowLeft}");

      expect(handleChange).toHaveBeenCalledWith(0);
    });

    it("適切なrole属性が設定されている", () => {
      render(<StarRating name="rating" label="評価" />);
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("aria-labelでグループラベルが設定されている", () => {
      render(<StarRating name="rating" label="酸味" />);
      expect(screen.getByRole("radiogroup")).toHaveAccessibleName("酸味");
    });
  });

  describe("カスタマイズ", () => {
    it("iconプロパティでアイコンをカスタマイズできる", () => {
      render(<StarRating name="rating" label="評価" icon="bean" />);
      // 豆アイコンが表示されていることを確認
      const stars = screen.getAllByTestId("bean-icon");
      expect(stars).toHaveLength(5);
    });

    it("デフォルトは星アイコン", () => {
      render(<StarRating name="rating" label="評価" />);
      const stars = screen.getAllByTestId("star-icon");
      expect(stars).toHaveLength(5);
    });
  });
});
