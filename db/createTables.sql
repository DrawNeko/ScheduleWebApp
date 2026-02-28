-- =============================================================================
-- scheduleWebApp/db/createTables.sql
-- =============================================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- テーブル削除 (子 -> 親順 order)
-- ------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS user_schedule;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS recurring_rules;
DROP TABLE IF EXISTS group_management;
DROP TABLE IF EXISTS colors;
DROP TABLE IF EXISTS group_master;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- ユーザ: アプリ利用可能定義
-- ------------------------------------------------------------
CREATE TABLE users (
  user_id           VARCHAR(50)  NOT NULL,
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(100) NULL,
  role              VARCHAR(50)  NULL,
  password          VARCHAR(255) NOT NULL,
  default_group_id  INT          NULL,
  PRIMARY KEY (user_id)
);

-- ------------------------------------------------------------
-- グループマスタ: 表示グループ定義
-- ------------------------------------------------------------
CREATE TABLE group_master (
  group_id       INT AUTO_INCREMENT NOT NULL,
  group_name     VARCHAR(30)        NOT NULL,
  group_type     ENUM('PUBLIC', 'PRIVATE') NOT NULL,
  owner_user_id  VARCHAR(50)        NULL,
  PRIMARY KEY (group_id)
);

-- ------------------------------------------------------------
-- グループ管理: メンバー別のグループ管理
-- ------------------------------------------------------------
CREATE TABLE group_management (
  group_id  INT         NOT NULL,
  user_id   VARCHAR(50) NOT NULL,
  PRIMARY KEY (group_id, user_id),
  CONSTRAINT fk_group_management_group
    FOREIGN KEY (group_id) REFERENCES group_master(group_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_group_management_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 定期予約ルール
-- ------------------------------------------------------------
CREATE TABLE recurring_rules (
  rule_id      INT AUTO_INCREMENT NOT NULL,
  created_by   VARCHAR(50)  NOT NULL,
  title        VARCHAR(100) NOT NULL,
  frequency    ENUM('DAILY', 'WEEKLY', 'BIWEEKLY') NOT NULL,
  weekday      TINYINT      NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time   TIME         NOT NULL,
  end_time     TIME         NOT NULL,
  start_date   DATE         NOT NULL,
  end_date     DATE         NOT NULL,
  location     VARCHAR(50)  NULL,
  memo         VARCHAR(1000) NULL,
  color_name   VARCHAR(30)  NULL,
  PRIMARY KEY (rule_id),
  CONSTRAINT fk_recurring_rules_created_by
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- ------------------------------------------------------------
-- スケジュール: 詳細スケジュール
-- ------------------------------------------------------------
CREATE TABLE schedules (
  schedule_id        INT AUTO_INCREMENT NOT NULL,
  title              VARCHAR(100)  NOT NULL,
  start_datetime     DATETIME      NOT NULL,
  end_datetime       DATETIME      NULL,
  location           VARCHAR(50)   NULL,
  memo               VARCHAR(1000) NULL,
  color_name         VARCHAR(30)   NULL,
  created_by         VARCHAR(50)   NOT NULL,
  recurring_rule_id  INT           NULL,
  PRIMARY KEY (schedule_id),
  CONSTRAINT fk_schedules_created_by
    FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_schedules_recurring_rule
    FOREIGN KEY (recurring_rule_id) REFERENCES recurring_rules(rule_id)
);

-- ------------------------------------------------------------
-- ユーザスケジュール: スケジュールの参加者
-- ------------------------------------------------------------
CREATE TABLE user_schedule (
  user_id      VARCHAR(50) NOT NULL,
  schedule_id  INT         NOT NULL,
  PRIMARY KEY (user_id, schedule_id),
  CONSTRAINT fk_user_schedule_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_schedule_schedule
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id)
    ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 色: スケジュールチップの色定義
-- ------------------------------------------------------------
CREATE TABLE colors (
  color_id         INT AUTO_INCREMENT NOT NULL,
  color_name       VARCHAR(30) NOT NULL,
  color_code_bg    CHAR(7)     NOT NULL,
  color_code_text  CHAR(7)     NOT NULL,
  PRIMARY KEY (color_id),
  UNIQUE KEY uq_colors_name (color_name)
);

-- ------------------------------------------------------------
-- インデックス
-- ------------------------------------------------------------
CREATE INDEX idx_schedules_start_datetime  ON schedules(start_datetime);
CREATE INDEX idx_schedules_created_by      ON schedules(created_by);
CREATE INDEX idx_schedules_color_name      ON schedules(color_name);
CREATE INDEX idx_schedules_recurring_rule  ON schedules(recurring_rule_id);

CREATE INDEX idx_user_schedule_user        ON user_schedule(user_id);
CREATE INDEX idx_user_schedule_schedule    ON user_schedule(schedule_id);

CREATE INDEX idx_users_name                ON users(name);
CREATE INDEX idx_users_default_group_id    ON users(default_group_id);

CREATE INDEX idx_recurring_rules_created_by ON recurring_rules(created_by);
CREATE INDEX idx_recurring_rules_date_range ON recurring_rules(start_date, end_date);

CREATE INDEX idx_group_master_type         ON group_master(group_type);
CREATE INDEX idx_group_master_owner        ON group_master(owner_user_id);
CREATE INDEX idx_group_management_user     ON group_management(user_id);

-- ------------------------------------------------------------
-- Deferred FK: users.default_group_id -> group_master.group_id
-- ------------------------------------------------------------
ALTER TABLE users
  ADD CONSTRAINT fk_users_default_group
  FOREIGN KEY (default_group_id) REFERENCES group_master(group_id);
