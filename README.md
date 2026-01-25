# Coffee Tasting Journal ☕

自宅でハンドドリップしたコーヒーの試飲記録を管理するWebアプリケーション。
産地・銘柄・焙煎具合・挽き方を記録し、味の感想を評価できます。

## 技術スタック

- **フレームワーク**: Next.js (App Router) + TypeScript
- **データベース**: SQLite + Prisma ORM
- **UI**: React + Tailwind CSS
- **テスト**: Vitest + Testing Library

## 開発環境のセットアップ

### 方法1: Dev Container（推奨）

VS Code と Docker がインストールされていれば、Dev Container で簡単に開発環境を構築できます。

1. VS Code で [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) をインストール
2. このリポジトリをクローン
3. VS Code でフォルダを開く
4. コマンドパレット（`Ctrl+Shift+P` / `Cmd+Shift+P`）から「Dev Containers: Reopen in Container」を実行
5. コンテナのビルドが完了したら、開発サーバーを起動:

```bash
npm run dev
```

### 方法2: ローカル環境

Node.js（LTS版推奨）がインストールされている場合:

```bash
# 依存関係のインストール
npm install

# 環境変数ファイルの作成
cp .env.example .env

# Prisma クライアントの生成
npx prisma generate

# データベースのマイグレーション
npx prisma migrate dev

# 開発サーバーの起動
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開くと、アプリケーションが表示されます。

## Docker でデプロイ

本番環境へのデプロイには Docker を使用します。

### イメージのビルド

```bash
docker build -t coffee-tasting-journal:latest .
```

### Docker Compose で起動

```bash
docker-compose up -d
```

データは `coffee-tasting-journal-data` ボリュームに永続化されます。

### 手動で起動する場合

```bash
docker run -d \
  --name coffee-tasting-journal \
  -p 3000:3000 \
  -v coffee-data:/app/data \
  -e DATABASE_URL=file:/app/data/database.db \
  coffee-tasting-journal:latest
```

## 利用可能なスクリプト

```bash
npm run dev          # 開発サーバーの起動
npm run build        # 本番用ビルド
npm run start        # 本番サーバーの起動
npm run lint         # ESLint による静的解析
npm run test         # テストの実行
npm run test:ui      # テストUIの起動
npm run test:coverage # カバレッジレポート付きテスト
npm run db:migrate   # データベースマイグレーション
npm run db:studio    # Prisma Studio の起動（ポート5555）
npm run db:generate  # Prisma クライアントの再生成
```

## ドキュメント

- [データモデル](docs/data-model.md)
- [アーキテクチャ](docs/architecture.md)
- [状態遷移図](docs/state-diagram.md)
- [進捗状況](docs/PROGRESS.md)

## ライセンス

MIT
