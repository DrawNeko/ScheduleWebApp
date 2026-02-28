/**
 * scheduleWebApp/app/public/assets/js/login.js
 */

import { authApi } from "./api.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user_id = document.getElementById("userId").value.trim();
  const password = document.getElementById("password").value;
  const error = document.getElementById("errorMessage");
  error.textContent = "";

  try {
    await authApi.login({ user_id, password });
    location.href = "/index.html";
  } catch (err) {
    error.textContent = "ユーザIDまたはパスワードが正しくありません。";
  }
});
