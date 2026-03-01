# PracticeWebApplication

スケジュール共有Webアプリ（Node.js + Express + MySQL）です。
ログイン、表示グループ（Public/Private）、週間表示、定期予約（平日毎日/毎週/隔週）に対応しています。

---

## 主な機能

- **ログイン**（ユーザID / パスワード）
- **ロール管理**（`admin` / `ld` / `normal` / `business`）
- **トップ画面（週間スケジュール）**
  - 1日前 / 1日後 / 1週前 / 1週先 / 今週
  - 日付ヘッダは西暦を含む形式（YYYY/M/D）で表示
  - 土曜日の日付文字は青、日曜日の日付文字は赤で表示し、土日のセル背景はグレーで表示
  - 週間テーブルは縦スクロール時もヘッダー行を固定表示
  - 予定チップの表示・編集遷移
- **表示グループ**
  - Publicグループ（全員選択可）
  - Privateグループ（所有者のみ選択可）
  - デフォルト表示グループ保存
  - グループ編集画面（作成/編集/削除）
    - `admin` / `ld`: Publicグループも作成/編集/削除可能
    - `admin` / `ld`: 作成済みPublicグループは編集画面でPrivateへ変更可能
    - `normal` / `business`: 自身作成のPrivateグループのみ
    - グループ編集一覧/フォームはカードUI・チップ表示で操作性を改善
    - グループ新規作成時は、PublicはPublic内、Privateは自分のPrivate内で同名重複を禁止（重複時は注釈表示＋保存不可）
    - グループ新規作成時の所属ユーザはユーザID/ユーザ名で絞り込み可能で、絞り込み結果の全選択に対応
- **ユーザメンテナンス**
  - トップ画面からユーザ登録 / 自身のユーザ情報編集 / ユーザメンテナンス（権限付与・削除）へ遷移
  - 自身のロールに応じて利用不可機能はボタン非表示
  - ユーザ登録画面 / ユーザメンテナンス画面のロール選択肢は、ログインユーザが付与可能な項目のみに制限し、「開発者（admin）→ リーダー（ld）→ 一般（normal）→ BP（business）」順で表示
  - ユーザメンテナンス画面のロール欄表示名はロールマスタの日本語名で統一
  - ユーザメンテナンス画面でユーザID/ユーザ名/メール（あいまい検索）・ロール（完全一致）によるリアルタイム絞り込みに対応
  - ユーザ情報編集はメールアドレス・パスワード変更に対応（キャンセルでトップへ戻る）
  - ユーザ情報編集画面のパスワード欄は表示/非表示の切替に対応（のぞき見可）
  - ユーザ登録/ユーザ情報編集の入力欄は角丸デザインに統一し、主要ボタンのラベルは中央寄せで表示
  - ユーザメンテナンスでは、自身と同等以上の権限ユーザに対する権限変更・削除・パスワードリセットは不可
  - `admin` はユーザメンテナンス画面で任意ユーザのパスワードを `pass` にリセット可能（自身と同等権限ユーザは対象外）
- **UIデザイン統一**
  - 画面全体の配色・角丸・ボタンスタイルを統一（テーマCSSを適用）
  - 全画面のボタン・テキストボックス・プルダウンの縦幅を統一（40px）
- **スケジュール登録・編集**
  - 登録者 / 同報者（複数）
  - 色設定
  - 定期予約（DAILY: 平日のみ, WEEKLY, BIWEEKLY）
  - 編集時は「定期予約を設定する」のON/OFFで更新範囲を判定
    - ON: 定期予約全体を変更
    - OFF: 当日のみ変更（同期解除）
- **スケジュール詳細・削除**
  - 編集画面から削除実行時に確認モーダルを表示
  - モーダルで削除対象の **タイトル / 日時 / 場所** を明示
  - 定期予約の場合は「定期予約ごと削除」チェックを表示（初期値 OFF）
    - OFF: 対象日のスケジュールのみ削除
    - ON: 同一の定期予約期間に含まれるスケジュールを一括削除

---

## ディレクトリ構成

- `scheduleWebApp/app` : アプリ本体
  - `public` : フロント（HTML/CSS/JS）
  - `server` : Express API / middleware / services / repositories
