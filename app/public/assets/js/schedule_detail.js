/**
 * scheduleWebApp/app/public/assets/js/schedule_detail.js
 */

import { schedulesApi } from "./api.js";

function redirectToTopPage() {
  location.href = "/index.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  const scheduleId = new URLSearchParams(window.location.search).get("id");
  if (!scheduleId) {
    alert("詳細表示対象IDがありません");
    redirectToTopPage();
    return;
  }

  const sch = await schedulesApi.detail(scheduleId);
  const detail = document.getElementById("detail");

  const start = sch.start_datetime.slice(11, 16);
  const end = sch.end_datetime ? sch.end_datetime.slice(11, 16) : "";

  detail.innerHTML = `
    <p><strong>タイトル：</strong> ${sch.title}</p>
    <p><strong>日時：</strong> ${start}${end ? " ～ " + end : ""}</p>
    <p><strong>登録者：</strong> ${sch.created_by_name}</p>
    <p><strong>場所：</strong> ${sch.location || ""}</p>
    <p><strong>メモ：</strong> ${sch.memo || ""}</p>
    <p><strong>色：</strong>
      <span style="background:${sch.color_code_bg || "#888"}; padding:4px 10px; border-radius:4px; color:${sch.color_code_text || "#fff"};">
        ${sch.color_name || ""}
      </span>
    </p>
  `;

  document.getElementById("editBtn").onclick = () => {
    location.href = `/schedule_edit.html?id=${scheduleId}`;
  };

  document.getElementById("deleteBtn").onclick = async () => {
    if (!confirm("削除しますか？")) return;

    await schedulesApi.remove(scheduleId);
    redirectToTopPage();
  };
});
