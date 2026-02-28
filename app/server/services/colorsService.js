/**
 * scheduleWebApp/app/server/services/colorsService.js
 */

const db = require('../config/db');

// ===============================
// 一覧取得
// ===============================
exports.getAll = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM colors ORDER BY color_id`;
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// ===============================
// 詳細取得
// ===============================
exports.getDetail = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM colors WHERE color_id = ?`;
    db.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
};

// ===============================
// 新規登録
// ===============================
exports.create = ({ color_name, color_code_bg, color_code_text }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO colors (color_name, color_code_bg, color_code_text)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [color_name, color_code_bg, color_code_text], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
};

// ===============================
// 削除
// ===============================
exports.remove = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM colors WHERE color_id = ?`;
    db.query(sql, [id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows);
    });
  });
};
