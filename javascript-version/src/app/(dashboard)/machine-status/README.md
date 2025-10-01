# Machine Status — ざっくり担当まとめ

なるべくゆるく、どのファイルが何してるかだけメモっておきます。

## ページ本体

- `page.jsx`
  - 画面の土台。レイアウトと「結線」係
  - ログのフィルタ状態、ダイアログの開閉、スナックバーなど最小限の UI 状態だけ持つ
  - 中身のデータは全部フックからもらって、見た目用コンポーネントに渡すだけ

## フック（データとロジック）

- `useMachineInfo.js`
  - 機械の基本情報を取得（名前、今日の稼働時間/生産数など）
  - 稼働時間のカウントアップ（1秒ごと）
  - 点検まわり（最終点検日、点検間隔、次回日付）

- `useMachineLogs.js`
  - ログ取得＆表示用に整形
  - ユニットごとの状態を推定（正常/残弾わずか/残弾なし/エラー/停止中/不明）
  - 全体（大ランプ）用の状態も出す

## 見た目用コンポーネント（UIだけ）

- `UnitStatusLamps.jsx`
  - Unit1〜4の丸ランプとラベルを表示するだけ

- `ErrorLogList.jsx`
  - ログ一覧の見た目だけ。フィルタは親（page.jsx）でやる

- `InspectionDialogs.jsx`
  - 点検ダイアログと「点検間隔を変える」ダイアログ

## ユーティリティ

- `utils/date.js`
  - 日付のパース/フォーマット、日付の加算、秒→HH:MM:SS などの小ネタ置き場

## 触りたいときの目安

- 画面の配置やボタン増やす → `page.jsx`
- APIの取り回し/ロジック修正 → `useMachineInfo.js` or `useMachineLogs.js`
- 見た目だけ直したい → `UnitStatusLamps.jsx` / `ErrorLogList.jsx` / `InspectionDialogs.jsx`
- 日付の書式や変換を変えたい → `utils/date.js`

補足: import は `@components/*` エイリアスで読んでます（`jsconfig.json` 参照）。