# テスト戦略（現状）

## 1. 現状整理

- `package.json` の `npm test` はダミー定義（自動テスト未整備）
- 現在は手動確認（E2E観点）が中心

## 2. 推奨テスト観点

### 2.1 認証

- 正常ログイン（`user1/pass1`）
- 誤パスワードで401系挙動
- 未ログイン時に保護画面へ直接アクセスした場合のリダイレクト

### 2.2 スケジュール機能

- 新規作成（単発）
- 新規作成（定期予約）
- 編集（定期ON/OFF切り替え）
- 単体削除 / 定期予約全体削除

### 2.3 表示グループ

- Public/Privateの表示可否
- デフォルトグループ保存と再ログイン時反映

## 3. API最小回帰チェック（例）

```bash
# 未ログイン時
curl -i http://localhost:3000/api/auth/me

# ログイン後（Cookie保持）
curl -i -c cookie.txt -H 'Content-Type: application/json' \
  -d '{"user_id":"user1","password":"pass1"}' \
  http://localhost:3000/api/auth/login

# 認証付きで自身情報取得
curl -i -b cookie.txt http://localhost:3000/api/auth/me
```

## 4. 将来の自動化方針

| 優先度 | テスト | 目的 |
|---|---|---|
| 高 | Service層ユニットテスト | 定期予約ロジックの回帰防止 |
| 高 | API統合テスト（supertest） | ステータス/JSON契約の固定 |
| 中 | Playwright E2E | 主要画面遷移と登録/編集/削除の自動検証 |
| 中 | Lint/Format導入 | ドキュメント・コード品質の均一化 |
