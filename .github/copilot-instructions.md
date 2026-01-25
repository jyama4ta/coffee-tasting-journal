# Coffee Tasting Journal - Copilot Instructions

## Project Overview

自宅でハンドドリップしたコーヒーの試飲記録を管理するWebアプリケーション。産地・銘柄・焙煎具合・挽き方を記録し、味の感想を評価できる。

## Deployment Target

- 家庭内のDocker/Kubernetes環境での運用を想定
- セルフホスト可能な軽量構成を優先
- 2~3人での同時利用を想定（Webサーバー1台構成）

## Core Data Model

### Shop (店舗マスター)

購入店の情報を管理。豆の購入時に選択。

- **店舗名 (Shop Name)**: 店舗の名称（必須）
- **住所 (Address)**: 店舗の住所（任意）
- **URL (Website)**: 店舗のWebサイト（任意）
- **メモ (Notes)**: 営業時間や特記事項（任意）

### Dripper (ドリッパーマスター)

使用するドリッパーを管理。試飲記録時に選択。

- **ドリッパー名 (Dripper Name)**: ドリッパーの名称（必須）
- **メーカー (Manufacturer)**: メーカー名（任意）
- **メモ (Notes)**: 特記事項（任意）
- **画像 (Image)**: ドリッパーの写真（任意、ファイルパスで保存）

### Filter (フィルターマスター)

使用するフィルターを管理。試飲記録時に選択。

- **フィルター名 (Filter Name)**: フィルターの名称（必須）
- **種類 (Type)**: ペーパー/金属/布など（任意）
- **メモ (Notes)**: 特記事項（任意）
- **画像 (Image)**: フィルターの写真（任意、ファイルパスで保存）

### Coffee Bean (コーヒー豆マスター)

購入した豆の情報を管理。同じ豆で複数回の試飲記録を作成可能。

- **銘柄 (Bean Name)**: 商品名や農園名（必須）
- **産地 (Origin)**: 豆の産地（例: エチオピア、コロンビア）
- **焙煎度 (Roast Level)**: 8段階選択式
  - ライトロースト (Light Roast) → 浅煎り
  - シナモンロースト (Cinnamon Roast) → 浅煎り
  - ミディアムロースト (Medium Roast) → 中浅煎り
  - ハイロースト (High Roast) → 中煎り
  - シティロースト (City Roast) → 中煎り
  - フルシティロースト (Full City Roast) → 中深煎り
  - フレンチロースト (French Roast) → 深煎り
  - イタリアンロースト (Italian Roast) → 深煎り
  - ※入力は8段階、表示・フィルタリングは5段階（浅煎り/中浅煎り/中煎り/中深煎り/深煎り）にマッピング
- **精製方法 (Process)**: 選択式（任意）
  - ウォッシュド (Washed)
  - ナチュラル (Natural)
  - ハニー (Honey)
  - パルプドナチュラル (Pulped Natural)
  - セミウォッシュド (Semi-Washed)
- **デカフェ (Decaf)**: チェックボックス（デフォルト: オフ）
- **ブレンド/シングル (Blend/Single Origin)**: 選択式
  - シングルオリジン (Single Origin)
  - ブレンド (Blend)
- **メモ (Notes)**: パッケージの説明や店員のおすすめ情報など（任意、フリーテキスト）
- **購入店 (Shop)**: 店舗マスターからの外部キー参照
- **購入日 (Purchase Date)**: 購入日
- **価格 (Price)**: 購入価格（円）
- **購入量 (Amount)**: グラム数（例: 200g、500g）
- **ステータス (Status)**: 在庫中/飲み切り（デフォルト: 在庫中）
- **飲み切り日 (Finished Date)**: 飲み切った日付（任意）
- **画像 (Image)**: 豆のパッケージ写真など（任意、ファイルパスで保存）

### Tasting Entry (試飲記録)

実際にコーヒーを淹れて試飲した記録。豆マスターを参照。

