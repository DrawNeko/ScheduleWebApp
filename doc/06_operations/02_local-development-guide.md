# ローカル開発ガイド

## 1. 前提ソフトウェア

| ソフトウェア | バージョン目安 |
|---|---|
| Node.js | 18+ |
| npm | Node同梱 |
| MySQL | 8系推奨 |

## 2. 初期セットアップ

```bash
cd scheduleWebApp/app
npm install
```

DB初期化:

```bash
mysql -u <user> -p <database_name> < ../db/createTables.sql
mysql -u <user> -p <database_name> < ../db/insertRecords.sql
```

`.env`（`scheduleWebApp/app/.env`）例:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
```

## 3. 起動方法

| コマンド | 用途 |
|---|---|
| `npm start` | 通常起動 |
| `npm run dev` | nodemonで開発起動 |

## 4. 動作確認チェックリスト

- [ ] `http://localhost:3000/` でログイン画面表示
- [ ] `user1 / pass1` でログインできる
- [ ] 週間画面の前後移動ボタンが動作する
- [ ] 空セルダブルクリックで新規登録画面へ遷移
- [ ] 予定作成後に週間表へ表示される
- [ ] 編集画面の削除モーダルが表示される

## 5. トラブルシュート

| 症状 | 主な原因 | 対応 |
|---|---|---|
| `Cannot find module 'dotenv'` | 依存未導入 | `npm install` |
| `Unauthorized` | 未ログインで保護APIアクセス | `/login.html` からログイン |
| 画面が真っ白 | JSエラー | ブラウザDevTools Console確認 |
| DB接続失敗 | `.env` 設定不備 | DB_HOST/USER/PASSWORD/DB_NAME確認 |
