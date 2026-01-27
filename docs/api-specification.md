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

ドリッパーを管理するAPI。

### エンドポイント一覧

| メソッド | パス                 | 説明               |
| -------- | -------------------- | ------------------ |
| GET      | `/api/drippers`      | ドリッパー一覧取得 |
| POST     | `/api/drippers`      | ドリッパー作成     |
| GET      | `/api/drippers/[id]` | ドリッパー詳細取得 |
| PUT      | `/api/drippers/[id]` | ドリッパー更新     |
| DELETE   | `/api/drippers/[id]` | ドリッパー削除     |

### データモデル

```typescript
interface Dripper {
  id: number; // ドリッパーID（自動採番）
  name: string; // ドリッパー名（必須）
  manufacturer: string | null; // メーカー名
  notes: string | null; // メモ
  imagePath: string | null; // 画像パス
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
}
```

### GET /api/drippers

全てのドリッパーを取得します。

**レスポンス例:**

```json
[
  {
    "id": 1,
    "name": "V60",
    "manufacturer": "HARIO",
    "notes": "プラスチック製、1-2杯用",
    "imagePath": null,
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z"
  }
]
```

### POST /api/drippers

新しいドリッパーを作成します。

**リクエストボディ:**

```json
{
  "name": "ドリッパー名", // 必須
  "manufacturer": "メーカー名", // 任意
  "notes": "メモ", // 任意
  "imagePath": "/images/..." // 任意
}
```

**バリデーション:**

- `name`: 必須、空文字不可

**レスポンス:** 201 Created + 作成されたドリッパーデータ

### GET /api/drippers/[id]

指定したIDのドリッパーを取得します。

**パラメータ:**

- `id`: ドリッパーID（数値）

**エラー:**

- 400: IDが数値でない場合
- 404: ドリッパーが存在しない場合

### PUT /api/drippers/[id]

ドリッパー情報を更新します。

**リクエストボディ:**

```json
{
  "name": "更新後の名前", // 任意（指定時は空文字不可）
  "manufacturer": "更新後のメーカー", // 任意
  "notes": "更新後のメモ", // 任意
  "imagePath": "/images/..." // 任意
}
```

**バリデーション:**

- `name`: 指定する場合は空文字不可

**エラー:**

- 400: IDが数値でない、または名前が空の場合
- 404: ドリッパーが存在しない場合

### DELETE /api/drippers/[id]

ドリッパーを削除します。

**レスポンス:** 204 No Content

**エラー:**

- 400: IDが数値でない場合
- 404: ドリッパーが存在しない場合

**注意:** 削除されたドリッパーに紐づく試飲記録の`dripperId`は`null`に設定されます（`onDelete: SetNull`）。

---

## Filter API（フィルターマスター）

フィルターを管理するAPI。

### エンドポイント一覧

| メソッド | パス                | 説明               |
| -------- | ------------------- | ------------------ |
| GET      | `/api/filters`      | フィルター一覧取得 |
| POST     | `/api/filters`      | フィルター作成     |
| GET      | `/api/filters/[id]` | フィルター詳細取得 |
| PUT      | `/api/filters/[id]` | フィルター更新     |
| DELETE   | `/api/filters/[id]` | フィルター削除     |

### データモデル

```typescript
type FilterType = "PAPER" | "METAL" | "CLOTH";

interface Filter {
  id: number; // フィルターID（自動採番）
  name: string; // フィルター名（必須）
  type: FilterType | null; // フィルター種類（PAPER/METAL/CLOTH）
  notes: string | null; // メモ
  imagePath: string | null; // 画像パス
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
}
```

### フィルター種類（FilterType）

| 値      | 説明               |
| ------- | ------------------ |
| `PAPER` | ペーパーフィルター |
| `METAL` | 金属フィルター     |
| `CLOTH` | 布フィルター       |

### GET /api/filters

全てのフィルターを取得します。

**レスポンス例:**

```json
[
  {
    "id": 1,
    "name": "V60用ペーパーフィルター",
    "type": "PAPER",
    "notes": "白色、02サイズ",
    "imagePath": null,
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z"
  }
]
```

### POST /api/filters

新しいフィルターを作成します。

**リクエストボディ:**

