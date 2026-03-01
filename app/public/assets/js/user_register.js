/**
 * scheduleWebApp/app/public/assets/js/user_register.js
 */

import { usersApi } from './api.js';
import { fetchAssignableRoles } from './role_options.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('userForm');
  const userIdInput = document.getElementById('user_id');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const roleSelect = document.getElementById('role');
  const btnCancel = document.getElementById('btnCancel');

  const showError = (msg) => alert(msg);

  try {
    const permissions = await usersApi.permissions();
    if (!permissions.can_create_user) {
      alert('このロールではユーザ登録を利用できません。');
      location.href = '/index.html';
      return;
    }

    const assignableRoles = await fetchAssignableRoles(usersApi);

    roleSelect.innerHTML = assignableRoles
      .map((role) => `<option value="${role.role_id}">${role.role_name_ja}</option>`)
      .join('');
  } catch (err) {
    console.error(err);
    showError('初期表示に失敗しました');
    return;
  }

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      location.href = '/index.html';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user_id = userIdInput.value.trim();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleSelect.value;

    if (!user_id) return showError('ユーザIDは必須です');
    if (!name) return showError('ユーザ名は必須です');

    if (email && !email.match(/^[\w\.-]+@[\w\.-]+\.\w+$/)) {
      return showError('メールアドレスの形式が不正です');
    }

    const exists = await usersApi.detail(user_id).catch(() => null);
    if (exists && exists.user_id) {
      return showError('このユーザIDは既に登録されています');
    }

    try {
      await usersApi.create({ user_id, name, email, role });
      alert('登録しました');
      location.href = '/index.html';
    } catch (err) {
      console.error(err);
      showError('登録に失敗しました');
    }
  });
});
