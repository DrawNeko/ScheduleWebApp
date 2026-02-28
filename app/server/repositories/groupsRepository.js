/**
 * scheduleWebApp/app/server/repositories/groupsRepository.js
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

function beginTransaction() {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function commit() {
  return new Promise((resolve, reject) => {
    db.commit((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function rollback() {
  return new Promise((resolve) => {
    db.rollback(() => resolve());
  });
}

/**
 * getAvailableGroups の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getAvailableGroups = (userId) => {
  return runQuery(
    `
    SELECT group_id, group_name, group_type, owner_user_id
    FROM group_master
    WHERE group_type = 'PUBLIC'
       OR (group_type = 'PRIVATE' AND owner_user_id = ?)
    ORDER BY group_type ASC, group_id ASC
    `,
    [userId]
  );
};

/**
 * getFirstPublicGroup の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getFirstPublicGroup = () => {
  return runQuery(
    `SELECT group_id, group_name FROM group_master WHERE group_type = 'PUBLIC' ORDER BY group_id ASC LIMIT 1`
  );
};

/**
 * getGroupById の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getGroupById = (groupId) => {
  return runQuery(`SELECT * FROM group_master WHERE group_id = ?`, [groupId]);
};

/**
 * getGroupUsers の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getGroupUsers = (groupId) => {
  return runQuery(
    `
    SELECT u.user_id, u.name, u.email, u.role
    FROM group_management gm
    JOIN users u ON gm.user_id = u.user_id
    WHERE gm.group_id = ?
    ORDER BY u.user_id
    `,
    [groupId]
  );
};

/**
 * isGroupSelectableByUser の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.isGroupSelectableByUser = async (groupId, userId) => {
  const rows = await runQuery(
    `
    SELECT 1
    FROM group_master
    WHERE group_id = ?
      AND (group_type = 'PUBLIC' OR (group_type = 'PRIVATE' AND owner_user_id = ?))
    `,
    [groupId, userId]
  );
  return rows.length > 0;
};

exports.getGroupsEditableByUser = (userId, canManagePublic) => {
  if (canManagePublic) {
    return runQuery(
      `
      SELECT group_id, group_name, group_type, owner_user_id
      FROM group_master
      WHERE group_type = 'PUBLIC'
         OR (group_type = 'PRIVATE' AND owner_user_id = ?)
      ORDER BY group_type ASC, group_id ASC
      `,
      [userId]
    );
  }

  return runQuery(
    `
    SELECT group_id, group_name, group_type, owner_user_id
    FROM group_master
    WHERE group_type = 'PRIVATE' AND owner_user_id = ?
    ORDER BY group_id ASC
    `,
    [userId]
  );
};

exports.createGroup = async ({ groupName, groupType, ownerUserId, memberUserIds }) => {
  await beginTransaction();
  try {
    const insertGroupResult = await runQuery(
      `INSERT INTO group_master (group_name, group_type, owner_user_id) VALUES (?, ?, ?)`,
      [groupName, groupType, ownerUserId]
    );

    const groupId = insertGroupResult.insertId;

    if (memberUserIds.length > 0) {
      const values = memberUserIds.map((userId) => [groupId, userId]);
      await runQuery(`INSERT INTO group_management (group_id, user_id) VALUES ?`, [values]);
    }

    await commit();
    return groupId;
  } catch (err) {
    await rollback();
    throw err;
  }
};

exports.updateGroup = async (groupId, { groupName, memberUserIds }) => {
  await beginTransaction();
  try {
    await runQuery(`UPDATE group_master SET group_name = ? WHERE group_id = ?`, [groupName, groupId]);
    await runQuery(`DELETE FROM group_management WHERE group_id = ?`, [groupId]);

    if (memberUserIds.length > 0) {
      const values = memberUserIds.map((userId) => [groupId, userId]);
      await runQuery(`INSERT INTO group_management (group_id, user_id) VALUES ?`, [values]);
    }

    await commit();
  } catch (err) {
    await rollback();
    throw err;
  }
};

exports.deleteGroup = (groupId) => {
  return runQuery(`DELETE FROM group_master WHERE group_id = ?`, [groupId]);
};

/**
 * updateUserDefaultGroup の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.updateUserDefaultGroup = (userId, groupId) => {
  return runQuery(
    `UPDATE users SET default_group_id = ? WHERE user_id = ?`,
    [groupId, userId]
  );
};

/**
 * getUserDefaultGroup の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getUserDefaultGroup = (userId) => {
  return runQuery(`SELECT default_group_id FROM users WHERE user_id = ?`, [userId]);
};

exports.clearDefaultGroupIfDeleted = (groupId) => {
  return runQuery(`UPDATE users SET default_group_id = NULL WHERE default_group_id = ?`, [groupId]);
};