- **豆の参照 (Coffee Bean Reference)**: 豆マスターからの外部キー参照
- **ドリッパー (Dripper)**: ドリッパーマスターからの外部キー参照（任意）
- **フィルター (Filter)**: フィルターマスターからの外部キー参照（任意）
- **挽き方 (Grind Size)**: 数値（1.0-10.0、0.5刻み）- 富士ローヤルみるっこダイヤル準拠
- **抽出日 (Brew Date)**: 記録の作成日
- **酸味 (Acidity)**: 1-5スケール（星評価）
- **苦味 (Bitterness)**: 1-5スケール（星評価）
- **甘味 (Sweetness)**: 1-5スケール（星評価）
- **ボディ (Body)**: 軽い/中程度/重い（選択式）
- **後味 (Aftertaste)**: 1-5スケール（星評価、余韻の長さ）
- **フレーバータグ (Flavor Tags)**: 複数選択可
  - フルーツ系: ベリー、シトラス、トロピカル、ストーンフルーツ
  - ナッツ/甘味系: チョコレート、ナッツ、キャラメル、はちみつ
  - その他: フローラル、スパイス、ハーブ、アーシー
- **総合評価 (Overall Rating)**: 1-5スケール（星評価）
- **テイスティングノート (Notes)**: フリーテキスト
- **画像 (Image)**: 抽出風景やコーヒーの写真（任意、ファイルパスで保存）

### データ関連

- 1つの店舗（Shop）に対して、複数の豆（Coffee Bean）が紐づく（1対多）
- 1つの豆（Coffee Bean）に対して、複数の試飲記録（Tasting Entry）が紐づく（1対多）
- 1つのドリッパー（Dripper）に対して、複数の試飲記録が紐づく（1対多）
- 1つのフィルター（Filter）に対して、複数の試飲記録が紐づく（1対多）
- 試飲記録作成時は、既存の豆・ドリッパー・フィルターマスターから選択
- 豆登録時は、既存の店舗マスターから選択
- 各マスターは独立して管理可能

### 重要な仕様

- **試飲記録作成時の豆選択**: ステータスが「在庫中」の豆のみ表示
- **同一銘柄の扱い**: 同じ銘柄でも購入ごとに別の豆マスターレコードとして管理
- **飲み切り機能**: 豆を飲み切ったらステータスを「飲み切り」に変更（過去の試飲記録は保持）

## Development Guidelines

### Communication

- **言語**: すべての回答・コメント・ドキュメントは日本語で記述すること
- **コミットメッセージ**: 日本語で記載し、それまでの作業内容を説明すること
  - 1行目: 変更の概要（50文字程度）
  - 空行
  - 3行目以降: 変更の詳細（何を、なぜ、どのように変更したか）
  - 例:

    ```
    豆マスターのCRUD APIを実装

    - GET /api/beans: 豆一覧取得（ステータスでのフィルタリング対応）
    - POST /api/beans: 新規豆登録（バリデーション付き）
    - GET /api/beans/[id]: 豆詳細取得（関連する試飲記録も含む）
    - PUT /api/beans/[id]: 豆情報更新
    - DELETE /api/beans/[id]: 豆削除（関連する試飲記録も削除）
    - PATCH /api/beans/[id]/status: ステータス変更（在庫中⇔飲み切り）

    Prisma Clientを使用してタイプセーフなDB操作を実現。
    エラーハンドリングとバリデーションを共通化。
    ```

### Design Process

- **データモデル設計**: 実装前に必ず状態遷移図を作成し、データモデルを明確化すること
- コーディングは状態遷移図のレビュー完了後に開始
- データの整合性とライフサイクルを事前に検証

### Terminal Operations

- **作業ディレクトリ**: プロジェクトルートから移動しないこと（`cd` 禁止）
- **パス指定**: すべて相対パスで指定すること
- **操作範囲**: プロジェクトルート配下のみ操作可能（外部ディレクトリへの操作禁止）
- **エラー発生時の対応**:
  1. コマンドが失敗した場合、まず原因を分析する
  2. 原因と、それを踏まえた次のコマンドについて説明する
  3. ユーザーの許可を得てから次のコマンドを実行する
  4. 同じエラーを繰り返さないよう、根本原因を解決する

