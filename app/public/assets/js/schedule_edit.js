/**
 * scheduleWebApp/app/public/assets/js/schedule_edit.js
 */

import { schedulesApi } from "./api.js";

import {
  buildHourOptions,
  buildMinuteOptions,
  fetchUsers,
  loadColors,
  applyColorPreview,
  addParticipantChip,
  rebuildSelectBoxesBase,
  validateTimeRangeOrAlert,
  setupRecurringSectionToggle,
  buildRecurringPayload,
  validateRecurringInputsOrAlert
} from "./schedule_common.js";

/* ===============================
   URLからID取得
================================ */
const scheduleId = new URLSearchParams(window.location.search).get("id");

if (!scheduleId) {
  alert("編集対象IDがありません");
  location.href = "index.html";
}

function formatDateTimeRange(startDatetime, endDatetime) {
  const start = startDatetime.replace("T", " ").slice(0, 16);
  if (!endDatetime) return start;
  const end = endDatetime.replace("T", " ").slice(0, 16);
  return `${start} 〜 ${end}`;
}

function redirectToTopPage() {
  location.href = "/index.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  /* ===============================
     DOM 取得
  =============================== */
  const createdBySelect = document.getElementById("createdBySelect");
  const participantsSelect = document.getElementById("participantsSelect");
  const chipContainer = document.getElementById("chipContainer");
  const colorSelect = document.getElementById("colorSelect");

  const startHour = document.getElementById("startHour");
  const startMinute = document.getElementById("startMinute");
  const endHour = document.getElementById("endHour");
  const endMinute = document.getElementById("endMinute");

  const title = document.getElementById("title");
  const date = document.getElementById("date");
  const location = document.getElementById("location");
  const memo = document.getElementById("memo");
  const isRecurring = document.getElementById("isRecurring");
  const recurringSection = document.getElementById("recurringSection");
  const recurringEndDate = document.getElementById("recurringEndDate");
  const recurringFrequency = document.getElementById("recurringFrequency");
  const recurringSingleNote = document.getElementById("recurringSingleNote");

  const btnDelete = document.getElementById("btnDelete");
  const deleteModal = document.getElementById("deleteModal");
  const deleteTargetTitle = document.getElementById("deleteTargetTitle");
  const deleteTargetDateTime = document.getElementById("deleteTargetDateTime");
  const deleteTargetLocation = document.getElementById("deleteTargetLocation");
  const deleteRecurringWrap = document.getElementById("deleteRecurringWrap");
  const deleteRecurringAll = document.getElementById("deleteRecurringAll");
  const confirmDelete = document.getElementById("confirmDelete");
  const cancelDelete = document.getElementById("cancelDelete");

  /* ===============================
     時刻セレクト生成
  =============================== */
  buildHourOptions(startHour);
  buildMinuteOptions(startMinute);
  buildHourOptions(endHour);
  buildMinuteOptions(endMinute);

  /* ===============================
     ユーザー一覧取得
  =============================== */
  const users = await fetchUsers();

  const rebuildSelectBoxes = () =>
    rebuildSelectBoxesBase(users, createdBySelect, participantsSelect, chipContainer);

  /* ===============================
     色一覧
  =============================== */
  await loadColors(colorSelect);
  applyColorPreview(colorSelect);

  colorSelect.addEventListener("change", () => {
    applyColorPreview(colorSelect);
  });

  const toggleRecurringSection = setupRecurringSectionToggle(isRecurring, recurringSection);

  const toggleRecurringSingleNote = () => {
    if (!sch.recurring_rule_id) {
      recurringSingleNote.style.display = "none";
      return;
    }
    recurringSingleNote.style.display = isRecurring.checked ? "none" : "block";
  };

  /* ===============================
     スケジュール詳細取得
  =============================== */
  const sch = await schedulesApi.detail(scheduleId);

  /* ===============================
     基本項目セット
  =============================== */
  title.value = sch.title;
  date.value = sch.start_datetime.slice(0, 10);
  location.value = sch.location || "";
  memo.value = sch.memo || "";
  colorSelect.value = sch.color_name;

  /* ===============================
     色の背景色を反映
  =============================== */
  const selectedOption = [...colorSelect.options].find(o => o.value === sch.color_name);
  if (selectedOption) {
    colorSelect.style.backgroundColor = selectedOption.style.backgroundColor;
  }

  colorSelect.addEventListener("change", () => {
    const opt = colorSelect.options[colorSelect.selectedIndex];
    colorSelect.style.backgroundColor = opt.style.backgroundColor;
  });

  /* ===============================
     時刻セット
  =============================== */
  const [sh, sm] = sch.start_datetime.slice(11, 16).split(":");
  startHour.value = sh;
  startMinute.value = sm;

  if (sch.end_datetime) {
    const [eh, em] = sch.end_datetime.slice(11, 16).split(":");
    endHour.value = eh;
    endMinute.value = em;
  }

  if (sch.recurring_rule_id) {
    isRecurring.checked = true;
    if (sch.recurring_rule) {
      recurringEndDate.value = sch.recurring_rule.end_date;
      recurringFrequency.value = sch.recurring_rule.frequency;
    }
  } else {
    isRecurring.checked = false;
  }
  toggleRecurringSection();
  toggleRecurringSingleNote();

  /* ===============================
     参加者取得
  =============================== */
  const userLinks = await schedulesApi.users(scheduleId);

  rebuildSelectBoxes();
  createdBySelect.value = sch.created_by;

  userLinks.forEach(u => {
    if (u.user_id !== sch.created_by) {
      addParticipantChip(u.user_id, u.name, chipContainer, rebuildSelectBoxes);
    }
  });

  rebuildSelectBoxes();

  /* ===============================
     登録者変更時の排他制御
  =============================== */
  createdBySelect.addEventListener("change", rebuildSelectBoxes);
  isRecurring.addEventListener("change", toggleRecurringSingleNote);

  /* ===============================
     同報者追加
  =============================== */
  participantsSelect.addEventListener("change", () => {
    const userId = participantsSelect.value;
    if (!userId) return;

    const userName = participantsSelect.options[participantsSelect.selectedIndex].text;
    addParticipantChip(userId, userName, chipContainer, rebuildSelectBoxes);
    participantsSelect.value = "";
    rebuildSelectBoxes();
  });

  /* ===============================
     削除確認モーダル
  =============================== */
  const openDeleteModal = () => {
    deleteTargetTitle.textContent = sch.title || "(未設定)";
    deleteTargetDateTime.textContent = formatDateTimeRange(sch.start_datetime, sch.end_datetime);
    deleteTargetLocation.textContent = sch.location || "(未設定)";

    if (sch.recurring_rule_id) {
      deleteRecurringWrap.style.display = "block";
      deleteRecurringAll.checked = false;
    } else {
      deleteRecurringWrap.style.display = "none";
    }

    deleteModal.style.display = "flex";
    deleteModal.setAttribute("aria-hidden", "false");
  };

  const closeDeleteModal = () => {
    deleteModal.style.display = "none";
    deleteModal.setAttribute("aria-hidden", "true");
  };

  btnDelete.addEventListener("click", openDeleteModal);
  cancelDelete.addEventListener("click", closeDeleteModal);

  deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
      closeDeleteModal();
    }
  });

  confirmDelete.addEventListener("click", async () => {
    const deleteRecurring = !!deleteRecurringAll.checked;

    try {
      await schedulesApi.remove(scheduleId, { deleteRecurring });
      alert(deleteRecurring ? "定期予約を削除しました" : "スケジュールを削除しました");
      redirectToTopPage();
    } catch (err) {
      alert("削除に失敗しました");
      console.error(err);
    }
  });

  /* ===============================
     更新処理
  =============================== */
  document.getElementById("editForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      data["participants[]"] = [...document.querySelectorAll("#chipContainer input")]
        .map(i => i.value);

      data.start_datetime = `${data.date} ${data.startHour}:${data.startMinute}:00`;
      data.end_datetime =
        data.endHour && data.endMinute
          ? `${data.date} ${data.endHour}:${data.endMinute}:00`
          : null;

      if (data.endHour && data.endMinute &&
        !validateTimeRangeOrAlert(data.startHour, data.startMinute, data.endHour, data.endMinute)) {
        return;
      }

      Object.assign(data, buildRecurringPayload(isRecurring, recurringEndDate, recurringFrequency));

      if (!validateRecurringInputsOrAlert(isRecurring, recurringEndDate, data.date)) {
        return;
      }

      try {
        await schedulesApi.update(scheduleId, data);
        alert("更新しました");
        redirectToTopPage();
      } catch (err) {
        alert("更新に失敗しました");
        console.error(err);
      }
    });
});
