# Coffee Tasting Journal - Copilot Instructions

## 最重要ルール（必ず守ること）

### 1. TDD（テスト駆動開発）を必ず実践

**新機能・コンポーネント実装時は必ず以下の順序で行うこと:**

```
1. Red:      テストを先に書く → テストが失敗することを確認
2. Green:    最小限の実装でテストを通す
3. Refactor: コードを改善（テストは通ったまま）
```

**禁止事項:**
```
❌ 実装してからテストを書く
❌ テストを書かずに実装を完了する
```

**必須フロー:**
```
✅ テストファイル作成 → テスト失敗確認 → 実装 → テスト成功確認
```

### 2. 日本語での対応

- すべての回答・コメント・ドキュメントは**日本語**で記述
- コミットメッセージも日本語

### 3. ドキュメント同期

- コード変更時は `/docs` 配下の関連ドキュメントも更新
- 特に `test-specification.md` はテスト追加時に必ず更新

## 詳細仕様（別ファイル参照）

| ファイル | 内容 |
|---------|------|
| [data-model.instructions.md](instructions/data-model.instructions.md) | データモデル定義 |
| [development.instructions.md](instructions/development.instructions.md) | 開発ガイドライン・TDD詳細 |
| [tech-stack.instructions.md](instructions/tech-stack.instructions.md) | 技術スタック・アーキテクチャ |

## プロジェクト概要

自宅でハンドドリップしたコーヒーの試飲記録を管理するWebアプリケーション。
産地・銘柄・焙煎具合・挽き方を記録し、味の感想を評価できる。

- **技術スタック**: Next.js (App Router) + TypeScript + SQLite + Prisma
- **運用環境**: 家庭内Docker/Kubernetes環境
- **利用者**: 2〜3人での同時利用を想定
