④削除仕様（編集画面）

【対象画面】
- schedule_edit.html

【目的】
- 誤削除を防止するため、削除前に対象情報を確認できるようにする。
- 定期予約について「当日のみ削除」または「定期予約全体削除」を選択できるようにする。

【UI要件】
1. 編集画面に削除ボタンを表示する。
2. 削除ボタン押下で確認モーダルを表示する。
3. モーダル内に以下の削除対象情報を表示する。
   - タイトル
   - 日時
   - 場所
4. 対象スケジュールが定期予約（recurring_rule_idあり）の場合のみ、
   「定期予約ごと削除」チェックボックスを表示する。
5. チェックボックスの初期値はOFF。
6. モーダルに「削除する」「キャンセル」を表示する。

【削除範囲】
- チェックOFF（delete_recurring=0）
  - 対象スケジュール1件のみ削除する。
- チェックON（delete_recurring=1）
  - 同一 recurring_rule_id に紐づくスケジュールを全件削除し、
    対応する recurring_rules レコードも削除する。

【API仕様】
- エンドポイント
  - DELETE /api/schedules/delete/:id?delete_recurring=0|1

- クエリ
  - delete_recurring
    - 0: 対象IDのみ削除（既定値）
    - 1: 定期予約全体を削除

- レスポンス（成功）
  - { "message": "deleted" }

【サーバー処理ルール】
1. 指定IDのスケジュール詳細を取得する。
2. recurring_rule_id があり、delete_recurring=1 の場合
   - 同一 recurring_rule_id の schedules を削除
   - recurring_rules の該当 rule_id を削除
3. それ以外（delete_recurring=0 または単発予定）の場合
   - 対象 schedule_id のみ削除
4. 3 の実行後、定期予定だった場合は同一ルールの残件数を確認し、
   0件なら recurring_rules も削除する（孤立ルール防止）。

【補足】
- 定期予約の単体削除（delete_recurring=0）で消した日付は、後続の「定期予約を設定する=ON」による全体更新でも自動復活しない。
- user_schedule は schedules の外部キー（ON DELETE CASCADE）で連動削除される。
- 定期予約であっても、UIからはチェックOFFのまま単体削除が可能。

【画面遷移】
- 削除成功後はトップ画面（`/index.html`）へ遷移する。
