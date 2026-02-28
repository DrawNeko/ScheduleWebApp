# DB構成（DDL）

## 1. 対象

- DDL実体: `scheduleWebApp/db/createTables.sql`
- 本資料は主要テーブルと制約の要約

## 2. ER観点の主要エンティティ

| テーブル | 用途 | 主キー |
|---|---|---|
| `users` | ユーザマスタ | `user_id` |
| `group_master` | 表示グループ定義 | `group_id` |
| `group_management` | グループ所属ユーザ | `(group_id, user_id)` |
| `recurring_rules` | 定期予約ルール | `rule_id` |
| `schedules` | 予定本体 | `schedule_id` |
| `user_schedule` | 予定参加者紐付け | `(user_id, schedule_id)` |
| `colors` | 表示色マスタ | `color_id` |

## 3. テーブル定義（要点）

### 3.1 users

- `default_group_id` は `group_master.group_id` を参照（後段ALTERで付与）

```sql
CREATE TABLE users (
  user_id           VARCHAR(50)  NOT NULL,
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(100) NULL,
  role              VARCHAR(50)  NULL,
  password          VARCHAR(255) NOT NULL,
  default_group_id  INT          NULL,
  PRIMARY KEY (user_id)
);
```

### 3.2 group_master / group_management

- `group_master.group_type`: `PUBLIC` / `PRIVATE`
- `group_management` は中間テーブル

### 3.3 recurring_rules / schedules

- `recurring_rules.frequency`: `DAILY` / `WEEKLY` / `BIWEEKLY`
- `recurring_rules.weekday`: `0-6` のチェック制約
- `schedules.recurring_rule_id` が定期ルールへの紐付け

### 3.4 user_schedule

- 予定と参加者の多対多を管理
- 外部キーは両方 `ON DELETE CASCADE`

### 3.5 colors

- `color_name` は一意制約（`uq_colors_name`）

## 4. 外部キー整理

| 子テーブル.カラム | 親テーブル.カラム | 備考 |
|---|---|---|
| `group_management.group_id` | `group_master.group_id` | `ON DELETE CASCADE` |
| `group_management.user_id` | `users.user_id` | `ON DELETE CASCADE` |
| `recurring_rules.created_by` | `users.user_id` | ルール作成者 |
| `schedules.created_by` | `users.user_id` | 登録者 |
| `schedules.recurring_rule_id` | `recurring_rules.rule_id` | 定期予定時のみ |
| `user_schedule.user_id` | `users.user_id` | `ON DELETE CASCADE` |
| `user_schedule.schedule_id` | `schedules.schedule_id` | `ON DELETE CASCADE` |
| `users.default_group_id` | `group_master.group_id` | 後段ALTERで追加 |

## 5. インデックス方針（抜粋）

- `schedules.start_datetime`, `schedules.created_by`, `schedules.recurring_rule_id`
- `user_schedule.user_id`, `user_schedule.schedule_id`
- `users.default_group_id`
- `group_master.group_type`, `group_master.owner_user_id`
- `recurring_rules.start_date, end_date`

## 6. DDL整理のポイント

- `DROP TABLE IF EXISTS` + `FOREIGN_KEY_CHECKS` により再実行しやすい構成
- 制約名を明示（`fk_*`, `uq_*`）して保守性を向上
- セクション分割とコメント整理で可読性を向上
