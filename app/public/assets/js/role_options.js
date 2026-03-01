/**
 * scheduleWebApp/app/public/assets/js/role_options.js
 */

export const ROLE_ORDER = ['admin', 'ld', 'normal', 'business'];

export function sortRolesByDisplayOrder(roles) {
  return [...roles].sort((a, b) => ROLE_ORDER.indexOf(a.role_id) - ROLE_ORDER.indexOf(b.role_id));
}

export async function fetchAssignableRoles(usersApi) {
  const roles = await usersApi.roles({ assignableForCreate: true });
  return sortRolesByDisplayOrder(roles);
}
