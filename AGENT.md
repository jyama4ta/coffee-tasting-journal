# Coffee Tasting Journal - Agent Instructions

## 最重要ルール（必ず守ること）

### 1. TDD（テスト駆動開発）を必ず実践

**全てのコード修正時は必ず以下の順序で行うこと:**

```
1. Red:      テストを先に書く → テストが失敗することを確認
2. Green:    最小限の実装でテストを通す
3. Refactor: コードを改善（テストは通ったまま）
```

**禁止事項:**

- テストファイル（*.test.ts, *.test.tsx）を削除する
- テストケースを削除してテストを通す
- 実装してからテストを書く

### 2. コミット前の全テスト実行（絶対厳守）

**コミット操作を行う前に、必ず以下のテストを全て実行し、成功を確認すること:**

```bash
npm test                # ユニットテスト（Vitest）
npx playwright test     # E2Eテスト（Playwright）
```

**禁止事項:**

- テストを実行せずにコミットする
- テストが失敗している状態でコミットする
- 一部のテストのみ実行してコミットする

**テスト失敗時は、コミットを中断し修正すること**

### 3. 日本語での対応

- すべてのコミットメッセージ、コメント、ドキュメントは日本語で記述

### 4. ドキュメント同期

- コード変更時は `/docs` 配下の関連ドキュメントも更新
- 特に `test-specification.md` はテスト追加時に必ず更新

### 5. 大規模な変更には事前説明が必要

以下の作業を行う前に、作業内容を説明すること:

- データモデル（Prismaスキーマ）の変更
- 新しい画面・ページの作成
- APIエンドポイントの追加・変更

## 詳細仕様（別ファイル参照）

| ファイル | 内容 |
|---------|------|
| [data-model.instructions.md](.github/instructions/data-model.instructions.md) | データモデル定義 |
| [development.instructions.md](.github/instructions/development.instructions.md) | 開発ガイドライン・TDD詳細 |
| [tech-stack.instructions.md](.github/instructions/tech-stack.instructions.md) | 技術スタック・アーキテクチャ |

## プロジェクト概要

自宅でハンドドリップしたコーヒーの試飲記録を管理するWebアプリケーション。

- **技術スタック**: Next.js (App Router) + TypeScript + SQLite + Prisma
- **運用環境**: 家庭内Docker/Kubernetes環境
- **利用者**: 2〜3人での同時利用を想定

## 開発コマンド

```bash
npm run dev           # 開発サーバー起動
npm test              # ユニットテスト
npx playwright test   # E2Eテスト
npx prisma migrate dev --name <name>  # マイグレーション
npx prisma studio     # DB GUI
```
