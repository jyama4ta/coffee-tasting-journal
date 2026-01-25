# API 仕様書

## 概要

Coffee Tasting JournalのREST API仕様書です。全てのAPIは`/api`配下に配置されます。

## 共通仕様

### レスポンス形式

- 成功時: JSON形式でデータを返却
- エラー時: `{ "error": "エラーメッセージ" }` 形式

### HTTPステータスコード

| コード | 意味                                   |
| ------ | -------------------------------------- |
| 200    | 成功（GET, PUT）                       |
| 201    | 作成成功（POST）                       |
| 204    | 削除成功（DELETE）                     |
| 400    | リクエスト不正（バリデーションエラー） |
| 404    | リソースが見つからない                 |
| 500    | サーバーエラー                         |

---

## Shop API（店舗マスター）

コーヒー豆の購入店舗を管理するAPI。

### エンドポイント一覧

| メソッド | パス              | 説明         |
| -------- | ----------------- | ------------ |
| GET      | `/api/shops`      | 店舗一覧取得 |
| POST     | `/api/shops`      | 店舗作成     |
| GET      | `/api/shops/[id]` | 店舗詳細取得 |
| PUT      | `/api/shops/[id]` | 店舗更新     |
| DELETE   | `/api/shops/[id]` | 店舗削除     |

### データモデル

```typescript
interface Shop {
  id: number; // 店舗ID（自動採番）
  name: string; // 店舗名（必須）
  address: string | null; // 住所
  url: string | null; // WebサイトURL
  notes: string | null; // メモ
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
}
```

### GET /api/shops

全ての店舗を取得します。

**レスポンス例:**

```json
[
  {
    "id": 1,
    "name": "スペシャルティコーヒー店",
    "address": "東京都渋谷区...",
    "url": "https://example.com",
    "notes": "駅から徒歩5分",
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z"
  }
]
```

### POST /api/shops

新しい店舗を作成します。

**リクエストボディ:**

```json
{
  "name": "新店舗名", // 必須
  "address": "住所", // 任意
  "url": "https://...", // 任意
  "notes": "メモ" // 任意
}
```

**バリデーション:**

- `name`: 必須、空文字不可

**レスポンス:** 201 Created + 作成された店舗データ

### GET /api/shops/[id]

指定したIDの店舗を取得します。

**パラメータ:**

- `id`: 店舗ID（数値）

**エラー:**

- 400: IDが数値でない場合
- 404: 店舗が存在しない場合

### PUT /api/shops/[id]

店舗情報を更新します。

**リクエストボディ:**

```json
{
  "name": "更新後の名前", // 任意（指定時は空文字不可）
  "address": "更新後の住所", // 任意
  "url": "https://...", // 任意
  "notes": "更新後のメモ" // 任意
}
```

**バリデーション:**

- `name`: 指定する場合は空文字不可

**エラー:**

- 400: IDが数値でない、または名前が空の場合
- 404: 店舗が存在しない場合

### DELETE /api/shops/[id]

店舗を削除します。

**レスポンス:** 204 No Content

**エラー:**

- 400: IDが数値でない場合
- 404: 店舗が存在しない場合

**注意:** 削除された店舗に紐づくコーヒー豆の`shopId`は`null`に設定されます（`onDelete: SetNull`）。

---

## Dripper API（ドリッパーマスター）

_（未実装）_

## Filter API（フィルターマスター）

_（未実装）_

## CoffeeBean API（コーヒー豆マスター）

_（未実装）_

## TastingEntry API（試飲記録）

_（未実装）_
