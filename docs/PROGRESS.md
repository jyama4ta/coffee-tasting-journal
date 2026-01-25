# 開発進捗メモ

## 完了した作業

### 2026-01-25: CoffeeBean API 実装（TDD）

1. **CoffeeBean API 実装（TDD: Red → Green → Refactor）**
   - `src/__tests__/api/beans.test.ts`: 24テストケース作成
   - `src/app/api/beans/route.ts`: GET（一覧・フィルタリング）/ POST（作成）
   - `src/app/api/beans/[id]/route.ts`: GET（詳細・関連データ含む）/ PUT（更新）/ PATCH（ステータス変更）/ DELETE（削除）
   - RoastLevel（8段階）、Process（5種類）、BeanStatus（2種類）のバリデーション実装
   - ステータス変更時のfinishedDate自動設定/クリア機能
   - 関連エンティティ（shop, tastingEntries）のinclude対応
   - 全24テストがパス

### 2026-01-25: Filter API 実装（TDD）

1. **Filter API 実装（TDD: Red → Green → Refactor）**
   - `src/__tests__/api/filters.test.ts`: 16テストケース作成
   - `src/app/api/filters/route.ts`: GET（一覧）/ POST（作成）
   - `src/app/api/filters/[id]/route.ts`: GET（詳細）/ PUT（更新）/ DELETE（削除）
   - FilterType（PAPER/METAL/CLOTH）のバリデーション実装
   - 全16テストがパス

### 2026-01-25: Dripper API 実装（TDD）

1. **Dripper API 実装（TDD: Red → Green → Refactor）**
   - `src/__tests__/api/drippers.test.ts`: 14テストケース作成
   - `src/app/api/drippers/route.ts`: GET（一覧）/ POST（作成）
   - `src/app/api/drippers/[id]/route.ts`: GET（詳細）/ PUT（更新）/ DELETE（削除）
   - 全14テストがパス

### 2026-01-25: Shop API 実装（TDD）

1. **データベースマイグレーション実行**
   - `prisma.config.ts`の設定を修正（`migrate.url` → `datasource.url`）
   - `npx prisma migrate dev --name init` 実行成功
   - SQLiteデータベースが`data/database.db`に作成

2. **Prismaアダプター設定修正**
   - `@prisma/adapter-better-sqlite3`に変更（Vitest環境での互換性向上）
   - `src/lib/prisma.ts`でbetter-sqlite3アダプターを使用

3. **Shop API 実装（TDD: Red → Green → Refactor）**
   - `src/__tests__/api/shops.test.ts`: 14テストケース作成
   - `src/app/api/shops/route.ts`: GET（一覧）/ POST（作成）
   - `src/app/api/shops/[id]/route.ts`: GET（詳細）/ PUT（更新）/ DELETE（削除）
   - 全14テストがパス

### 2026-01-23: プロジェクト初期化

1. **プロジェクト要件定義**
   - コーヒー試飲記録アプリの要件を策定
   - データモデル（Shop, Dripper, Filter, CoffeeBean, TastingEntry）を設計
   - 焙煎度8段階、精製方法5種類、フレーバータグ12種類を定義

2. **ドキュメント作成**
   - `.github/copilot-instructions.md`: AI Copilot用の開発ガイドライン
   - `docs/data-model.md`: ER図とエンティティ詳細
   - `docs/state-diagram.md`: 状態遷移図とバリデーションルール
   - `docs/architecture.md`: システムアーキテクチャ設計

3. **Next.js プロジェクト初期化**
   - Next.js 16.1.4 (App Router) + TypeScript
   - Tailwind CSS 4.x
   - ESLint設定

4. **Prisma 7.x セットアップ**
   - `prisma/schema.prisma`: 5モデル、7 enum定義
   - `prisma.config.ts`: Prisma 7.x用の設定ファイル（新形式）
   - `src/lib/prisma.ts`: PrismaClient初期化（libSQLアダプター使用）
   - `@prisma/adapter-libsql`, `@libsql/client` インストール済み

5. **テスト環境セットアップ**
   - Vitest + @testing-library/react
   - `vitest.config.ts`: テスト設定
   - `src/__tests__/setup.ts`: テストセットアップファイル

6. **開発環境設定**
   - `mise.toml`: Node.js LTS バージョン管理
   - `.env.example`: 環境変数サンプル
   - `.gitignore`: 適切な除外設定

## 継続作業（TODO）

### 優先度: 高

1. **TDD: TastingEntry API**
   - 試飲記録のCRUD API
   - 豆選択時は在庫中のみ表示

### 優先度: 中

2. **UI実装**
   - ホーム画面
   - 各マスターの一覧・詳細・編集画面
   - 試飲記録の入力・一覧画面

3. **Docker化**
   - Dockerfile作成
   - docker-compose.yml作成

## 技術的な課題

### 解決済み: Prisma 7.x 移行対応

Prisma 7.xでは以下の変更が必要だった:

1. `schema.prisma`から`url`プロパティを削除
2. `prisma.config.ts`で`datasource.url`を設定（`migrate.url()`ではなく）
3. PrismaClientには`@prisma/adapter-better-sqlite3`アダプター経由で接続

現在の設定:

- `prisma.config.ts`: `datasource.url`で環境変数またはデフォルトパスから取得
- `src/lib/prisma.ts`: better-sqlite3アダプターでPrismaClientを初期化

## コマンドメモ

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# マイグレーション実行（要修正）
npm run db:migrate

# Prisma Studio（DB確認）
npm run db:studio
```
