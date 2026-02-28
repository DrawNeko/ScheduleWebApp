/**
 * scheduleWebApp/app/server/controllers/colorsController.js
 */

// colorsテーブルを扱うコントローラ
// フロント(HTML/JS)からのリクエストを受け取り、サービス層(colorsService)に処理を委譲し、結果を返す。
const colorsService = require("../services/colorsService");

/* ============================================================
   colorsテーブルの全レコードを取得
============================================================ */

/**
 * getAll の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getAll = async (req, res) => {
  try {
    // colorsService.getAll()を呼び出す
    const colors = await colorsService.getAll();
    // 取得した結果をJSONとして返却
    res.json(colors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch colors" });
  }
};

/* ============================================================
   指定したcolor_idのレコードを取得
============================================================ */

/**
 * getDetail の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getDetail = async (req, res) => {
  try {
    // colorsService.getDetail()を呼び出す
    const color = await colorsService.getDetail(req.params.id);
    // 取得した結果をJSONとして返却
    res.json(color);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch color detail" });
  }
};

/**
 * create の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.create = async (req, res) => {
  try {
    const id = await colorsService.create(req.body);
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create color" });
  }
};

/**
 * remove の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.remove = async (req, res) => {
  try {
    await colorsService.remove(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete color" });
  }
};
