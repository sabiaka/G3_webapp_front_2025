# SSE イベント一覧

バックエンドの各 API から配信されるサーバー送信イベント (SSE) のサンプルをまとめています。

## 接続確立

```json
{
  "type": "sse:connected",
  "connectedAt": "2025-12-10T06:14:22.126Z"
}
```

## 検査系イベント

### 検査前画像アップロード
`POST /api/ingress/inspection/{lot_id}`

```json
{
  "timestamp": 1765347201123,
  "type": "inspection:imageUploaded",
  "lotId": "MAT-00006",
  "filename": "MAT-00006_A-main01_A-2_E-4.png"
}
```

### 検査ロット初期登録
`POST /api/ingress/inspection`

```json
{
  "timestamp": 1765347210456,
  "type": "inspection:lotCreated",
  "lotId": "MAT-00006",
  "sectionCode": "spring",
  "filenames": [
    "MAT-00006_B-spring01_1.jpg",
    "MAT-00006_B-spring02_1.jpg"
  ]
}
```

### 検査結果一括登録
`POST /api/ingress/inspection/batch/{lot_id}`

```json
{
  "timestamp": 1765347342148,
  "type": "inspection:batchUploaded",
  "lotId": "MAT-00006",
  "filename": "MAT-00006_B-spring02_1.jpg",
  "status": "FAIL"
}
```

### 検査結果更新（単発）
`PUT /api/ingress/inspection/result/{filename}`

```json
{
  "timestamp": 1765347405566,
  "type": "inspection:resultUpdated",
  "filename": "MAT-00006_B-spring02_1.jpg",
  "status": "PASS"
}
```

### 検査リセット
`POST /api/ingress/inspection/{lot_id}/reset`

```json
{
  "timestamp": 1765347458899,
  "type": "inspection:lotReset",
  "lotId": "MAT-00006",
  "updatedCount": 8
}
```

### 検査ロット削除
`DELETE /api/ingress/inspection/{lot_id}`

```json
{
  "timestamp": 1765347502234,
  "type": "inspection:lotDeleted",
  "lotId": "MAT-00006",
  "deletedFiles": 16
}
```

## 生産系イベント

### 生産インクリメント
`POST /api/machines/{id}/increment-production`

```json
{
  "timestamp": 1765347669967,
  "type": "production:lotIncremented",
  "machineId": "1",
  "lotId": "MAT-00007",
  "section": "spring",
  "todayProductionCount": 107
}
```

---

> `timestamp` は `emitEvent` で自動付与される UNIX ミリ秒です。フロントエンドでは `type` をキーにして適切な更新処理を実行してください。