```json
{
  "name": "フィルター名", // 必須
  "type": "PAPER", // 任意（PAPER/METAL/CLOTH）
  "notes": "メモ", // 任意
  "imagePath": "/images/..." // 任意
}
```

**バリデーション:**

- `name`: 必須、空文字不可
- `type`: 指定する場合は `PAPER`, `METAL`, `CLOTH` のいずれか

**レスポンス:** 201 Created + 作成されたフィルターデータ

### GET /api/filters/[id]

指定したIDのフィルターを取得します。

**パラメータ:**

- `id`: フィルターID（数値）

**エラー:**

- 400: IDが数値でない場合
- 404: フィルターが存在しない場合

### PUT /api/filters/[id]

フィルター情報を更新します。

**リクエストボディ:**

```json
{
  "name": "更新後の名前", // 任意（指定時は空文字不可）
  "type": "METAL", // 任意（PAPER/METAL/CLOTH）
  "notes": "更新後のメモ", // 任意
  "imagePath": "/images/..." // 任意
}
```

**バリデーション:**

- `name`: 指定する場合は空文字不可
- `type`: 指定する場合は `PAPER`, `METAL`, `CLOTH` のいずれか

**エラー:**

- 400: IDが数値でない、名前が空、または無効なフィルター種類の場合
- 404: フィルターが存在しない場合

### DELETE /api/filters/[id]

フィルターを削除します。

**レスポンス:** 204 No Content

**エラー:**

- 400: IDが数値でない場合
- 404: フィルターが存在しない場合

**注意:** 削除されたフィルターに紐づく試飲記録の`filterId`は`null`に設定されます（`onDelete: SetNull`）。

---

## BeanMaster API（銘柄マスター）

銘柄マスターを管理するAPI。同じ銘柄の購入記録を名寄せして管理します。

### エンドポイント一覧

| メソッド | パス                     | 説明         |
| -------- | ------------------------ | ------------ |
| GET      | `/api/bean-masters`      | 銘柄一覧取得 |
| POST     | `/api/bean-masters`      | 銘柄作成     |
| GET      | `/api/bean-masters/[id]` | 銘柄詳細取得 |
| PUT      | `/api/bean-masters/[id]` | 銘柄更新     |
| DELETE   | `/api/bean-masters/[id]` | 銘柄削除     |

### データモデル

```typescript
interface BeanMaster {
  id: number; // 銘柄ID（自動採番）
  name: string; // 銘柄名（必須）
  origin: string | null; // デフォルト産地
  roastLevel: RoastLevel | null; // デフォルト焙煎度
  process: Process | null; // デフォルト精製方法
  notes: string | null; // 銘柄メモ
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
  _count?: {
    coffeeBeans: number; // 紐づく購入記録の件数（詳細取得時のみ）
  };
}
```

### GET /api/bean-masters

全ての銘柄マスターを取得します。名前順でソートされます。

**レスポンス例:**

```json
[
  {
    "id": 1,
    "name": "エチオピア イルガチェフェ",
    "origin": "エチオピア",
    "roastLevel": "LIGHT",
    "process": "WASHED",
    "notes": "フルーティーな香り",
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z"
  }
]
```

### POST /api/bean-masters

新しい銘柄マスターを作成します。

**リクエストボディ:**

```json
{
  "name": "銘柄名", // 必須
  "origin": "産地", // 任意
  "roastLevel": "LIGHT", // 任意（RoastLevel型）
  "process": "WASHED", // 任意（Process型）
  "notes": "メモ" // 任意
}
```

**バリデーション:**

- `name`: 必須、空文字不可
- `roastLevel`: 指定する場合は有効なRoastLevel値であること
- `process`: 指定する場合は有効なProcess値であること

**レスポンス:** 201 Created + 作成された銘柄データ

### GET /api/bean-masters/[id]

指定したIDの銘柄マスターを取得します。紐づく購入記録の件数も含まれます。

**パラメータ:**

- `id`: 銘柄ID（数値）

**レスポンス例:**

```json
{
  "id": 1,
  "name": "エチオピア イルガチェフェ",
  "origin": "エチオピア",
  "roastLevel": "LIGHT",
  "process": "WASHED",
  "notes": "フルーティーな香り",
  "createdAt": "2026-01-26T10:00:00.000Z",
  "updatedAt": "2026-01-26T10:00:00.000Z",
  "_count": {
    "coffeeBeans": 3
  }
}
```

