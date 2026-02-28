⑦スケジュール登録仕様（新規）

【対象画面】
- schedule_add.html

【目的】
- 単発予定または定期予定を作成し、参加者へ紐付ける。

【UI要件】
1. 登録者選択、同報者追加（チップ）を提供する。
2. タイトル、予定日、開始/終了時刻、場所、メモ、色を入力可能にする。
3. 「定期予約を設定する」チェックで定期入力欄を表示/非表示する。
4. 定期入力欄は終了日と頻度（DAILY/WEEKLY/BIWEEKLY）を持つ。

【入力制約】
- 終了時刻は開始時刻以上であること。
- 定期予約ON時は終了日必須。
- 定期終了日は予定日以上であること。

【送信仕様】
- `POST /api/schedules` にフォーム情報を送信する。
- 参加者は `participants[]` として送信する。
- 定期予約ON時は `is_recurring=1`, `recurring_end_date`, `recurring_frequency` を付与する。

【サーバー処理ルール】
1. 単発予定:
   - schedules へ1件作成
   - 作成者 + 同報者を user_schedule へ作成
2. 定期予定:
   - recurring_rules を1件作成
   - ルール展開で schedules を複数作成
   - 各予定へ user_schedule を作成

【補足】
- DAILY は平日（月〜金）のみ作成対象とする。
