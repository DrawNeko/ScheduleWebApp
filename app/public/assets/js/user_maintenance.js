import { authApi, usersApi } from './api.js';
import { fetchAssignableRoles } from './role_options.js';

let permissions;
let roles;
let roleNameById = {};
let currentUserId;
let currentUserRole;
let allUsers = [];

const ROLE_STRENGTH = {
  admin: 4,
  ld: 3,
  normal: 2,
  business: 1,
};


document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('backButton').onclick = () => (location.href = '/index.html');

  try {
    permissions = await usersApi.permissions();
    if (!permissions.can_assign_role && !permissions.can_delete_user && !permissions.can_reset_password) {
      alert('このロールではユーザメンテナンスを利用できません。');
      location.href = '/index.html';
      return;
    }

    const me = await authApi.me();
    currentUserId = me.user_id;
    currentUserRole = me.role;

    const allRoles = await usersApi.roles();
    roleNameById = Object.fromEntries(allRoles.map((role) => [role.role_id, role.role_name_ja]));
    setupRoleFilter(allRoles);

    roles = await fetchAssignableRoles(usersApi);
    allUsers = await usersApi.list();

    setupFilters();
    renderFilteredUsers();
  } catch (err) {
    console.error(err);
    alert('ユーザ情報の取得に失敗しました');
  }
});

function setupRoleFilter(allRoles) {
  const roleFilter = document.getElementById('filterRole');
  if (!roleFilter) return;

  roleFilter.innerHTML = [
    '<option value="">すべて</option>',
    ...allRoles.map((role) => `<option value="${role.role_id}">${role.role_name_ja}</option>`),
  ].join('');
}

function setupFilters() {
  const filters = [
    document.getElementById('filterUserId'),
    document.getElementById('filterName'),
    document.getElementById('filterEmail'),
    document.getElementById('filterRole'),
  ];

  filters.forEach((el) => {
    if (!el) return;
    const eventType = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(eventType, renderFilteredUsers);
  });

  document.getElementById('btnClearFilters')?.addEventListener('click', () => {
    filters.forEach((el) => {
      if (!el) return;
      el.value = '';
    });
    renderFilteredUsers();
  });
}

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function renderFilteredUsers() {
  const userIdQuery = normalizeText(document.getElementById('filterUserId')?.value);
  const nameQuery = normalizeText(document.getElementById('filterName')?.value);
  const emailQuery = normalizeText(document.getElementById('filterEmail')?.value);
  const roleQuery = document.getElementById('filterRole')?.value || '';

  const filteredUsers = allUsers.filter((user) => {
    const matchUserId = !userIdQuery || normalizeText(user.user_id).includes(userIdQuery);
    const matchName = !nameQuery || normalizeText(user.name).includes(nameQuery);
    const matchEmail = !emailQuery || normalizeText(user.email).includes(emailQuery);
    const matchRole = !roleQuery || user.role === roleQuery;
    return matchUserId && matchName && matchEmail && matchRole;
  });

  document.getElementById('filterResultCount').textContent = `${filteredUsers.length} 件`;
  render(filteredUsers);
}

function render(users) {
  const body = document.getElementById('usersBody');
  body.innerHTML = '';

  users.forEach((user) => {
    const tr = document.createElement('tr');
    const isSelf = user.user_id === currentUserId;
    const isTargetHigherOrEqual = (ROLE_STRENGTH[user.role] || 0) >= (ROLE_STRENGTH[currentUserRole] || 0);
    const isOperationForbidden = isSelf || isTargetHigherOrEqual;

    const roleOptions = roles
      .map((role) => `<option value="${role.role_id}" ${role.role_id === user.role ? 'selected' : ''}>${role.role_name_ja}</option>`)
      .join('');

    const currentRoleLabel = roleNameById[user.role] || user.role;
    const roleCell = permissions.can_assign_role && !isOperationForbidden
      ? `<select class="role-select">${roleOptions}</select>`
      : `<span>${currentRoleLabel}</span>`;

    const operationButtons = [
      permissions.can_assign_role
        ? `<button class="btn-role" ${isOperationForbidden ? 'disabled title="自身と同等以上の権限ユーザには操作できません"' : ''}>権限付与</button>`
        : '',
      permissions.can_delete_user
        ? `<button class="btn-delete" ${isOperationForbidden ? 'disabled title="自身と同等以上の権限ユーザは削除できません"' : ''}>削除</button>`
        : '',
      permissions.can_reset_password
        ? `<button class="btn-reset" ${isOperationForbidden ? 'disabled title="自身と同等以上の権限ユーザのパスワードはリセットできません"' : ''}>パスワードリセット</button>`
        : '',
    ].join('');

    tr.innerHTML = `
      <td>${user.user_id}</td>
      <td>${user.name}</td>
      <td>${user.email || ''}</td>
      <td>${roleCell}</td>
      <td>${operationButtons}</td>
    `;

    const roleButton = tr.querySelector('.btn-role');
    if (roleButton) {
      roleButton.onclick = async () => {
        if (isOperationForbidden) {
          alert('自身と同等以上の権限ユーザのロールは変更できません');
          return;
        }

        const role = tr.querySelector('.role-select').value;
        try {
          await usersApi.updateRole(user.user_id, { role });
          alert('ロールを更新しました');
          allUsers = await usersApi.list();
          renderFilteredUsers();
        } catch (err) {
          console.error(err);
          alert('ロール更新に失敗しました');
        }
      };
    }

    const deleteButton = tr.querySelector('.btn-delete');
    if (deleteButton) {
      deleteButton.onclick = async () => {
        if (isOperationForbidden) {
          alert('自身と同等以上の権限ユーザは削除できません');
          return;
        }

        if (!confirm(`${user.user_id} を削除しますか？`)) return;
        try {
          await usersApi.remove(user.user_id);
          allUsers = await usersApi.list();
          renderFilteredUsers();
        } catch (err) {
          console.error(err);
          alert('削除に失敗しました');
        }
      };
    }

    const resetButton = tr.querySelector('.btn-reset');
    if (resetButton) {
      resetButton.onclick = async () => {
        if (isOperationForbidden) {
          alert('自身と同等以上の権限ユーザのパスワードはリセットできません');
          return;
        }

        if (!confirm(`${user.user_id} のパスワードを 'pass' にリセットしますか？`)) return;
        try {
          await usersApi.resetPassword(user.user_id);
          alert('パスワードをリセットしました（初期値: pass）');
        } catch (err) {
          console.error(err);
          alert('パスワードリセットに失敗しました');
        }
      };
    }

    body.appendChild(tr);
  });
}
