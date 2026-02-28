/**
 * scheduleWebApp/app/server/controllers/groupsController.js
 */

const groupsService = require("../services/groupsService");

/**
 * getAvailable の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getAvailable = async (req, res) => {
  try {
    const userId = req.session.user.user_id;
    const groups = await groupsService.getAvailableGroups(userId);
    const defaultGroupId = await groupsService.ensureDefaultGroup(userId);

    res.json({ groups, default_group_id: defaultGroupId });
  } catch (err) {
    console.error("groups getAvailable error:", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

exports.getEditable = async (req, res) => {
  try {
    const data = await groupsService.getEditableGroups(req.session.user);
    res.json(data);
  } catch (err) {
    console.error("groups getEditable error:", err);
    res.status(500).json({ error: "Failed to fetch editable groups" });
  }
};

exports.getEditableDetail = async (req, res) => {
  try {
    const group = await groupsService.getEditableGroupDetail(req.params.id, req.session.user);
    res.json(group);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("groups getEditableDetail error:", err);
    res.status(500).json({ error: "Failed to fetch group detail" });
  }
};

exports.createEditable = async (req, res) => {
  try {
    const groupId = await groupsService.createEditableGroup(req.body, req.session.user);
    res.status(201).json({ message: "created", group_id: groupId });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("groups createEditable error:", err);
    res.status(500).json({ error: "Failed to create group" });
  }
};

exports.updateEditable = async (req, res) => {
  try {
    await groupsService.updateEditableGroup(req.params.id, req.body, req.session.user);
    res.json({ message: "updated" });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("groups updateEditable error:", err);
    res.status(500).json({ error: "Failed to update group" });
  }
};

exports.deleteEditable = async (req, res) => {
  try {
    await groupsService.deleteEditableGroup(req.params.id, req.session.user);
    res.json({ message: "deleted" });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("groups deleteEditable error:", err);
    res.status(500).json({ error: "Failed to delete group" });
  }
};

/**
 * getUsers の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await groupsService.getGroupUsersForUser(req.params.id, req.session.user.user_id);
    res.json(users);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("groups getUsers error:", err);
    res.status(500).json({ error: "Failed to fetch group users" });
  }
};

/**
 * setDefault の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.setDefault = async (req, res) => {
  try {
    const { group_id } = req.body;
    await groupsService.setDefaultGroup(group_id, req.session.user.user_id);
    req.session.user.default_group_id = Number(group_id);
    res.json({ message: "ok" });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("groups setDefault error:", err);
    res.status(500).json({ error: "Failed to set default group" });
  }
};
