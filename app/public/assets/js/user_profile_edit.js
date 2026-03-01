import { authApi, usersApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const form = document.getElementById('profileForm');
  const btnCancel = document.getElementById('btnCancel');
  const showPasswordCheckbox = document.getElementById('showPassword');

  try {
    const me = await authApi.me();
    emailInput.value = me.email || '';
  } catch (err) {
    console.error(err);
  }


  if (showPasswordCheckbox) {
    showPasswordCheckbox.addEventListener('change', () => {
      passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
    });
  }

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      location.href = '/index.html';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await usersApi.updateMyProfile({
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
      });
      alert('更新しました');
      location.href = '/index.html';
    } catch (err) {
      console.error(err);
      alert('更新に失敗しました');
    }
  });
});
