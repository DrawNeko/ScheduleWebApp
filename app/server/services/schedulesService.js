/**
 * scheduleWebApp/app/server/services/schedulesService.js
 */

const schedulesRepository = require("../repositories/schedulesRepository");

/**
 * normalizeParticipants の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function normalizeParticipants(body) {
  if (Array.isArray(body.participants)) return body.participants;
  if (body["participants[]"]) return [].concat(body["participants[]"]);
  if (body.participants) return [body.participants];
  return [];
}

/**
 * pad2 の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * toDateString の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function toDateString(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function isRecurringEnabled(body) {
  return !(body.is_recurring === false || body.is_recurring === "false" || body.is_recurring === "0" || body.is_recurring === undefined || body.is_recurring === null);
}

/**
 * buildRecurringRuleFromBody の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function buildRecurringRuleFromBody(body) {
  if (!body.is_recurring || body.is_recurring === "false" || body.is_recurring === "0") {
    return null;
  }

  if (!body.recurring_end_date || !body.recurring_frequency) {
    throw new Error("Recurring fields are required");
  }

  const startDate = new Date(body.start_datetime);
  const endDate = new Date(body.recurring_end_date);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error("Invalid recurring dates");
  }
  if (endDate < new Date(toDateString(startDate))) {
    throw new Error("Recurring end date must be same or after start date");
  }

  return {
    created_by: body.created_by,
    title: body.title,
    frequency: body.recurring_frequency,
    weekday: startDate.getDay(),
    start_time: body.start_datetime.slice(11, 19),
    end_time: body.end_datetime ? body.end_datetime.slice(11, 19) : body.start_datetime.slice(11, 19),
    start_date: body.start_datetime.slice(0, 10),
    end_date: body.recurring_end_date,
    location: body.location,
    memo: body.memo,
    color_name: body.color_name
  };
}

/**
 * createRecurringDates の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function createRecurringDates(rule) {
  const start = new Date(rule.start_date);
  const end = new Date(rule.end_date);
  const dates = [];

  if (rule.frequency === "DAILY") {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(toDateString(d));
      }
    }
    return dates;
  }

  const interval = rule.frequency === "BIWEEKLY" ? 14 : 7;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + interval)) {
    dates.push(toDateString(d));
  }

  return dates;
}

/**
 * buildScheduleDataForDate の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function buildScheduleDataForDate(base, date, recurringRuleId = null) {
  const startTime = base.start_datetime.slice(11, 19);
  const endTime = base.end_datetime ? base.end_datetime.slice(11, 19) : null;

  return {
    ...base,
    start_datetime: `${date} ${startTime}`,
    end_datetime: endTime ? `${date} ${endTime}` : null,
    recurring_rule_id: recurringRuleId
  };
}

/**
 * buildParticipantValues の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function buildParticipantValues(scheduleId, createdBy, participants) {
  const allUsers = [createdBy, ...participants];
  return allUsers.map(uid => [uid, scheduleId]);
}

/**
 * insertParticipantsForNewSchedule の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
async function insertParticipantsForNewSchedule(scheduleId, createdBy, participants) {
  const values = buildParticipantValues(scheduleId, createdBy, participants);
  if (values.length === 0) return;
  await schedulesRepository.insertUserSchedules(values);
}

/**
 * createSchedulesFromRule の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
async function createSchedulesFromRule(baseData, rule, participants, existingRuleId = null, excludedDates = new Set()) {
  const ruleId = existingRuleId || (await schedulesRepository.createRecurringRule(rule)).insertId;

  if (existingRuleId) {
    await schedulesRepository.updateRecurringRule(existingRuleId, rule);
  }

  const dates = createRecurringDates(rule);
  let firstScheduleId = null;

  for (const date of dates) {
    if (excludedDates.has(date)) {
      continue;
    }

    const scheduleData = buildScheduleDataForDate(baseData, date, ruleId);
    const result = await schedulesRepository.create(scheduleData);

    if (!firstScheduleId) firstScheduleId = result.insertId;

    await insertParticipantsForNewSchedule(result.insertId, baseData.created_by, participants);
  }

  return { ruleId, firstScheduleId };
}

function findDeletedOccurrenceDates(existingSchedules, recurringRule) {
  if (!recurringRule) return new Set();

  const expectedDates = createRecurringDates(recurringRule);
  const existingDateSet = new Set(
    existingSchedules.map((schedule) => String(schedule.start_datetime).slice(0, 10))
  );

  const deletedDates = expectedDates.filter(date => !existingDateSet.has(date));
  return new Set(deletedDates);
}

/* ============================================================
   新規登録
============================================================ */

