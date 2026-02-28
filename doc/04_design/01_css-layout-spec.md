# CSSレイアウト仕様

## 1. デザイン方針

- 基本フォント: `"Segoe UI", sans-serif`
- 背景色: `#f5f7fa` 系のグラデーション
- 主要フォームはカード型コンテナ（白背景 + 角丸 + シャドウ）
- 操作可能領域（ボタン・チップ）はホバー時に状態が分かる表現を付与
- 全画面で統一するため、テーマ変数（`--primary`, `--border`, `--radius-*` など）を `theme.css` から参照する

## 2. 画面別スタイル概要

- 共通テーマ: `assets/css/theme.css`（配色・角丸・影・主要ボタン色を全画面で統一）

| 画面 | CSSファイル | 主要レイアウト |
|---|---|---|
| ログイン | `assets/css/login.css` | 全画面中央寄せ + 固定幅カード |
| トップ（週間） | `assets/css/index.css` | ヘッダ + 横スクロール可能な週間テーブル |
| 登録/編集共通 | `assets/css/schedule_form_common.css` | 横並びフォーム（`form-row`） |
| 登録専用 | `assets/css/schedule_add.css` | 共通CSSの `@import` |
| 編集専用 | `assets/css/schedule_edit.css` | 削除モーダル・危険操作ボタン |
| ユーザ登録 | `assets/css/user_register.css` | コンパクトカードフォーム |
| グループ編集一覧 | `assets/css/group_manage.css` | ヘッダ + カードテーブル + チップ一覧 |
| グループ作成/編集 | `assets/css/group_form.css` | カードフォーム + 2列ユーザ選択 + 右寄せアクション |

## 3. 詳細仕様

### 3.1 ログイン画面

- `body` をFlex中央寄せ
- `.login-card`
  - 幅: `360px`
  - 視覚効果: 角丸 + シャドウ
- ボタンは100%幅、青系のプライマリカラー

### 3.2 トップ画面（週間）

- `#schedule-table-wrapper`: `overflow-x: auto`
- `#schedule-table`: `width: max-content`
- ヘッダ固定

```css
#schedule-table thead th {
  position: sticky;
  top: 0;
}
```

- 予定チップ（`.event-chip`）
  - `inline-block` でセル全体を覆わない
  - ホバー時に拡大・シャドウ強化

### 3.3 登録/編集フォーム

- `.form-row` で横並びを構成
- `short / long / date-short / time-block` で横幅比率を制御
- `.time-inner` で「時」「分」の選択UIを横並びに統一

### 3.4 編集画面モーダル

- `.modal-overlay`: 画面全体の半透明オーバーレイ
- `.modal-content`: 中央ダイアログ
- `.modal-actions`: 右寄せのアクションボタン
- `.danger`: 削除など破壊的操作を赤系で表示

## 4. UIコンポーネント指針

| コンポーネント | クラス | 用途 |
|---|---|---|
| 予定チップ | `.event-chip` | 一覧セル内の予定表示 |
| 同報者チップ | `.chip` | 参加者のピル表示 |
| 定期設定枠 | `.recurring-section` | 定期予約入力領域 |
| 危険操作 | `.danger` | 削除など強調アクション |

## 5. 既知の注意点

> NOTE: `schedule_detail.html` は `schedule_detail.css` を参照していますが、現行リポジトリに当該CSSファイルはありません。
> 必要に応じてスタイル追加または参照整理を実施してください。


### 3.5 グループ編集一覧画面

- ページ上部に「グループ編集」ヘッダと戻るボタンを配置。
- 一覧は白背景カード + 角丸 + シャドウで可読性を確保。
- グループタイプはバッジ表示、所属ユーザはチップ表示。
- 最下段の `+` 行は hover 時に背景色を変え、新規追加導線を強調。

### 3.6 グループ作成/編集画面

- 入力フォームをカード化して、余白と境界を整理。
- 所属ユーザは2列グリッドで選択性を向上。
- 保存/削除/キャンセルを右寄せで配置し、`primary`/`danger`/`secondary` を色で区別。