**エラー:**

- 400: IDが数値でない場合
- 404: 銘柄が存在しない場合

### PUT /api/bean-masters/[id]

銘柄マスター情報を更新します。

**リクエストボディ:**

```json
{
  "name": "更新後の名前", // 任意（指定時は空文字不可）
  "origin": "更新後の産地", // 任意
  "roastLevel": "MEDIUM", // 任意
  "process": "NATURAL", // 任意
  "notes": "更新後のメモ" // 任意
}
```

**バリデーション:**

- `name`: 指定する場合は空文字不可
- `roastLevel`: 指定する場合は有効なRoastLevel値であること
- `process`: 指定する場合は有効なProcess値であること

**エラー:**

- 400: IDが数値でない、または名前が空の場合
- 404: 銘柄が存在しない場合

### DELETE /api/bean-masters/[id]

銘柄マスターを削除します。

**レスポンス:** 204 No Content

**エラー:**

- 400: IDが数値でない場合、または購入記録が存在する場合
- 404: 銘柄が存在しない場合

**注意:** 購入記録（CoffeeBean）が紐づいている銘柄マスターは削除できません。先に購入記録を削除するか、銘柄マスターの紐づけを解除してください。

---

## CoffeeBean API（コーヒー豆購入記録）

コーヒー豆の購入記録を管理するAPI。

### エンドポイント一覧

| メソッド | パス              | 説明           |
| -------- | ----------------- | -------------- |
| GET      | `/api/beans`      | 豆一覧取得     |
| POST     | `/api/beans`      | 豆作成         |
| GET      | `/api/beans/[id]` | 豆詳細取得     |
| PUT      | `/api/beans/[id]` | 豆更新         |
| PATCH    | `/api/beans/[id]` | ステータス変更 |
| DELETE   | `/api/beans/[id]` | 豆削除         |

### データモデル

```typescript
type RoastLevel =
  | "LIGHT"
  | "CINNAMON"
  | "MEDIUM"
  | "HIGH"
  | "CITY"
  | "FULL_CITY"
  | "FRENCH"
  | "ITALIAN";
type Process =
  | "WASHED"
  | "NATURAL"
  | "HONEY"
  | "PULPED_NATURAL"
  | "SEMI_WASHED";
type BeanType = "SINGLE_ORIGIN" | "BLEND";
type BeanStatus = "IN_STOCK" | "FINISHED";

interface CoffeeBean {
  id: number; // 豆ID（自動採番）
  name: string; // 銘柄名（必須）
  origin: string | null; // 産地
  roastLevel: RoastLevel | null; // 焙煎度
  process: Process | null; // 精製方法
  isDecaf: boolean; // デカフェフラグ（デフォルト: false）
  beanType: BeanType | null; // ブレンド/シングル
  notes: string | null; // メモ
  purchaseDate: string | null; // 購入日（ISO 8601形式）
  price: number | null; // 価格（円）
  amount: number | null; // 購入量（g）
  status: BeanStatus; // ステータス（デフォルト: IN_STOCK）
  finishedDate: string | null; // 飲み切り日（ISO 8601形式）
  imagePath: string | null; // 画像パス
  shopId: number | null; // 店舗ID（外部キー）
  beanMasterId: number | null; // 銘柄マスターID（外部キー）
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
  beanMaster?: BeanMaster; // 関連する銘柄マスター（一覧・詳細取得時に含まれる）
}
```

### 焙煎度（RoastLevel）

| 値          | 説明                         | カテゴリ |
| ----------- | ---------------------------- | -------- |
| `LIGHT`     | ライトロースト               | 浅煎り   |
| `CINNAMON`  | シナモンロースト             | 浅煎り   |
| `MEDIUM`    | ミディアムロースト           | 中浅煎り |
| `HIGH`      | ハイロースト・ダークロースト | 中煎り   |
| `CITY`      | シティロースト               | 中煎り   |
| `FULL_CITY` | フルシティロースト           | 中深煎り |
| `FRENCH`    | フレンチロースト             | 深煎り   |
| `ITALIAN`   | イタリアンロースト           | 深煎り   |

### 精製方法（Process）

