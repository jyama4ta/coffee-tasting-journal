# 状態遷移図

## 概要

Coffee Tasting Journalにおける主要なエンティティの状態遷移を定義します。

## 1. コーヒー豆（CoffeeBean）の状態遷移

```mermaid
stateDiagram-v2
    [*] --> IN_STOCK: 豆を登録
    IN_STOCK --> IN_STOCK: 試飲記録を追加
    IN_STOCK --> IN_STOCK: 情報を編集
    IN_STOCK --> FINISHED: 飲み切りにする
    FINISHED --> IN_STOCK: 在庫中に戻す（誤操作時）
    FINISHED --> [*]: 削除
    IN_STOCK --> [*]: 削除

    note right of IN_STOCK
        試飲記録作成時に選択可能
        複数回の試飲記録を追加可能
    end note

    note right of FINISHED
        試飲記録作成時に選択不可
        過去の試飲記録は保持
        飲み切り日を記録
    end note
```

### 状態の説明

| 状態                 | 説明                             | 試飲記録での選択 |
| -------------------- | -------------------------------- | ---------------- |
| IN_STOCK（在庫中）   | 購入後、まだ飲み切っていない状態 | ✓ 選択可能       |
| FINISHED（飲み切り） | 豆を使い切った状態               | ✗ 選択不可       |

### 遷移イベント

| イベント       | 遷移前            | 遷移後   | 備考                                             |
| -------------- | ----------------- | -------- | ------------------------------------------------ |
| 豆を登録       | -                 | IN_STOCK | 新規登録時はIN_STOCKのみ（FINISHEDでの登録不可） |
| 飲み切りにする | IN_STOCK          | FINISHED | finishedDateを記録                               |
| 在庫中に戻す   | FINISHED          | IN_STOCK | finishedDateをクリア                             |
| 削除           | IN_STOCK/FINISHED | -        | 関連する試飲記録も削除                           |

### 重要な制約

- **新規登録時は「在庫中」のみ**: 豆は購入時に在庫中で登録し、後から「飲み切り」に変更するフローのみ
- **「飲み切り」での新規登録は不可**: 過去に飲み切った豆を過去日付で登録するようなフローは想定しない

## 2. 試飲記録（TastingEntry）のライフサイクル

```mermaid
stateDiagram-v2
    [*] --> Draft: 新規作成開始
    Draft --> Saved: 保存
    Saved --> Saved: 編集・更新
    Saved --> [*]: 削除

    note right of Draft
        必須項目:
        - 豆の選択（在庫中のみ）
        - 抽出日
    end note

    note right of Saved
        すべての項目を
        後から編集可能
    end note
```

### 試飲記録作成フロー

```mermaid
flowchart TD
    A[試飲記録作成開始] --> B{在庫中の豆があるか?}
    B -->|はい| C[豆を選択]
    B -->|いいえ| D[豆を先に登録]
    D --> C
    C --> E[抽出情報を入力]
    E --> F[味の評価を入力]
    F --> G[フレーバータグを選択]
    G --> H[総合評価・ノートを入力]
    H --> I[保存]
    I --> J[試飲記録一覧に追加]
```

## 3. マスターデータの管理

### 店舗・ドリッパー・フィルターのライフサイクル

```mermaid
stateDiagram-v2
    [*] --> Active: 登録
    Active --> Active: 編集
    Active --> [*]: 削除

    note right of Active
        削除時の動作:
        - 店舗: 関連する豆の参照をNULLに
        - ドリッパー/フィルター: 関連する試飲記録の参照をNULLに
    end note
```

## 4. データフロー

### 全体のデータフロー

```mermaid
flowchart TB
    subgraph Masters[マスターデータ]
        Shop[店舗]
        Dripper[ドリッパー]
        Filter[フィルター]
    end

    subgraph Beans[豆管理]
        CoffeeBean[コーヒー豆]
    end

    subgraph Tastings[試飲記録]
        TastingEntry[試飲記録]
    end

    Shop -->|購入店として参照| CoffeeBean
    CoffeeBean -->|豆として参照| TastingEntry
    Dripper -->|使用器具として参照| TastingEntry
    Filter -->|使用器具として参照| TastingEntry
```

### 豆登録から試飲記録までの流れ

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant S as 店舗マスター
    participant B as 豆マスター
    participant D as ドリッパーマスター
    participant F as フィルターマスター
    participant T as 試飲記録

    Note over U,T: 初期セットアップ
    U->>S: 店舗を登録
    U->>D: ドリッパーを登録
    U->>F: フィルターを登録

    Note over U,T: 豆を購入したとき
    U->>B: 豆を登録（店舗を選択）
    B-->>U: 登録完了（ステータス: 在庫中）

    Note over U,T: コーヒーを淹れたとき
    U->>T: 試飲記録を作成
    T->>B: 在庫中の豆一覧を取得
    B-->>T: 豆一覧
    U->>T: 豆・ドリッパー・フィルターを選択
    U->>T: 挽き方・味の評価を入力
    T-->>U: 保存完了

    Note over U,T: 豆を使い切ったとき
    U->>B: ステータスを「飲み切り」に変更
    B-->>U: 更新完了（試飲記録で選択不可に）
```

## 5. 画面遷移

```mermaid
flowchart TB
    Home[ホーム画面]

    subgraph TastingPages[試飲記録]
        TastingList[一覧]
        TastingCreate[新規作成]
        TastingDetail[詳細]
        TastingEdit[編集]
    end

    subgraph BeanPages[豆管理]
        BeanList[一覧]
        BeanCreate[新規作成]
        BeanDetail[詳細]
        BeanEdit[編集]
    end

    subgraph MasterPages[マスター管理]
        ShopList[店舗一覧]
        DripperList[ドリッパー一覧]
        FilterList[フィルター一覧]
    end

    Home --> TastingList
    Home --> BeanList
    Home --> MasterPages

    TastingList --> TastingCreate
    TastingList --> TastingDetail
    TastingDetail --> TastingEdit

    BeanList --> BeanCreate
    BeanList --> BeanDetail
    BeanDetail --> BeanEdit
```

## 6. バリデーションルール

### 豆登録時

```mermaid
flowchart TD
    A[豆登録フォーム送信] --> B{銘柄は入力されているか?}
    B -->|いいえ| C[エラー: 銘柄は必須です]
    B -->|はい| D{ステータスはIN_STOCKまたは未指定か?}
    D -->|いいえ| E[エラー: 新規登録時は在庫中のみ]
    D -->|はい| F{価格は0以上か?}
    F -->|いいえ| G[エラー: 価格は0以上で入力してください]
    F -->|はい| H{購入量は0以上か?}
    H -->|いいえ| I[エラー: 購入量は0以上で入力してください]
    H -->|はい| J[登録成功（ステータス: IN_STOCK）]
```

### 試飲記録作成時

```mermaid
flowchart TD
    A[試飲記録フォーム送信] --> B{豆は選択されているか?}
    B -->|いいえ| C[エラー: 豆を選択してください]
    B -->|はい| D{選択した豆は在庫中か?}
    D -->|いいえ| E[エラー: 飲み切り済みの豆は選択できません]
    D -->|はい| F{挽き方は1.0-10.0の範囲か?}
    F -->|いいえ| G[エラー: 挽き方は1.0-10.0で入力してください]
    F -->|はい| H{評価値は有効範囲か?}
    H -->|いいえ| I[エラー: 評価値が範囲外です]
    H -->|はい| J[登録成功]
```
