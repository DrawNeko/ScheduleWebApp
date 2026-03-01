/**
 * scheduleWebApp/app/server/services/usersService.js
 */

const db = require('../config/db');

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

exports.getAll = () => {
  const sql = `
    SELECT u.user_id, u.name, u.email, u.role, r.role_name_ja
    FROM users u
    LEFT JOIN role r ON u.role = r.role_id
    ORDER BY u.user_id
  `;
  return runQuery(sql);
};

exports.getDetail = async (id) => {
  const sql = `
    SELECT u.user_id, u.name, u.email, u.role, r.role_name_ja
    FROM users u
    LEFT JOIN role r ON u.role = r.role_id
    WHERE u.user_id = ?
  `;
  const rows = await runQuery(sql, [id]);
  return rows[0] || null;
};

exports.getByCredentials = async (userId, password) => {
  const sql = `
    SELECT u.user_id, u.name, u.email, u.role, r.role_name_ja, u.default_group_id
    FROM users u
    LEFT JOIN role r ON u.role = r.role_id
    WHERE u.user_id = ? AND u.password = ?
  `;
  const rows = await runQuery(sql, [userId, password]);
  return rows[0] || null;
};

exports.getRoles = () => {
  return runQuery(`SELECT role_id, role_name_ja FROM role ORDER BY role_id`);
};

exports.create = ({ user_id, name, email, role, password }) => {
  const sql = `
    INSERT INTO users (user_id, name, email, role, password)
    VALUES (?, ?, ?, ?, ?)
  `;
  return runQuery(sql, [user_id, name, email || null, role, password || 'password']);
};

exports.updateMyProfile = (userId, { email, password }) => {
  const sql = `
    UPDATE users
    SET email = ?, password = ?
    WHERE user_id = ?
  `;
  return runQuery(sql, [email || null, password, userId]);
};

exports.updateRole = (userId, role) => {
  return runQuery(`UPDATE users SET role = ? WHERE user_id = ?`, [role, userId]);
};

exports.remove = (id) => {
  return runQuery(`DELETE FROM users WHERE user_id = ?`, [id]);
};

exports.resetPassword = (userId, password = 'pass') => {
  return runQuery(`UPDATE users SET password = ? WHERE user_id = ?`, [password, userId]);
};
