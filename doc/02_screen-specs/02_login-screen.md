⑤ログイン仕様

【対象画面】
- login.html

【目的】
- 利用者を認証し、保護された画面/APIへのアクセスを許可する。

【UI要件】
1. ユーザID入力欄を表示する。
2. パスワード入力欄を表示する。
3. ログインボタンを表示する。
4. 認証失敗時はエラーメッセージを表示する。

【処理フロー】
1. ログインボタン押下で入力値を検証する（未入力チェック）。
2. `POST /api/auth/login` にユーザID/パスワードを送信する。
3. 成功時はセッションを確立し、トップ画面へ遷移する。
4. 失敗時は画面遷移せず、エラーメッセージを表示する。

【API仕様】
- POST /api/auth/login
  - request: { user_id, password }
  - response(成功): { message: "ok" } など

- POST /api/auth/logout
  - request: {}
  - response(成功): { message: "logged out" } など

- GET /api/auth/me
  - ログイン中ユーザ情報を返す

【アクセス制御】
- 未ログインで保護ページにアクセスした場合は login.html へ誘導する。
- 認証状態はサーバーセッションで管理する。
