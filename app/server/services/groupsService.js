/**
 * scheduleWebApp/app/server/services/groupsService.js
 */

const groupsRepository = require("../repositories/groupsRepository");

function isLeaderRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  return normalized === "ld" || normalized === "leader" || normalized === "リーダー";
}

function normalizeMemberUserIds(memberUserIds) {
  if (!Array.isArray(memberUserIds)) return [];
  return [...new Set(memberUserIds.map((userId) => String(userId).trim()).filter(Boolean))];
}

/**
 * getAvailableGroups の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getAvailableGroups = async (userId) => {
  return groupsRepository.getAvailableGroups(userId);
};

/**
 * ensureDefaultGroup の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.ensureDefaultGroup = async (userId) => {
  const rows = await groupsRepository.getUserDefaultGroup(userId);
  const currentDefault = rows[0]?.default_group_id || null;

  if (currentDefault) {
    const selectable = await groupsRepository.isGroupSelectableByUser(currentDefault, userId);
    if (selectable) return currentDefault;
  }

  const firstPublic = await groupsRepository.getFirstPublicGroup();
  if (!firstPublic[0]) return null;

  await groupsRepository.updateUserDefaultGroup(userId, firstPublic[0].group_id);
  return firstPublic[0].group_id;
};

/**
 * getGroupUsersForUser の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getGroupUsersForUser = async (groupId, userId) => {
  const selectable = await groupsRepository.isGroupSelectableByUser(groupId, userId);
  if (!selectable) {
    const err = new Error("Forbidden group access");
    err.status = 403;
    throw err;
  }

  return groupsRepository.getGroupUsers(groupId);
};

exports.getEditableGroups = async (loginUser) => {
  const canManagePublic = isLeaderRole(loginUser.role);
  const groups = await groupsRepository.getGroupsEditableByUser(loginUser.user_id, canManagePublic);
  const groupsWithUsers = await Promise.all(
    groups.map(async (group) => ({
      ...group,
      users: await groupsRepository.getGroupUsers(group.group_id),
    }))
  );

  return {
    can_manage_public: canManagePublic,
    groups: groupsWithUsers,
  };
};

exports.getEditableGroupDetail = async (groupId, loginUser) => {
  const group = (await groupsRepository.getGroupById(groupId))[0];
  if (!group) {
    const err = new Error("Group not found");
    err.status = 404;
    throw err;
  }

  const canManagePublic = isLeaderRole(loginUser.role);
  const canEdit = group.group_type === "PRIVATE"
    ? group.owner_user_id === loginUser.user_id
    : canManagePublic;

  if (!canEdit) {
    const err = new Error("Forbidden group access");
    err.status = 403;
    throw err;
  }

  const users = await groupsRepository.getGroupUsers(groupId);
  return { ...group, users };
};

exports.createEditableGroup = async (payload, loginUser) => {
  const groupName = String(payload.group_name || "").trim();
  const groupType = String(payload.group_type || "").trim().toUpperCase();
  const memberUserIds = normalizeMemberUserIds(payload.member_user_ids);

  if (!groupName) {
    const err = new Error("group_name is required");
    err.status = 400;
    throw err;
  }

  if (!["PUBLIC", "PRIVATE"].includes(groupType)) {
    const err = new Error("group_type is invalid");
    err.status = 400;
    throw err;
  }

  if (memberUserIds.length === 0) {
    const err = new Error("member_user_ids is required");
    err.status = 400;
    throw err;
  }

  if (groupType === "PUBLIC" && !isLeaderRole(loginUser.role)) {
    const err = new Error("Forbidden group access");
    err.status = 403;
    throw err;
  }

  const ownerUserId = groupType === "PRIVATE" ? loginUser.user_id : null;

  return groupsRepository.createGroup({ groupName, groupType, ownerUserId, memberUserIds });
};

exports.updateEditableGroup = async (groupId, payload, loginUser) => {
  const group = await exports.getEditableGroupDetail(groupId, loginUser);

  const groupName = String(payload.group_name || "").trim();
  const memberUserIds = normalizeMemberUserIds(payload.member_user_ids);

  if (!groupName) {
    const err = new Error("group_name is required");
    err.status = 400;
    throw err;
  }

  if (memberUserIds.length === 0) {
    const err = new Error("member_user_ids is required");
    err.status = 400;
    throw err;
  }

  await groupsRepository.updateGroup(group.group_id, { groupName, memberUserIds });
};

exports.deleteEditableGroup = async (groupId, loginUser) => {
  await exports.getEditableGroupDetail(groupId, loginUser);
  await groupsRepository.clearDefaultGroupIfDeleted(groupId);
  await groupsRepository.deleteGroup(groupId);
};

/**
 * setDefaultGroup の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.setDefaultGroup = async (groupId, userId) => {
  const selectable = await groupsRepository.isGroupSelectableByUser(groupId, userId);
  if (!selectable) {
    const err = new Error("Forbidden group access");
    err.status = 403;
    throw err;
  }

  await groupsRepository.updateUserDefaultGroup(userId, groupId);
};
