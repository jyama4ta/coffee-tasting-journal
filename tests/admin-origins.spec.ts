import { test, expect, TestInfo } from "@playwright/test";

// ユニークな名前を生成するヘルパー
function uniqueName(baseName: string, testInfo: TestInfo): string {
  return `${baseName}_${testInfo.project.name}_${Date.now()}`;
}

test.describe("産地マスター管理画面", () => {
  test.describe("産地一覧ページ", () => {
    test("一覧ページが表示される", async ({ page }) => {
      await page.goto("/admin/origins");
      await expect(
        page.getByRole("heading", { name: /産地マスター一覧/ }),
      ).toBeVisible();
    });

    test("新規登録ボタンが表示される", async ({ page }) => {
      await page.goto("/admin/origins");
      await expect(page.getByRole("link", { name: "新規登録" })).toBeVisible();
    });

    test("登録済みの産地が表示される", async ({ page, request }, testInfo) => {
      const name1 = uniqueName("エチオピア", testInfo);
      const name2 = uniqueName("コロンビア", testInfo);

      await request.post("/api/origins", {
        data: { name: name1, notes: "アフリカの産地" },
      });
      await request.post("/api/origins", {
        data: { name: name2, notes: "南米の産地" },
      });

      await page.goto("/admin/origins");
      await expect(page.locator(`text=${name1}`).first()).toBeAttached();
      await expect(page.locator(`text=${name2}`).first()).toBeAttached();
    });
  });

  test.describe("産地新規登録ページ", () => {
    test("新規登録ページが表示される", async ({ page }) => {
      await page.goto("/admin/origins/new");
      await expect(
        page.getByRole("heading", { name: /産地を新規登録/ }),
      ).toBeVisible();
    });

    test("産地名は必須入力", async ({ page }) => {
      await page.goto("/admin/origins/new");
      const nameInput = page.getByLabel("産地名", { exact: false });
      await expect(nameInput).toHaveAttribute("required");
    });

    test("産地を登録できる", async ({ page }, testInfo) => {
      const name = uniqueName("ブラジル", testInfo);

      await page.goto("/admin/origins/new");
      await page.getByLabel("産地名", { exact: false }).fill(name);
      await page.getByLabel("メモ").fill("南米最大のコーヒー生産国");
      await page.getByRole("button", { name: "登録" }).click();

      await expect(page).toHaveURL("/admin/origins", { timeout: 10000 });
      await expect(page.locator(`text=${name}`).first()).toBeAttached();
    });

    test("重複する産地名は登録できない", async ({
      page,
      request,
    }, testInfo) => {
      const name = uniqueName("インドネシア", testInfo);

      await request.post("/api/origins", {
        data: { name: name },
      });

      await page.goto("/admin/origins/new");
      await page.getByLabel("産地名", { exact: false }).fill(name);
      await page.getByRole("button", { name: "登録" }).click();

      await expect(
        page.getByText(/同じ名前の産地が既に存在します/),
      ).toBeVisible();
    });
  });

  test.describe("産地詳細ページ", () => {
    test("詳細ページが表示される", async ({ page, request }, testInfo) => {
      const name = uniqueName("グアテマラ", testInfo);
      const response = await request.post("/api/origins", {
        data: { name: name, notes: "中米の産地" },
      });
      const origin = await response.json();

      await page.goto(`/admin/origins/${origin.id}`);
      await expect(
        page.getByRole("heading", { name: new RegExp(name) }),
      ).toBeVisible();
      await expect(page.getByText("中米の産地")).toBeVisible();
    });

    test("編集ボタンがある", async ({ page, request }, testInfo) => {
      const name = uniqueName("ケニア", testInfo);
      const response = await request.post("/api/origins", {
        data: { name: name },
      });
      const origin = await response.json();

      await page.goto(`/admin/origins/${origin.id}`);
      await expect(page.getByRole("link", { name: "編集" })).toBeVisible();
    });

    test("削除ボタンがある", async ({ page, request }, testInfo) => {
      const name = uniqueName("ルワンダ", testInfo);
      const response = await request.post("/api/origins", {
        data: { name: name },
      });
      const origin = await response.json();

      await page.goto(`/admin/origins/${origin.id}`);
      await expect(page.getByRole("button", { name: "削除" })).toBeVisible();
    });
  });

  test.describe("産地編集ページ", () => {
    test("編集ページが表示される", async ({ page, request }, testInfo) => {
      const name = uniqueName("コスタリカ", testInfo);
      const response = await request.post("/api/origins", {
        data: { name: name, notes: "高品質な豆で有名" },
      });
      const origin = await response.json();

      await page.goto(`/admin/origins/${origin.id}/edit`);
      await expect(
        page.getByRole("heading", { name: /産地を編集/ }),
      ).toBeVisible();
      await expect(page.getByLabel("産地名", { exact: false })).toHaveValue(
        name,
      );
      await expect(page.getByLabel("メモ")).toHaveValue("高品質な豆で有名");
    });

    test("産地を更新できる", async ({ page, request }, testInfo) => {
      const name = uniqueName("パナマ", testInfo);
      const updatedName = uniqueName("パナマ共和国", testInfo);

      const response = await request.post("/api/origins", {
        data: { name: name },
      });
      const origin = await response.json();

      await page.goto(`/admin/origins/${origin.id}/edit`);
      await page.getByLabel("産地名", { exact: false }).fill(updatedName);
      await page.getByLabel("メモ").fill("ゲイシャで有名");
      await page.getByRole("button", { name: "更新" }).click();

      await expect(page).toHaveURL(`/admin/origins/${origin.id}`);
      await expect(
        page.getByRole("heading", { name: new RegExp(updatedName) }),
      ).toBeVisible();
      await expect(page.getByText("ゲイシャで有名")).toBeVisible();
    });
  });

  test.describe("産地削除", () => {
    test("産地を削除できる", async ({ page, request }, testInfo) => {
      const name = uniqueName("イエメン", testInfo);
      const response = await request.post("/api/origins", {
        data: { name: name },
      });
      const origin = await response.json();

      await page.goto(`/admin/origins/${origin.id}`);

      page.on("dialog", (dialog) => dialog.accept());

      await page.getByRole("button", { name: "削除" }).click();

      await expect(page).toHaveURL("/admin/origins");
      await expect(page.getByText(name)).not.toBeVisible();
    });
  });
});
