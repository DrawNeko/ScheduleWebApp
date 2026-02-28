# 画面遷移仕様

## 1. 対象画面

| 画面 | パス | 用途 |
|---|---|---|
| ログイン | `/login.html` | 認証 |
| トップ（週間表示） | `/index.html` | スケジュール参照・導線の起点 |
| スケジュール登録 | `/schedule_add.html` | 新規予定作成 |
| スケジュール編集 | `/schedule_edit.html?id={schedule_id}` | 既存予定更新/削除 |
| スケジュール詳細 | `/schedule_detail.html?id={schedule_id}` | 詳細表示 |
| ユーザ登録 | `/user_register.html` | ユーザ作成 |
| グループ編集一覧 | `/group_manage.html` | 編集可能グループの一覧・新規導線 |
| グループ作成/編集 | `/group_form.html` | グループの作成・編集・削除 |

## 2. 認証によるアクセス制御

### 2.1 ルートアクセス

- `/` へアクセスした場合
  - ログイン済み: `/index.html` へリダイレクト
  - 未ログイン: `/login.html` へリダイレクト

### 2.2 未ログイン時の `.html` アクセス

- `/login.html` 以外のHTMLへアクセスした場合、`/login.html` へリダイレクト

### 2.3 公開パス（未ログインでもアクセス可）

```text
/login.html
/assets/css/login.css
/assets/js/login.js
```

## 3. 画面別遷移一覧

| 起点画面 | 操作 | 遷移先 | 補足 |
|---|---|---|---|
| `/login.html` | ログイン成功 | `/index.html` | `/api/auth/login` 成功後 |
| `/login.html` | ログイン失敗 | 同画面 | エラーメッセージ表示 |
| `/index.html` | ログアウト | `/login.html` | `/api/auth/logout` 実行後 |
| `/index.html` | 予定チップをダブルクリック | `/schedule_edit.html?id={id}` | 編集導線 |
| `/index.html` | 空セルをダブルクリック | `/schedule_add.html?user={user_id}&date={yyyy-mm-dd}` | 新規作成導線 |
| `/index.html` | 表示グループの「編集」 | `/group_manage.html` | グループ管理導線 |
| `/group_manage.html` | 一覧の「編集/削除」 | `/group_form.html?id={group_id}` | 既存グループ編集・削除 |
| `/group_manage.html` | 一番下の「+」行 | `/group_form.html` | 新規グループ作成 |
| `/group_form.html` | 保存成功/削除成功 | `/group_manage.html` | 一覧へ戻る |
| `/schedule_add.html` | 登録成功 | `/`（→`/index.html`） | サーバ側リダイレクト |
| `/schedule_add.html` | 登録失敗 | 同画面 | アラート表示 |
| `/schedule_edit.html` | 更新成功 | `/index.html` | `/api/schedules/:id` 成功後 |
| `/schedule_edit.html` | 削除成功 | `/index.html` | `/api/schedules/delete/:id` 成功後 |
| `/schedule_edit.html` | 更新/削除失敗 | 同画面 | アラート表示 |
| `/schedule_detail.html` | 編集ボタン | `/schedule_edit.html?id={id}` | 詳細→編集 |
| `/schedule_detail.html` | 削除成功 | `/index.html` | 確認ダイアログOK後 |
| `/user_register.html` | 登録成功 | `/`（→`/index.html`） | サーバ側リダイレクト |
| `/user_register.html` | 登録失敗 | 同画面 | アラート表示 |

## 4. 例外遷移

- `schedule_edit.html` / `schedule_detail.html` で `id` クエリがない場合:
  - アラート表示後にトップへ遷移

## 5. 補足

> NOTE: `schedule_detail.html` は現状、トップ画面から直接遷移するUI導線がありません。
> URL直アクセスまたは他画面からのリンクを前提にしています。
