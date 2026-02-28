/**
 * scheduleWebApp/app/server/controllers/usersController.js
 */

// ------------------------------------------------------
// ルートから呼ばれ、Service を使って処理を実行する層。
// リクエストの受け取り、レスポンスの返却を担当する。
// ------------------------------------------------------

const usersService = require('../services/usersService');

/* ============================================================
   一覧取得
============================================================ */

/**
 * getAll の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getAll = async (req, res) => {
  try {
    const users = await usersService.getAll();
    res.json(users);
  } catch (err) {
    console.error("users getAll error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/* ============================================================
   詳細取得
============================================================ */

/**
 * getDetail の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getDetail = async (req, res) => {
  try {
    const user = await usersService.getDetail(req.params.id);
    res.json(user);
  } catch (err) {
    console.error("users getDetail error:", err);
    res.status(500).json({ error: "Failed to fetch user detail" });
  }
};

/* ============================================================
   新規登録
============================================================ */

/**
 * create の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.create = async (req, res) => {
  try {
    await usersService.create(req.body);
    // 本来は JSON を返すべきだが、既存仕様に合わせて画面遷移させている
    res.redirect("/user_register.html");
  } catch (err) {
    console.error("users create error:", err);
    res.status(500).json({ error: "Failed to create user" });
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
    await usersService.remove(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("users remove error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