| 値               | 説明               |
| ---------------- | ------------------ |
| `WASHED`         | ウォッシュド       |
| `NATURAL`        | ナチュラル         |
| `HONEY`          | ハニー             |
| `PULPED_NATURAL` | パルプドナチュラル |
| `SEMI_WASHED`    | セミウォッシュド   |

### GET /api/beans

全ての豆を取得します。

**クエリパラメータ:**

- `status`: `IN_STOCK` または `FINISHED` でフィルタリング

**レスポンス例:**

```json
[
  {
    "id": 1,
    "name": "エチオピア イルガチェフェ",
    "origin": "エチオピア",
    "roastLevel": "LIGHT",
    "process": "WASHED",
    "isDecaf": false,
    "beanType": "SINGLE_ORIGIN",
    "notes": "フルーティーな香り",
    "purchaseDate": "2026-01-20T00:00:00.000Z",
    "price": 1500,
    "amount": 200,
    "status": "IN_STOCK",
    "finishedDate": null,
    "imagePath": null,
    "shopId": 1,
    "shop": { "id": 1, "name": "テスト店舗" },
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z"
  }
]
```

### POST /api/beans

新しい豆を作成します。

**リクエストボディ:**

```json
{
  "name": "銘柄名", // 必須
  "origin": "産地", // 任意
  "roastLevel": "LIGHT", // 任意（8段階のいずれか）
  "process": "WASHED", // 任意（5種類のいずれか）
  "isDecaf": false, // 任意（デフォルト: false）
  "beanType": "SINGLE_ORIGIN", // 任意
  "notes": "メモ", // 任意
  "purchaseDate": "2026-01-20", // 任意
  "price": 1500, // 任意
  "amount": 200, // 任意
  "shopId": 1, // 任意（店舗ID）
  "beanMasterId": 1 // 任意（銘柄マスターID。指定時はname/origin/roastLevel/processが自動補完される）
}
```

**バリデーション:**

- `name`: 必須（beanMasterIdが指定された場合は銘柄マスターの値で自動補完）
- `roastLevel`: 有効な焙煎度のいずれか
- `process`: 有効な精製方法のいずれか
- `shopId`: 指定する場合は存在する店舗ID
- `beanMasterId`: 指定する場合は存在する銘柄マスターID
- `status`: **新規登録時は「飲み切り（FINISHED）」での登録不可**（購入→在庫中→飲み切りのフローのみ）

**レスポンス:** 201 Created + 作成された豆データ（ステータスは常に`IN_STOCK`）

**エラー:**

- 400: 必須項目がない、無効な値、または`status: "FINISHED"`を指定した場合

### GET /api/beans/[id]

指定したIDの豆を取得します（関連する試飲記録も含む）。

**パラメータ:**

- `id`: 豆ID（数値）

**レスポンス例:**

```json
{
  "id": 1,
  "name": "エチオピア イルガチェフェ",
  "shop": { "id": 1, "name": "テスト店舗" },
  "tastingEntries": [
    { "id": 1, "brewDate": "2026-01-25T10:00:00.000Z", "overallRating": 4 }
  ]
}
```

**エラー:**

- 400: IDが数値でない場合
- 404: 豆が存在しない場合

### PUT /api/beans/[id]

豆情報を更新します。

**リクエストボディ:**

```json
{
  "name": "更新後の名前", // 任意（指定時は空文字不可）
  "origin": "更新後の産地", // 任意
  "roastLevel": "MEDIUM", // 任意
  "notes": "更新後のメモ" // 任意
}
```

**バリデーション:**

- `name`: 指定する場合は空文字不可
- `roastLevel`: 有効な焙煎度のいずれか
- `process`: 有効な精製方法のいずれか

**エラー:**

- 400: IDが数値でない、名前が空、または無効な値の場合
- 404: 豆が存在しない場合

### PATCH /api/beans/[id]

豆のステータスを変更します。

**リクエストボディ:**

```json
{
  "status": "FINISHED" // IN_STOCK または FINISHED
}
```

**動作:**

- `FINISHED` に変更: `finishedDate` に現在日時を自動設定
- `IN_STOCK` に戻す: `finishedDate` を `null` にクリア

**エラー:**

- 400: 無効なステータスの場合
- 404: 豆が存在しない場合

### DELETE /api/beans/[id]

豆を削除します。

**レスポンス:** 204 No Content

