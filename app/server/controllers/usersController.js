/**
 * scheduleWebApp/app/server/controllers/usersController.js
 */

const usersService = require('../services/usersService');
const {
  canAssignRole,
  canManageUserCreation,
  canManageUserRole,
  canManageUserDelete,
  canResetUserPassword,
  canOperateOnUser,
  getUserMaintenancePermissions,
} = require('../utils/rolePolicy');

exports.getAll = async (req, res) => {
  try {
    const users = await usersService.getAll();
    res.json(users);
  } catch (err) {
    console.error('users getAll error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const user = await usersService.getDetail(req.params.id);
    res.json(user);
  } catch (err) {
    console.error('users getDetail error:', err);
    res.status(500).json({ error: 'Failed to fetch user detail' });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await usersService.getRoles();

    if (req.query.assignable_for_create === '1') {
      const actorRole = req.session.user.role;
      const assignableRoles = roles.filter((role) => canAssignRole(actorRole, role.role_id));
      return res.json(assignableRoles);
    }

    res.json(roles);
  } catch (err) {
    console.error('users getRoles error:', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

exports.getPermissions = async (req, res) => {
  res.json(getUserMaintenancePermissions(req.session.user.role));
};

exports.create = async (req, res) => {
  try {
    const actorRole = req.session.user.role;
    const targetRole = req.body.role;

    if (!canManageUserCreation(actorRole, targetRole)) {
      return res.status(403).json({ error: 'Forbidden to create this role' });
    }

    await usersService.create(req.body);
    res.status(201).json({ message: 'created' });
  } catch (err) {
    console.error('users create error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim();
    const password = String(req.body.password || '').trim();

    if (!password) {
      return res.status(400).json({ error: 'password is required' });
    }

    await usersService.updateMyProfile(req.session.user.user_id, { email, password });
    req.session.user.email = email || null;
    res.json({ message: 'updated' });
  } catch (err) {
    console.error('users updateMyProfile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const actorRole = req.session.user.role;
    const targetRole = req.body.role;

    if (!canManageUserRole(actorRole, targetRole)) {
      return res.status(403).json({ error: 'Forbidden to assign this role' });
    }

    if (req.params.id === req.session.user.user_id) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }

    const targetUser = await usersService.getDetail(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!canOperateOnUser(actorRole, targetUser.role)) {
      return res.status(403).json({ error: 'Forbidden to operate on same or higher role user' });
    }

    await usersService.updateRole(req.params.id, targetRole);
    res.json({ message: 'updated' });
  } catch (err) {
    console.error('users updateRole error:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

exports.remove = async (req, res) => {
  try {
    if (!canManageUserDelete(req.session.user.role)) {
      return res.status(403).json({ error: 'Forbidden to delete user' });
    }

    if (req.params.id === req.session.user.user_id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const targetUser = await usersService.getDetail(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!canOperateOnUser(req.session.user.role, targetUser.role)) {
      return res.status(403).json({ error: 'Forbidden to operate on same or higher role user' });
    }

    await usersService.remove(req.params.id);
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error('users remove error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    if (!canResetUserPassword(req.session.user.role)) {
      return res.status(403).json({ error: 'Forbidden to reset password' });
    }

    if (req.params.id === req.session.user.user_id) {
      return res.status(400).json({ error: 'You cannot reset your own password' });
    }

    const targetUser = await usersService.getDetail(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!canOperateOnUser(req.session.user.role, targetUser.role)) {
      return res.status(403).json({ error: 'Forbidden to operate on same or higher role user' });
    }

    await usersService.resetPassword(req.params.id, 'pass');
    res.json({ message: 'password reset' });
  } catch (err) {
    console.error('users resetPassword error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
