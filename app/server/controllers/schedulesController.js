/**
 * scheduleWebApp/app/server/controllers/schedulesController.js
 */

const schedulesService = require("../services/schedulesService");
const path = require("path");

/* ============================================================
   スケジュール登録画面（HTML）
============================================================ */

/**
 * getAddPage の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getAddPage = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "../public", "schedule_add.html"));
};

/* ============================================================
   一覧取得
============================================================ */

/**
 * getAll の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getAll = async (req, res) => {
  try {
    const { start, end, include_users } = req.query;

    let schedules;
    if (start && end) {
      schedules = await schedulesService.getByDateRange(start, end);
    } else {
      schedules = await schedulesService.getAll();
    }

    const shouldIncludeUsers = include_users === "1" || include_users === "true";
    if (!shouldIncludeUsers) {
      return res.json(schedules);
    }

    const scheduleIds = schedules.map(s => s.schedule_id);
    const userLinks = await schedulesService.getUsersByScheduleIds(scheduleIds);

    const usersByScheduleId = userLinks.reduce((acc, link) => {
      if (!acc[link.schedule_id]) {
        acc[link.schedule_id] = [];
      }
      acc[link.schedule_id].push({
        user_id: link.user_id,
        name: link.name
      });
      return acc;
    }, {});

    const enrichedSchedules = schedules.map(s => ({
      ...s,
      participants: usersByScheduleId[s.schedule_id] || []
    }));

    return res.json(enrichedSchedules);
  } catch (err) {
    console.error("getAll error:", err);
    return res.status(500).json({ error: "Failed to fetch schedules" });
  }
};

/* ============================================================
   新規登録（JSON 受信）
============================================================ */

/**
 * create の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.create = async (req, res) => {
  try {
    const id = await schedulesService.createWithParticipants(req.body);
    res.status(201).json({
      message: "created",
      schedule_id: id
    });
  } catch (err) {
    console.error("create error:", err);
    res.status(500).send("Failed to create schedule");
  }
};

/* ============================================================
   詳細ページ（HTML）
============================================================ */

/**
 * getDetailPage の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getDetailPage = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "../public", "schedule_detail.html"));
};

/* ============================================================
   詳細 API
============================================================ */

/**
 * getDetailAPI の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getDetailAPI = async (req, res) => {
  try {
    const schedule = await schedulesService.getDetail(req.params.id);
    res.json(schedule);
  } catch (err) {
    console.error("getDetailAPI error:", err);
    res.status(500).json({ error: "Failed to fetch schedule detail" });
  }
};

/* ============================================================
   参加者 API
============================================================ */

/**
 * getUsers の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await schedulesService.getUsers(req.params.id);
    res.json(users);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ error: "Failed to fetch schedule users" });
  }
};

/* ============================================================
   編集ページ（HTML）
============================================================ */

/**
 * getEditPage の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getEditPage = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "../public", "schedule_edit.html"));
};

/* ============================================================
   更新（JSON 受信）
============================================================ */

/**
 * update の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.update = async (req, res) => {
  try {
    await schedulesService.updateWithParticipants(req.params.id, req.body);
    res.json({ message: "updated" });
  } catch (err) {
    console.error("update error:", err);
    res.status(500).json({ error: "Failed to update schedule" });
  }
};

/* ============================================================
   削除
============================================================ */

/**
 * remove の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.remove = async (req, res) => {
  try {
    const deleteRecurring = req.query.delete_recurring === "1" || req.query.delete_recurring === "true";
    await schedulesService.remove(req.params.id, { deleteRecurring });
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("remove error:", err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
};
