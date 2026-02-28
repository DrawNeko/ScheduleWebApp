/**
 * scheduleWebApp/app/server/services/usersService.js
 */

// ------------------------------------------------------
// DB に直接アクセスする層。
// SQL の実行と結果の返却だけを担当する。
// ------------------------------------------------------

const db = require('../config/db');

/* ============================================================
   一覧取得
============================================================ */

/**
 * getAll の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getAll = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM users ORDER BY user_id`;
    db.query(sql, (err, rows) => {
      if (err) return reject(err);
      resolve(rows); // rows を返すのが正しい
    });
  });
};

/* ============================================================
   詳細取得
============================================================ */

/**
 * getDetail の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getDetail = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM users WHERE user_id = ?`;
    db.query(sql, [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0] || null); // 1件だけ返す
    });
  });
};

/**
 * getByCredentials の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getByCredentials = (userId, password) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT user_id, name, email, role, default_group_id FROM users WHERE user_id = ? AND password = ?`;
    db.query(sql, [userId, password], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0] || null);
    });
  });
};

/* ============================================================
   新規登録
============================================================ */

/**
 * create の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.create = ({ user_id, name, email, role, password }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO users (user_id, name, email, role, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [user_id, name, email, role, password || "password"], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId); // 登録された ID を返す
    });
  });
};

/* ============================================================
   削除
============================================================ */

/**
 * remove の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.remove = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM users WHERE user_id = ?`;
    db.query(sql, [id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows); // 削除件数を返す
    });
  });
};