/**
 * create の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.create = async (data) => {
  const result = await schedulesRepository.create(data);
  return result.insertId;
};

/**
 * createWithParticipants の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.createWithParticipants = async (body) => {
  const participants = normalizeParticipants(body);
  const recurringRule = buildRecurringRuleFromBody(body);

  if (recurringRule) {
    const { firstScheduleId } = await createSchedulesFromRule(body, recurringRule, participants);
    return firstScheduleId;
  }

  const scheduleId = await exports.create({ ...body, recurring_rule_id: null });
  await exports.setParticipants(scheduleId, body.created_by, participants);
  return scheduleId;
};

/**
 * setParticipants の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.setParticipants = async (scheduleId, createdBy, participants) => {
  await schedulesRepository.deleteUserScheduleByScheduleId(scheduleId);

  const values = buildParticipantValues(scheduleId, createdBy, participants);
  if (values.length === 0) return;

  await schedulesRepository.insertUserSchedules(values);
};

/**
 * update の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.update = async (id, data) => {
  await schedulesRepository.updateById(id, data);
};

/**
 * updateWithParticipants の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.updateWithParticipants = async (id, body) => {
  const participants = normalizeParticipants(body);
  const recurringRule = buildRecurringRuleFromBody(body);
  const existingDetail = await exports.getDetail(id);
  const currentRuleId = existingDetail?.recurring_rule_id || null;
  const recurringChecked = isRecurringEnabled(body);

  if (currentRuleId && !recurringChecked) {
    await exports.update(id, { ...body, recurring_rule_id: null });
    await exports.setParticipants(id, body.created_by, participants);

    const remainingCount = await schedulesRepository.countSchedulesByRecurringRuleId(currentRuleId);
    if (remainingCount === 0) {
      await schedulesRepository.deleteRecurringRuleById(currentRuleId);
    }
    return;
  }

  if (recurringRule) {
    if (currentRuleId) {
      const existingRecurringRule = existingDetail?.recurring_rule || null;
      const existingSchedules = await schedulesRepository.getSchedulesByRecurringRuleId(currentRuleId);
      const deletedOccurrenceDates = findDeletedOccurrenceDates(existingSchedules, existingRecurringRule);

      if (existingRecurringRule?.start_date) {
        recurringRule.start_date = existingRecurringRule.start_date;
      }

      await schedulesRepository.deleteSchedulesByRecurringRuleId(currentRuleId);
      await createSchedulesFromRule(body, recurringRule, participants, currentRuleId, deletedOccurrenceDates);
      return;
    }

    await createSchedulesFromRule(body, recurringRule, participants);
    await schedulesRepository.deleteById(id);
    return;
  }

  if (currentRuleId) {
    await schedulesRepository.deleteSchedulesByRecurringRuleId(currentRuleId);
    await schedulesRepository.deleteRecurringRuleById(currentRuleId);

    const result = await schedulesRepository.create({ ...body, recurring_rule_id: null });
    await exports.setParticipants(result.insertId, body.created_by, participants);
    return;
  }

  await exports.update(id, { ...body, recurring_rule_id: null });
  await exports.setParticipants(id, body.created_by, participants);
};

/**
 * getAll の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getAll = async () => schedulesRepository.getAllWithColors();

/**
 * getByDateRange の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getByDateRange = async (start, end) => schedulesRepository.getByDateRangeWithColors(start, end);

/**
 * getDetail の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getDetail = async (id) => {
  const results = await schedulesRepository.getDetailById(id);
  const detail = results[0];

  if (!detail) return null;
  if (!detail.recurring_rule_id) return detail;

  const recurringRules = await schedulesRepository.getRecurringRuleById(detail.recurring_rule_id);
  detail.recurring_rule = recurringRules[0] || null;

  return detail;
};

/**
 * getUsersByScheduleIds の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getUsersByScheduleIds = async (scheduleIds) => {
  if (!Array.isArray(scheduleIds) || scheduleIds.length === 0) return [];
  return schedulesRepository.getUsersByScheduleIds(scheduleIds);
};

/**
 * getUsers の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getUsers = async (scheduleId) => schedulesRepository.getUsersByScheduleId(scheduleId);

/**
 * remove の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.remove = async (id, options = {}) => {
  const { deleteRecurring = false } = options;
  const detail = await exports.getDetail(id);

  if (!detail) return;

  if (detail.recurring_rule_id && deleteRecurring) {
    await schedulesRepository.deleteSchedulesByRecurringRuleId(detail.recurring_rule_id);
    await schedulesRepository.deleteRecurringRuleById(detail.recurring_rule_id);
    return;
  }

  await schedulesRepository.deleteById(id);

  if (detail.recurring_rule_id) {
    const remainingCount = await schedulesRepository.countSchedulesByRecurringRuleId(detail.recurring_rule_id);
    if (remainingCount === 0) {
      await schedulesRepository.deleteRecurringRuleById(detail.recurring_rule_id);
    }
  }
};
