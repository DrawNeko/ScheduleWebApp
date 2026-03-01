/**
 * scheduleWebApp/app/server/services/authService.js
 */

const usersService = require("./usersService");
const groupsService = require("./groupsService");

/**
 * login の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.login = async (userId, password) => {
  if (!userId || !password) return null;

  const user = await usersService.getByCredentials(userId, password);
  if (!user) return null;

  const defaultGroupId = await groupsService.ensureDefaultGroup(user.user_id);

  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    role_name_ja: user.role_name_ja,
    default_group_id: defaultGroupId
  };
};
