/**
 * scheduleWebApp/app/server/utils/rolePolicy.js
 */

const ROLE = {
  ADMIN: "admin",
  LD: "ld",
  NORMAL: "normal",
  BUSINESS: "business",
};

const ROLE_STRENGTH = {
  [ROLE.ADMIN]: 4,
  [ROLE.LD]: 3,
  [ROLE.NORMAL]: 2,
  [ROLE.BUSINESS]: 1,
};

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function canAssignRole(actorRole, targetRole) {
  const actor = normalizeRole(actorRole);
  const target = normalizeRole(targetRole);

  if (actor === ROLE.ADMIN) return Object.values(ROLE).includes(target);
  if (actor === ROLE.LD) return [ROLE.LD, ROLE.NORMAL, ROLE.BUSINESS].includes(target);
  if (actor === ROLE.NORMAL) return [ROLE.NORMAL, ROLE.BUSINESS].includes(target);
  return false;
}

function canManageUserCreation(actorRole, targetRole) {
  return canAssignRole(actorRole, targetRole);
}

function canManageUserRole(actorRole, targetRole) {
  const actor = normalizeRole(actorRole);
  if (![ROLE.ADMIN, ROLE.LD].includes(actor)) return false;
  return canAssignRole(actor, targetRole);
}

function canManageUserDelete(actorRole) {
  return normalizeRole(actorRole) === ROLE.ADMIN;
}

function canResetUserPassword(actorRole) {
  return normalizeRole(actorRole) === ROLE.ADMIN;
}

function canManagePublicGroup(actorRole) {
  const actor = normalizeRole(actorRole);
  return actor === ROLE.ADMIN || actor === ROLE.LD;
}

function canOperateOnUser(actorRole, targetUserRole) {
  const actorStrength = ROLE_STRENGTH[normalizeRole(actorRole)] || 0;
  const targetStrength = ROLE_STRENGTH[normalizeRole(targetUserRole)] || 0;
  return actorStrength > targetStrength;
}

function getUserMaintenancePermissions(actorRole) {
  return {
    can_create_user: [ROLE.ADMIN, ROLE.LD, ROLE.NORMAL].includes(normalizeRole(actorRole)),
    can_edit_self: true,
    can_assign_role: [ROLE.ADMIN, ROLE.LD].includes(normalizeRole(actorRole)),
    can_delete_user: canManageUserDelete(actorRole),
    can_reset_password: canResetUserPassword(actorRole),
  };
}

module.exports = {
  ROLE,
  normalizeRole,
  canAssignRole,
  canManageUserCreation,
  canManageUserRole,
  canManageUserDelete,
  canManagePublicGroup,
  canOperateOnUser,
  canResetUserPassword,
  getUserMaintenancePermissions,
};