**エラー:**

- 400: IDが数値でない場合
- 404: 豆が存在しない場合

**注意:** 削除された豆に紐づく試飲記録も一緒に削除されます（`onDelete: Cascade`）。

---

## TastingEntry API（試飲記録）

試飲記録を管理するAPI。

### エンドポイント一覧

| メソッド | パス                 | 説明             |
| -------- | -------------------- | ---------------- |
| GET      | `/api/tastings`      | 試飲記録一覧取得 |
| POST     | `/api/tastings`      | 試飲記録作成     |
| GET      | `/api/tastings/[id]` | 試飲記録詳細取得 |
| PUT      | `/api/tastings/[id]` | 試飲記録更新     |
| DELETE   | `/api/tastings/[id]` | 試飲記録削除     |

### データモデル

```typescript
interface TastingEntry {
  id: number; // 試飲記録ID（自動採番）
  coffeeBeanId: number; // コーヒー豆ID（必須）
  dripperId: number | null; // ドリッパーID
  filterId: number | null; // フィルターID
  grindSize: number | null; // 挽き方（1.0-10.0、0.5刻み）
  brewDate: string; // 抽出日（必須、ISO 8601形式）
  acidity: number | null; // 酸味（1-5）
  bitterness: number | null; // 苦味（1-5）
  sweetness: number | null; // 甘味（1-5）
  body: string | null; // ボディ（LIGHT/MEDIUM/HEAVY）
  aftertaste: number | null; // 後味（1-5）
  flavorTags: string | null; // フレーバータグ（JSON配列）
  overallRating: number | null; // 総合評価（1-5）
  notes: string | null; // テイスティングノート
  imagePath: string | null; // 画像パス
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
}

// ボディ値
type Body = "LIGHT" | "MEDIUM" | "HEAVY";
```

### GET /api/tastings

全ての試飲記録を取得します。関連する豆・ドリッパー・フィルター情報を含みます。

**クエリパラメータ:**

| パラメータ   | 説明                       |
| ------------ | -------------------------- |
| coffeeBeanId | 指定した豆IDの記録のみ取得 |

**レスポンス例:**

```json
[
  {
    "id": 1,
    "coffeeBeanId": 1,
    "dripperId": 1,
    "filterId": 1,
    "grindSize": 5.5,
    "brewDate": "2026-01-25T10:00:00.000Z",
    "acidity": 7,
    "bitterness": 3,
    "sweetness": 5,
    "body": "MEDIUM",
    "aftertaste": 2,
    "flavorTags": "[\"BERRY\",\"CITRUS\"]",
    "overallRating": 4,
    "notes": "フルーティーで美味しい",
    "coffeeBean": { "id": 1, "name": "エチオピア イルガチェフェ" },
    "dripper": { "id": 1, "name": "HARIO V60" },
    "filter": { "id": 1, "name": "V60ペーパー" },
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z"
  }
]
```

### POST /api/tastings

新しい試飲記録を作成します。

**リクエストボディ:**

```json
{
  "coffeeBeanId": 1, // 必須（在庫中の豆のみ）
  "brewDate": "2026-01-25", // 必須
  "dripperId": 1, // 任意
  "filterId": 1, // 任意
  "grindSize": 5.5, // 任意
  "acidity": 4, // 任意（1-5）
  "bitterness": 3, // 任意（1-5）
  "sweetness": 5, // 任意（1-5）
  "body": "MEDIUM", // 任意（LIGHT/MEDIUM/HEAVY）
  "aftertaste": 2, // 任意（1-5）
  "flavorTags": ["BERRY", "CITRUS"], // 任意（配列）
  "overallRating": 4, // 任意（1-5）
  "notes": "テイスティングノート" // 任意
}
```

**バリデーション:**

- `coffeeBeanId`: 必須、存在する豆ID、かつステータスが「在庫中」であること
- `brewDate`: 必須
- `acidity`, `bitterness`, `sweetness`, `aftertaste`: 1-5の範囲
- `overallRating`: 1-5の範囲
- `body`: LIGHT/MEDIUM/HEAVYのいずれか

**レスポンス:** 201 Created + 作成された試飲記録データ

**エラー:**

- 400: 必須項目がない、豆が存在しない、豆が飲み切りステータス、または値が範囲外の場合

