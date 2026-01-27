import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import StatsPage from "@/app/stats/page";

// Prismaのモック
vi.mock("@/lib/prisma", () => ({
  prisma: {
    shop: {
      count: vi.fn(),
    },
    dripper: {
      count: vi.fn(),
    },
    filter: {
      count: vi.fn(),
    },
    coffeeBean: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    tastingEntry: {
      count: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    tastingNote: {
      count: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("StatsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 基本的なカウントのモック
    vi.mocked(prisma.shop.count).mockResolvedValue(3);
    vi.mocked(prisma.dripper.count).mockResolvedValue(2);
    vi.mocked(prisma.filter.count).mockResolvedValue(4);
    vi.mocked(prisma.coffeeBean.count).mockResolvedValue(10);
    vi.mocked(prisma.tastingEntry.count).mockResolvedValue(25);
    vi.mocked(prisma.tastingNote.count).mockResolvedValue(30);

    // 平均評価のモック
    vi.mocked(prisma.tastingNote.aggregate).mockResolvedValue({
      _avg: { overallRating: 3.8 },
      _count: 30,
      _sum: {},
      _min: {},
      _max: {},
    });

    // よく使う豆ランキングのモック
    vi.mocked(prisma.coffeeBean.findMany).mockResolvedValue([
      {
        id: 1,
        name: "エチオピア イルガチェフェ",
        _count: { tastingEntries: 5 },
      },
      { id: 2, name: "コロンビア スプレモ", _count: { tastingEntries: 4 } },
      { id: 3, name: "ブラジル サントス", _count: { tastingEntries: 3 } },
    ] as any);

    // 最近のドリップ記録のモック
    vi.mocked(prisma.tastingEntry.findMany).mockResolvedValue([]);
  });

  it("ページタイトルが表示される", async () => {
    const page = await StatsPage();
    render(page);

    expect(screen.getByText("📊 統計")).toBeInTheDocument();
  });

  it("基本統計が表示される", async () => {
    const page = await StatsPage();
    render(page);

    // 各カウントが表示される
    expect(screen.getByText("ドリップ記録")).toBeInTheDocument();
    expect(screen.getAllByText("コーヒー豆").length).toBeGreaterThan(0);
    expect(screen.getByText("店舗")).toBeInTheDocument();
    expect(screen.getByText("ドリッパー")).toBeInTheDocument();
    expect(screen.getByText("フィルター")).toBeInTheDocument();
  });

  it("テイスティングノート数が表示される", async () => {
    const page = await StatsPage();
    render(page);

    expect(screen.getByText("テイスティングノート")).toBeInTheDocument();
  });

  it("平均評価が表示される", async () => {
    const page = await StatsPage();
    render(page);

    expect(screen.getByText("平均評価")).toBeInTheDocument();
    expect(screen.getByText("3.8")).toBeInTheDocument();
  });

  it("よく使う豆ランキングが表示される", async () => {
    const page = await StatsPage();
    render(page);

    expect(screen.getByText("🏆 よく使うコーヒー豆 TOP3")).toBeInTheDocument();
    expect(screen.getByText("エチオピア イルガチェフェ")).toBeInTheDocument();
    expect(screen.getByText("コロンビア スプレモ")).toBeInTheDocument();
    expect(screen.getByText("ブラジル サントス")).toBeInTheDocument();
  });
});
