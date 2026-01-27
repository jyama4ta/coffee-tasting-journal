import { test, expect } from "@playwright/test";

test.describe("コーヒー豆一覧ページ", () => {
  test.describe("デスクトップ表示", () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test("ページが正常に表示される", async ({ page }) => {
      await page.goto("/beans");

      // ページタイトルが表示される
      await expect(page.locator("h1")).toContainText("コーヒー豆一覧");

      // テーブルが存在する場合は表示される（データがある場合）
      const tableContainer = page.locator('[data-testid="beans-table"]');
      const cardsContainer = page.locator('[data-testid="beans-cards"]');

      // テーブルまたはカードが存在すれば、デスクトップではテーブルが表示
      if ((await tableContainer.count()) > 0) {
        await expect(tableContainer).toBeVisible();
        await expect(cardsContainer).toBeHidden();
      }
    });

    test("新規登録ボタンが表示される", async ({ page }) => {
      await page.goto("/beans");

      // 新規登録ボタンが表示される（最初の1つを確認）
      const newButton = page.locator('a[href="/beans/new"]').first();
      await expect(newButton).toBeVisible();
    });
  });

  test.describe("モバイル表示", () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test("ページが正常に表示される", async ({ page }) => {
      await page.goto("/beans");

      // ページタイトルが表示される
      await expect(page.locator("h1")).toContainText("コーヒー豆一覧");

      // カードが存在する場合は表示される（データがある場合）
      const tableContainer = page.locator('[data-testid="beans-table"]');
      const cardsContainer = page.locator('[data-testid="beans-cards"]');

      // カードまたはテーブルが存在すれば、モバイルではカードが表示
      if ((await cardsContainer.count()) > 0) {
        await expect(cardsContainer).toBeVisible();
        await expect(tableContainer).toBeHidden();
      }
    });

    test("フィルタータブが正常に表示される", async ({ page }) => {
      await page.goto("/beans");

      // フィルタータブが表示される（ナビゲーション内ではなく、フィルター用のリンク）
      // フィルタータブはステータスフィルタリング用
      await expect(
        page.locator('a[href="/beans?status=IN_STOCK"]'),
      ).toBeVisible();
      await expect(
        page.locator('a[href="/beans?status=FINISHED"]'),
      ).toBeVisible();
    });
  });
});

test.describe("店舗一覧ページ", () => {
  test.describe("デスクトップ表示", () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test("ページが正常に表示される", async ({ page }) => {
      await page.goto("/shops");

      // ページタイトルが表示される
      await expect(page.locator("h1")).toContainText("店舗一覧");

      // テーブルが存在する場合は表示される（データがある場合）
      const tableContainer = page.locator('[data-testid="shops-table"]');
      const cardsContainer = page.locator('[data-testid="shops-cards"]');

      // テーブルまたはカードが存在すれば、デスクトップではテーブルが表示
      if ((await tableContainer.count()) > 0) {
        await expect(tableContainer).toBeVisible();
        await expect(cardsContainer).toBeHidden();
      }
    });

    test("新規登録ボタンが表示される", async ({ page }) => {
      await page.goto("/shops");

      // 新規登録ボタンが表示される（最初の1つを確認）
      const newButton = page.locator('a[href="/shops/new"]').first();
      await expect(newButton).toBeVisible();
    });
  });

  test.describe("モバイル表示", () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test("ページが正常に表示される", async ({ page }) => {
      await page.goto("/shops");

      // ページタイトルが表示される
      await expect(page.locator("h1")).toContainText("店舗一覧");

      // カードが存在する場合は表示される（データがある場合）
      const tableContainer = page.locator('[data-testid="shops-table"]');
      const cardsContainer = page.locator('[data-testid="shops-cards"]');

      // カードまたはテーブルが存在すれば、モバイルではカードが表示
      if ((await cardsContainer.count()) > 0) {
        await expect(cardsContainer).toBeVisible();
        await expect(tableContainer).toBeHidden();
      }
    });

    test("新規登録ボタンが表示される", async ({ page }) => {
      await page.goto("/shops");

      // 新規登録ボタンが表示される（最初の1つを確認）
      const newButton = page.locator('a[href="/shops/new"]').first();
      await expect(newButton).toBeVisible();
    });
  });
});

test.describe("豆詳細ページ", () => {
  test.describe("モバイル表示", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("詳細ページへのナビゲーションが機能する", async ({ page }) => {
      // 豆一覧ページへアクセス
      await page.goto("/beans");

      // 豆の詳細リンクがあるか確認
      const beanLinks = page.locator(
        '[data-testid="beans-cards"] a, [data-testid="beans-table"] a[href^="/beans/"]',
      );
      const linkCount = await beanLinks.count();

      if (linkCount > 0) {
        // 最初の豆の詳細ページへ
        await beanLinks.first().click();
        await page.waitForURL(/\/beans\/\d+$/);

        // ボタンコンテナが存在する
        const buttonContainer = page.locator('[data-testid="action-buttons"]');
        await expect(buttonContainer).toBeVisible();
      }
    });
  });

  test.describe("デスクトップ表示", () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test("詳細ページが正常に表示される", async ({ page }) => {
      await page.goto("/beans");

      // 豆の詳細リンクがあるか確認
      const beanLinks = page.locator(
        '[data-testid="beans-table"] a[href^="/beans/"]:not([href*="edit"])',
      );
      const linkCount = await beanLinks.count();

      if (linkCount > 0) {
        await beanLinks.first().click();
        await page.waitForURL(/\/beans\/\d+$/);

        // ボタンコンテナが存在する
        const buttonContainer = page.locator('[data-testid="action-buttons"]');
        await expect(buttonContainer).toBeVisible();
      }
    });
  });
});

// 追加テスト: 基本的なナビゲーション（デスクトップのみ）
test.describe("ナビゲーション", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("ホームページからの各ページへの遷移", async ({ page }) => {
    await page.goto("/");

    // ナビゲーションリンクが存在する（デスクトップでは常に表示）
    await expect(page.locator('a[href="/beans"]').first()).toBeVisible();
    await expect(page.locator('a[href="/shops"]').first()).toBeVisible();
    await expect(page.locator('a[href="/tastings"]').first()).toBeVisible();
  });
});