### Testing Strategy

- **テスト駆動開発 (TDD)**: 必ず実践すること
- **t_wadaの原則を厳守**:
  - テストコードは最初に書く（Red → Green → Refactor）
  - テストしやすい設計を優先
  - テストの可読性を重視（テストコードも製品コード）
  - 適切な粒度でのテスト分割
- 各機能実装前にテストケースを定義し、テストが失敗することを確認してから実装

### Documentation

- **ドキュメント管理**: `/docs` フォルダ配下で一元管理
- **同期更新**: ソースコード修正時は関連ドキュメントも必ず更新すること
- 状態遷移図、API仕様、アーキテクチャ図などを含む
- **ドキュメント構成**:
  - `PROGRESS.md`: 開発進捗メモ（完了した作業、TODO、技術的課題）
  - `api-specification.md`: API仕様書（エンドポイント、データモデル、バリデーション）
  - `test-specification.md`: テスト仕様書（テストケース一覧、テスト設計方針）
  - `data-model.md`: ER図とエンティティ詳細
  - `state-diagram.md`: 状態遷移図とバリデーションルール
  - `architecture.md`: システムアーキテクチャ設計
- **API実装時の更新ルール**:
  1. 新規API実装時は`api-specification.md`にエンドポイント仕様を追加
  2. テスト作成時は`test-specification.md`にテストケース一覧を追加
  3. 機能完了時は`PROGRESS.md`の完了作業に記録し、TODOを更新

### Tech Stack

- **フレームワーク**: Next.js (App Router) - TypeScript
- **データベース**: SQLite + Prisma ORM
- **UI**: React + Tailwind CSS（または好みのCSSフレームワーク）
- **コンテナ化**: Dockerfile + docker-compose.yml
- **データ永続化**: Dockerボリュームで`/app/data/database.db`をマウント

### Architecture Decisions

- 単一Dockerイメージで完結（Next.jsがフロント・バックエンド両方を提供）
- API RoutesでRESTful API実装 (`/api/tastings/*`)
- Prisma Clientでタイプセーフなデータベースアクセス
- SQLiteファイルはボリュームマウントでホスト側に永続化
- **画像保存**: ファイルシステムに保存、DBにはパスのみ記録（SQLite肖大化防止）
  - 保存先: `/app/data/images/{beans,drippers,filters,tastings}/`
  - Dockerボリュームでホスト側に永続化

### Implementation Priorities

1. **CRUD機能**: 試飲記録の作成・表示・編集・削除
2. **フィルタリング・検索**: 産地、焙煎度、評価などでの絞り込み
3. **シンプルなUI**: 記録の入力と一覧表示に最適化
4. **データ永続化**: Dockerボリュームまたは外部ストレージでのデータ保持
5. **入力支援**: 産地・銘柄の入力時に過去の入力履歴からオートコンプリート表示

### Directory Structure

```
/app                    # Next.js App Router
  /api/tastings         # API Routes (CRUD endpoints)
  /tastings             # UI Pages (list, create, edit)
/components             # React components
/lib                    # Utilities, Prisma client
/prisma                 # Prisma schema, migrations
/public                 # Static assets
Dockerfile              # Container definition
docker-compose.yml      # Development environment
```

### Development Workflow

- `npm run dev`: 開発サーバー起動（ホットリロード有効）
- `npx prisma migrate dev`: マイグレーション実行
- `npx prisma studio`: データベースGUI（開発時のデバッグ用）
- `docker-compose up`: 本番相当環境での動作確認

### Key Commands

```bash
# 初期セットアップ
npm install
npx prisma migrate dev --name init
npm run dev

# Docker実行
docker-compose up --build
```

### Future Enhancements

- データのエクスポート/インポート
- 抽出レシピの記録（湯温、蒸らし時間など）
