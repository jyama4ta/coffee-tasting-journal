# 開発進捗メモ

## 完了した作業

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

1. **データベースマイグレーション実行**
   - `npx prisma migrate dev --name init` を実行
   - Prisma 7.xの新しい設定方法でエラーが発生中
   - `prisma.config.ts`の`datasource.url`設定を確認・修正

2. **TDD開始: Shop API**
   - `src/__tests__/api/shops.test.ts`: 店舗CRUD APIのテスト作成
   - テストが失敗することを確認（Red）
   - `src/app/api/shops/route.ts`: 実装（Green）
   - リファクタリング（Refactor）

### 優先度: 中

3. **TDD: Dripper/Filter API**
   - ドリッパー・フィルターマスターのCRUD API

4. **TDD: CoffeeBean API**
   - 豆マスターのCRUD API
   - ステータス変更API（在庫中⇔飲み切り）
   - 産地オートコンプリートAPI

5. **TDD: TastingEntry API**
   - 試飲記録のCRUD API
   - 豆選択時は在庫中のみ表示

### 優先度: 低

6. **UI実装**
   - ホーム画面
   - 各マスターの一覧・詳細・編集画面
   - 試飲記録の入力・一覧画面

7. **Docker化**
   - Dockerfile作成
   - docker-compose.yml作成

## 技術的な課題

### Prisma 7.x 移行対応

Prisma 7.xでは以下の変更が必要:

1. `schema.prisma`から`url`プロパティを削除
2. `prisma.config.ts`でマイグレーション用URLを設定
3. PrismaClientにはアダプター経由で接続

現在の設定:
- `prisma.config.ts`: migrate.url()で環境変数から取得
- `src/lib/prisma.ts`: libSQLアダプターでPrismaClientを初期化

エラー: `The datasource.url property is required in your Prisma config file when using prisma db push`

→ `prisma.config.ts`の設定を見直す必要あり

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