### GET /api/tastings/[id]

指定したIDの試飲記録を取得します（関連情報を含む）。

**パラメータ:**

- `id`: 試飲記録ID（数値）

**レスポンス例:**

```json
{
  "id": 1,
  "coffeeBeanId": 1,
  "brewDate": "2026-01-25T10:00:00.000Z",
  "overallRating": 4,
  "coffeeBean": { "id": 1, "name": "エチオピア イルガチェフェ" },
  "dripper": { "id": 1, "name": "HARIO V60" },
  "filter": { "id": 1, "name": "V60ペーパー" }
}
```

**エラー:**

- 400: IDが数値でない場合
- 404: 試飲記録が存在しない場合

---

## Origin API（産地マスター）

コーヒー豆の産地（国）を管理するAPI。

### エンドポイント一覧

| メソッド | パス                | 説明         |
| -------- | ------------------- | ------------ |
| GET      | `/api/origins`      | 産地一覧取得 |
| POST     | `/api/origins`      | 産地作成     |
| GET      | `/api/origins/[id]` | 産地詳細取得 |
| PUT      | `/api/origins/[id]` | 産地更新     |
| DELETE   | `/api/origins/[id]` | 産地削除     |

### データモデル

```typescript
interface Origin {
  id: number; // 産地ID（自動採番）
  name: string; // 国名（必須、ユニーク）例: エチオピア、コロンビア
  notes: string | null; // メモ
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
}
```

### GET /api/origins

全ての産地を名前順で取得します。

**レスポンス例:**

```json
[
  {
    "id": 2,
    "name": "エチオピア",
    "notes": "フルーティーな豆が多い",
    "createdAt": "2026-01-27T00:00:00.000Z",
    "updatedAt": "2026-01-27T00:00:00.000Z"
  },
  {
    "id": 1,
    "name": "コロンビア",
    "notes": null,
    "createdAt": "2026-01-27T00:00:00.000Z",
    "updatedAt": "2026-01-27T00:00:00.000Z"
  }
]
```

### POST /api/origins

新しい産地を作成します。

**リクエストボディ:**

```json
{
  "name": "エチオピア",
  "notes": "フルーティーな豆が多い"
}
```

**バリデーション:**

- `name`: 必須、空文字不可、重複不可

**エラー:**

- 400: 名前が空、または同名の産地が既に存在する場合

### GET /api/origins/[id]

指定IDの産地を取得します。

**レスポンス例:**

```json
{
  "id": 1,
  "name": "エチオピア",
  "notes": "フルーティーな豆が多い",
  "createdAt": "2026-01-27T00:00:00.000Z",
  "updatedAt": "2026-01-27T00:00:00.000Z"
}
```

**エラー:**

- 400: IDが数値でない場合
- 404: 産地が存在しない場合

### PUT /api/origins/[id]

産地を更新します。

**リクエストボディ:**

```json
{
  "name": "ケニア",
  "notes": "更新後のメモ"
}
```

**バリデーション:**

- `name`: 空文字不可

**エラー:**

- 400: IDが数値でない、または名前が空の場合
- 404: 産地が存在しない場合

### DELETE /api/origins/[id]

産地を削除します。

**レスポンス:** 204 No Content

**エラー:**

- 400: IDが数値でない場合
- 404: 産地が存在しない場合

### PUT /api/tastings/[id]

試飲記録を更新します。

**リクエストボディ:**

```json
{
  "dripperId": 2, // 任意
  "filterId": 2, // 任意
  "grindSize": 6.0, // 任意
  "brewDate": "2026-01-26", // 任意
  "acidity": 8, // 任意（1-10）
  "bitterness": 4, // 任意（1-10）
  "sweetness": 7, // 任意（1-10）
  "body": "HEAVY", // 任意
  "aftertaste": 9, // 任意（1-10）
  "flavorTags": ["CHOCOLATE"], // 任意
  "overallRating": 5, // 任意（1-5）
  "notes": "更新後のメモ" // 任意
}
```

**バリデーション:**

- 評価値: 1-10の範囲
- `overallRating`: 1-5の範囲
- `body`: LIGHT/MEDIUM/HEAVYのいずれか

**エラー:**

- 400: IDが数値でない、または値が範囲外の場合
- 404: 試飲記録が存在しない場合

