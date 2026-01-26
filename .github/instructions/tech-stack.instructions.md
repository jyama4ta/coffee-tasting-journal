# 技術スタック・アーキテクチャ

このファイルはCoffee Tasting Journalの技術スタックとアーキテクチャを定義します。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js (App Router) - TypeScript |
| データベース | SQLite + Prisma ORM |
| UI | React + Tailwind CSS |
| テスト | Vitest + @testing-library/react |
| コンテナ | Docker + docker-compose |

## アーキテクチャ

### 基本方針

- 単一Dockerイメージで完結（Next.jsがフロント・バックエンド両方を提供）
- API RoutesでRESTful API実装 (`/api/*`)
- Prisma Clientでタイプセーフなデータベースアクセス
- SQLiteファイルはボリュームマウントでホスト側に永続化

### 画像保存

- ファイルシステムに保存、DBにはパスのみ記録（SQLite肥大化防止）
- 保存先: `/app/data/images/{beans,drippers,filters,tastings}/`
- Dockerボリュームでホスト側に永続化

### データ永続化

- Dockerボリュームで`/app/data/database.db`をマウント

## ディレクトリ構成

```
/src
  /app                  # Next.js App Router
    /api/*              # API Routes (CRUD endpoints)
    /beans              # 豆管理ページ
    /shops              # 店舗管理ページ
    /drippers           # ドリッパー管理ページ
    /filters            # フィルター管理ページ
    /tastings           # 試飲記録ページ
  /components           # React components
  /lib                  # Utilities, Prisma client
  /__tests__            # テストファイル
/prisma                 # Prisma schema, migrations
/public                 # Static assets
/docs                   # ドキュメント
Dockerfile              # Container definition
docker-compose.yml      # Development environment
```

## 開発ワークフロー

### コマンド

```bash
# 開発サーバー起動（ホットリロード有効）
npm run dev

# テスト実行
npm test

# マイグレーション実行
npx prisma migrate dev

# データベースGUI（開発時のデバッグ用）
npx prisma studio

# 本番相当環境での動作確認
docker-compose up --build
```

### 初期セットアップ

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

## デプロイ環境

- **運用環境**: 家庭内のDocker/Kubernetes環境
- **利用者**: 2〜3人での同時利用を想定
- **構成**: セルフホスト可能な軽量構成（Webサーバー1台）

## 将来の拡張予定

- データのエクスポート/インポート
- 抽出レシピの記録（湯温、蒸らし時間など）
