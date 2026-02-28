/**
 * scheduleWebApp/app/public/assets/js/schedule_add.js
 */

import { schedulesApi } from "./api.js";

import {
  buildHourOptions,
  buildMinuteOptions,
  fetchUsers,
  loadColors,
  applyColorPreview ,
  addParticipantChip,
  rebuildSelectBoxesBase,
  validateTimeRangeOrAlert,
  setupRecurringSectionToggle,
  buildRecurringPayload,
  validateRecurringInputsOrAlert
} from "./schedule_common.js";

document.addEventListener("DOMContentLoaded", async () => {

  /* ============================================================
     DOM 取得
  ============================================================ */
  const createdBySelect = document.getElementById("createdBySelect");
  const participantsSelect = document.getElementById("participantsSelect");
  const chipContainer = document.getElementById("chipContainer");
  const colorSelect = document.getElementById("colorSelect");

  const startHour = document.getElementById("startHour");
  const startMinute = document.getElementById("startMinute");
  const endHour = document.getElementById("endHour");
  const endMinute = document.getElementById("endMinute");
  const titleInput = document.getElementById("title");
  const dateInput = document.getElementById("date");
  const isRecurring = document.getElementById("isRecurring");
  const recurringSection = document.getElementById("recurringSection");
  const recurringEndDate = document.getElementById("recurringEndDate");
  const recurringFrequency = document.getElementById("recurringFrequency");

  /* ============================================================
     時刻セレクト生成
  ============================================================ */
  buildHourOptions(startHour);
  buildMinuteOptions(startMinute);
  buildHourOptions(endHour);
  buildMinuteOptions(endMinute);

  /* ============================================================
     ユーザー一覧取得
  ============================================================ */
  const users = await fetchUsers();

/**
 * rebuildSelectBoxes の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
  const rebuildSelectBoxes = () =>
    rebuildSelectBoxesBase(users, createdBySelect, participantsSelect, chipContainer);

  /* ============================================================
     初期プルダウン生成
  ============================================================ */
  rebuildSelectBoxes();

  /* ============================================================
     登録者変更 → 同報者を再構築
  ============================================================ */
  createdBySelect.addEventListener("change", () => {
    rebuildSelectBoxes();
  });

  /* ============================================================
     同報者追加
  ============================================================ */
  participantsSelect.addEventListener("change", () => {
    const userId = participantsSelect.value;
    if (!userId) return;

    const userName = participantsSelect.options[participantsSelect.selectedIndex].text;
    addParticipantChip(userId, userName, chipContainer, rebuildSelectBoxes);

    participantsSelect.value = "";
    rebuildSelectBoxes();
  });

  /* ============================================================
     色一覧
  ============================================================ */
  await loadColors(colorSelect);
  applyColorPreview(colorSelect);

  colorSelect.addEventListener("change", () => {
    applyColorPreview(colorSelect);
  });

  setupRecurringSectionToggle(isRecurring, recurringSection);

  /* ============================================================
     フォーム送信バリデーション
  ============================================================ */
  document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const createdBy = createdBySelect.value;
    const titleVal = titleInput.value.trim();
    const dateVal = dateInput.value;
    const sh = startHour.value;
    const sm = startMinute.value;
    const eh = endHour.value;
    const em = endMinute.value;

    if (!createdBy) return alert("登録者は必須です");
    if (!titleVal) return alert("タイトルは必須です");
    if (!dateVal) return alert("予定日は必須です");
    if (!sh || !sm) return alert("開始時刻は必須です");
    if (!eh || !em) return alert("終了時刻は必須です");
    if (!validateTimeRangeOrAlert(sh, sm, eh, em)) return;

    if (!validateRecurringInputsOrAlert(isRecurring, recurringEndDate, dateVal)) return;

    const data = {
      created_by: createdBy,
      title: titleVal,
      date: dateVal,
      location: document.getElementById("location").value,
      memo: document.getElementById("memo").value,
      color_name: colorSelect.value,
      start_datetime: `${dateVal} ${sh}:${sm}:00`,
      end_datetime: `${dateVal} ${eh}:${em}:00`,
      ...buildRecurringPayload(isRecurring, recurringEndDate, recurringFrequency),
      participants: [
        ...document.querySelectorAll("#chipContainer input")
      ].map(i => i.value)
    };

    try {
      await schedulesApi.create(data);
      alert("登録しました");
      location.href = "/";
    } catch (err) {
      console.error(err);
      alert("登録に失敗しました");
    }
  });

  /* ============================================================
     URL パラメータから初期値をセット
  ============================================================ */
  const params = new URLSearchParams(window.location.search);

  const userParam = params.get("user");
  const dateParam = params.get("date");

  // 登録者（createdBySelect）にセット
  if (userParam) {
    createdBySelect.value = userParam;
    rebuildSelectBoxes(); // 同報者リストを再構築
  }

  // 日付にセット
  if (dateParam) {
    document.getElementById("date").value = dateParam;
  }
});