- `scheduleWebApp/db` : DDL・初期データ
- `scheduleWebApp/doc` : 仕様ドキュメント（Markdown）
  - `README.md` : ドキュメント構成ガイド
  - `01_overview/` : 全体仕様・アーキテクチャ・用語集
  - `02_screen-specs/` : 画面仕様・画面遷移
  - `03_backend-specs/` : バリデーション・API・エラーハンドリング方針
  - `04_design/` : CSSレイアウト仕様
  - `05_database/` : DB構成
  - `06_operations/` : 削除仕様・ローカル開発ガイド・テスト戦略

---

## 前提

- Node.js 18+
- npm
- MySQL

---

## セットアップ

### 1. 依存インストール

```bash
cd scheduleWebApp/app
npm install
```

### 2. DB作成

任意のDBを作成し、以下を実行してください。

```bash
# 例（mysql CLI）
mysql -u <user> -p <database_name> < ../db/createTables.sql
mysql -u <user> -p <database_name> < ../db/insertRecords.sql
```

> `createTables.sql` は再実行しやすいように `DROP TABLE IF EXISTS` と `FOREIGN_KEY_CHECKS` を利用した構成です。

### 3. `.env` 配置

`.env` は **`scheduleWebApp/app/.env`** に配置してください。

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
```

---

## 表示グループ編集（現行実装）

- 一覧画面: `/group_manage.html`
  - 表示対象: ログインユーザが編集可能なグループのみ
  - カラム: 編集/削除、グループタイプ、グループ名、ユーザ名（チップ）
  - 最下段の `+` 行から新規作成画面へ遷移
- 作成/編集画面: `/group_form.html`
  - `group_type`, `group_name`, `member_user_ids` を編集
  - 一般ユーザはPrivateのみ作成可、リーダー権限はPublicも作成可
- 編集系API: `/api/groups/editable*`

---

## 編集仕様（補足）

編集画面の更新フローは次の仕様です。

- 更新API: `PUT /api/schedules/:id`
- 定期予定を編集する場合は「定期予約を設定する」のチェック状態で更新範囲を判定
  - ON: 同一 `recurring_rule_id` の予定を全体更新（単体削除済みの日付は再作成しない）
  - OFF: 対象日1件のみ更新し、該当予定は定期予約から切り離される
- 定期予約全体を変更する場合、シリーズの開始日は既存ルールの開始日を維持する（途中日の編集でも過去分は消えない）
- 「定期予約を設定する」がOFFの場合は、同期解除される旨の注釈を表示
- 更新成功後はトップ画面（`/index.html`）へ遷移

---

## 削除仕様（補足）

編集画面の削除フローは次の仕様です。

- 削除ボタン押下で確認モーダルを表示
- 確認モーダルに削除対象情報（タイトル・日時・場所）を表示
- 定期予約に紐づく予定では、削除範囲をチェックボックスで切り替え
  - `delete_recurring=0`（OFF）: 対象スケジュールのみ削除（後続の定期予約全体更新でも削除済み日付は復活しない）
  - `delete_recurring=1`（ON）: 定期予約全体を削除

API は `DELETE /api/schedules/delete/:id?delete_recurring=0|1` で受け付けます。

---

## 起動

```bash
cd scheduleWebApp/app
npm start
```

または

```bash
cd scheduleWebApp/app
node server/server.js
```

> 注意: `node server.server.js` は誤りです（`/` 区切りが正しい）。

---

## 初期ログインユーザ（seed）

- `user1 / pass1`
- `user2 / pass2`
- `user3 / pass3`
- `user4 / pass4`

---

## よくあるトラブル

### `Cannot find module 'dotenv'`

`node_modules` が未インストールの可能性が高いです。

```bash
cd scheduleWebApp/app
npm install
```

### `Unauthorized` が表示される

未ログイン状態で保護APIへアクセスしています。`/login.html` からログインしてください。

---

## 補足

- このリポジトリは学習/検証用途のため、認証・セッションは最小構成です。
- 将来的に予定の公開範囲（プライベート予定）拡張を想定しています。
