/**
 * scheduleWebApp/app/server/repositories/schedulesRepository.js
 */

const db = require("../config/db");

/**
 * runQuery の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

/**
 * create の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.create = async (data) => {
  const sql = `
    INSERT INTO schedules
    (title, start_datetime, end_datetime, location, memo, color_name, created_by, recurring_rule_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  return runQuery(sql, [
    data.title,
    data.start_datetime,
    data.end_datetime || null,
    data.location || null,
    data.memo || null,
    data.color_name || null,
    data.created_by,
    data.recurring_rule_id || null
  ]);
};

/**
 * createRecurringRule の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.createRecurringRule = (rule) => {
  const sql = `
    INSERT INTO recurring_rules
    (created_by, title, frequency, weekday, start_time, end_time, start_date, end_date, location, memo, color_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  return runQuery(sql, [
    rule.created_by,
    rule.title,
    rule.frequency,
    rule.weekday,
    rule.start_time,
    rule.end_time,
    rule.start_date,
    rule.end_date,
    rule.location || null,
    rule.memo || null,
    rule.color_name || null
  ]);
};

/**
 * updateRecurringRule の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.updateRecurringRule = (ruleId, rule) => {
  const sql = `
    UPDATE recurring_rules
    SET created_by=?, title=?, frequency=?, weekday=?, start_time=?, end_time=?, start_date=?, end_date=?, location=?, memo=?, color_name=?
    WHERE rule_id=?
  `;

  return runQuery(sql, [
    rule.created_by,
    rule.title,
    rule.frequency,
    rule.weekday,
    rule.start_time,
    rule.end_time,
    rule.start_date,
    rule.end_date,
    rule.location || null,
    rule.memo || null,
    rule.color_name || null,
    ruleId
  ]);
};

/**
 * getRecurringRuleById の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getRecurringRuleById = (ruleId) => {
  return runQuery("SELECT * FROM recurring_rules WHERE rule_id = ?", [ruleId]);
};

/**
 * deleteSchedulesByRecurringRuleId の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.deleteSchedulesByRecurringRuleId = (ruleId) => {
  return runQuery("DELETE FROM schedules WHERE recurring_rule_id = ?", [ruleId]);
};

/**
 * countSchedulesByRecurringRuleId の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.countSchedulesByRecurringRuleId = async (ruleId) => {
  const results = await runQuery("SELECT COUNT(*) AS count FROM schedules WHERE recurring_rule_id = ?", [ruleId]);
  return results[0]?.count || 0;
};

/**
 * getSchedulesByRecurringRuleId の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getSchedulesByRecurringRuleId = (ruleId) => {
  return runQuery(
    "SELECT schedule_id, start_datetime FROM schedules WHERE recurring_rule_id = ?",
    [ruleId]
  );
};

/**
 * deleteRecurringRuleById の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.deleteRecurringRuleById = (ruleId) => {
  return runQuery("DELETE FROM recurring_rules WHERE rule_id = ?", [ruleId]);
};

/**
 * deleteUserScheduleByScheduleId の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.deleteUserScheduleByScheduleId = (scheduleId) => {
  return runQuery("DELETE FROM user_schedule WHERE schedule_id = ?", [scheduleId]);
};

/**
 * insertUserSchedules の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.insertUserSchedules = (values) => {
  return runQuery("INSERT INTO user_schedule (user_id, schedule_id) VALUES ?", [values]);
};

/**
 * updateById の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.updateById = (id, data) => {
  const sql = `
    UPDATE schedules
    SET title=?, start_datetime=?, end_datetime=?, location=?, memo=?, color_name=?, created_by=?, recurring_rule_id=?
    WHERE schedule_id=?
  `;

  return runQuery(sql, [
    data.title,
    data.start_datetime,
    data.end_datetime,
    data.location,
    data.memo,
    data.color_name,
    data.created_by,
    data.recurring_rule_id || null,
    id
  ]);
};

/**
 * getAllWithColors の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getAllWithColors = () => {
  return runQuery(`
    SELECT s.*, c.color_code_bg, c.color_code_text
    FROM schedules s
    LEFT JOIN colors c ON s.color_name = c.color_name
  `);
};

/**
 * getByDateRangeWithColors の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getByDateRangeWithColors = (start, end) => {
  return runQuery(
    `
    SELECT s.*, c.color_code_bg, c.color_code_text
    FROM schedules s
    LEFT JOIN colors c ON s.color_name = c.color_name
    WHERE DATE(s.start_datetime) BETWEEN ? AND ?
    `,
    [start, end]
  );
};

/**
 * getDetailById の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getDetailById = (id) => {
  return runQuery(
    `
    SELECT
      s.*,
      u.name AS created_by_name,
      c.color_code_bg,
      c.color_code_text
    FROM schedules s
    LEFT JOIN users u ON s.created_by = u.user_id
    LEFT JOIN colors c ON s.color_name = c.color_name
    WHERE s.schedule_id = ?
    `,
    [id]
  );
};

/**
 * getUsersByScheduleIds の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getUsersByScheduleIds = (scheduleIds) => {
  return runQuery(
    `
    SELECT us.schedule_id, u.user_id, u.name
    FROM user_schedule us
    JOIN users u ON us.user_id = u.user_id
    WHERE us.schedule_id IN (?)
    `,
    [scheduleIds]
  );
};

/**
 * getUsersByScheduleId の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getUsersByScheduleId = (scheduleId) => {
  return runQuery(
    `
    SELECT u.user_id, u.name
    FROM user_schedule us
    JOIN users u ON us.user_id = u.user_id
    WHERE us.schedule_id = ?
    `,
    [scheduleId]
  );
};

/**
 * deleteById の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.deleteById = (id) => {
  return runQuery("DELETE FROM schedules WHERE schedule_id = ?", [id]);
};