### DELETE /api/tastings/[id]

試飲記録を削除します。

**レスポンス:** 204 No Content

**エラー:**

- 400: IDが数値でない場合
- 404: 試飲記録が存在しない場合

---

## TastingNote API（テイスティングノート）

1つの試飲記録に対して、複数人がテイスティングノートを追加できるAPI。

### エンドポイント一覧

| メソッド | パス                      | 説明                     |
| -------- | ------------------------- | ------------------------ |
| GET      | `/api/tasting-notes`      | テイスティングノート一覧 |
| POST     | `/api/tasting-notes`      | テイスティングノート作成 |
| GET      | `/api/tasting-notes/[id]` | テイスティングノート取得 |
| PUT      | `/api/tasting-notes/[id]` | テイスティングノート更新 |
| DELETE   | `/api/tasting-notes/[id]` | テイスティングノート削除 |

### データモデル

```typescript
interface TastingNote {
  id: number; // ID（自動採番）
  tastingEntryId: number; // 試飲記録ID（必須）
  recordedBy: string | null; // 記録者名
  acidity: number | null; // 酸味（1-5）
  bitterness: number | null; // 苦味（1-5）
  sweetness: number | null; // 甘味（1-5）
  body: string | null; // ボディ（LIGHT/MEDIUM/HEAVY）
  aftertaste: number | null; // 後味（1-5）
  flavorTags: string | null; // フレーバータグ（JSON配列）
  overallRating: number | null; // 総合評価（1-5）
  notes: string | null; // テイスティングノート
  createdAt: string; // 作成日時
  updatedAt: string; // 更新日時
}
```

### GET /api/tasting-notes

テイスティングノート一覧を取得します。

**クエリパラメータ:**

| パラメータ     | 型     | 必須 | 説明                 |
| -------------- | ------ | ---- | -------------------- |
| tastingEntryId | number | No   | 試飲記録IDでフィルタ |

**レスポンス例:**

```json
[
  {
    "id": 1,
    "tastingEntryId": 1,
    "recordedBy": "田中",
    "acidity": 4,
    "bitterness": 3,
    "sweetness": 4,
    "body": "MEDIUM",
    "aftertaste": 4,
    "flavorTags": "[\"BERRY\", \"CHOCOLATE\"]",
    "overallRating": 4,
    "notes": "フルーティーで飲みやすい",
    "createdAt": "2026-01-27T10:00:00.000Z",
    "updatedAt": "2026-01-27T10:00:00.000Z"
  }
]
```

### POST /api/tasting-notes

新しいテイスティングノートを作成します。

**リクエストボディ:**

```json
{
  "tastingEntryId": 1, // 必須
  "recordedBy": "田中", // 任意
  "acidity": 4, // 任意（1-5）
  "bitterness": 3, // 任意（1-5）
  "sweetness": 4, // 任意（1-5）
  "body": "MEDIUM", // 任意（LIGHT/MEDIUM/HEAVY）
  "aftertaste": 4, // 任意（1-5）
  "flavorTags": "[\"BERRY\"]", // 任意（JSON文字列）
  "overallRating": 4, // 任意（1-5）
  "notes": "コメント" // 任意
}
```

**バリデーション:**

- `tastingEntryId`: 必須、存在する試飲記録ID
- 評価値（acidity, bitterness, sweetness, aftertaste, overallRating）: 1-5の範囲
- `body`: LIGHT/MEDIUM/HEAVYのいずれか

**エラー:**

- 400: tastingEntryIdが未指定、または値が範囲外
- 404: 試飲記録が存在しない

### GET /api/tasting-notes/[id]

指定したIDのテイスティングノートを取得します。

**レスポンス:** TastingNoteオブジェクト

**エラー:**

- 400: IDが数値でない
- 404: テイスティングノートが存在しない

### PUT /api/tasting-notes/[id]

テイスティングノートを更新します。

**リクエストボディ:** POST と同様（tastingEntryIdは不要）

**エラー:**

- 400: IDが数値でない、または値が範囲外
- 404: テイスティングノートが存在しない

### DELETE /api/tasting-notes/[id]

テイスティングノートを削除します。

**レスポンス:** 204 No Content

**エラー:**

- 400: IDが数値でない
- 404: テイスティングノートが存在しない
