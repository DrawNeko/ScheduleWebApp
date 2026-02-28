/**
 * scheduleWebApp/app/public/assets/js/schedule_common.js
 */

import { apiGet, API } from "./api.js";

/* ============================
   時刻セレクト生成
============================ */
export function buildHourOptions(select) {
  select.innerHTML = '<option value="">--</option>';
  for (let h = 0; h < 24; h++) {
    const hh = String(h).padStart(2, "0");
    select.innerHTML += `<option value="${hh}">${hh}</option>`;
  }
}

export function buildMinuteOptions(select) {
  select.innerHTML = '<option value="">--</option>';
  [0, 15, 30, 45].forEach(m => {
    const mm = String(m).padStart(2, "0");
    select.innerHTML += `<option value="${mm}">${mm}</option>`;
  });
}

/* ============================
   ユーザー一覧取得
============================ */
export async function fetchUsers() {
  return apiGet(API.USERS);
}

/* ============================
   色一覧取得
============================ */
export async function loadColors(select) {
  const colors = await apiGet(API.COLORS);

  colors.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.color_name;
    opt.textContent = c.color_name;
    opt.dataset.bg = c.color_code_bg;
    opt.dataset.text = c.color_code_text;
    opt.style.background = c.color_code_bg;
    opt.style.color = c.color_code_text;
    select.appendChild(opt);
  });
}

/* ============================
   色プレビューを select に反映する共通関数
============================ */
export function applyColorPreview(select) {
  const opt = select.options[select.selectedIndex];
  if (!opt) return;

  const bg = opt.dataset.bg;
  const text = opt.dataset.text;

  if (bg) {
    select.style.backgroundColor = bg;
    select.style.color = text || "#000";
  }
}

/* ============================
   チップ生成
============================ */
export function addParticipantChip(userId, userName, chipContainer, rebuildSelectBoxes) {
  const chip = document.createElement("div");
  chip.className = "chip";
  chip.dataset.userid = userId;
  chip.innerHTML = `${userName} <button>×</button>`;

  chip.querySelector("button").onclick = () => {
    chip.remove();
    document.getElementById("hidden-" + userId)?.remove();
    rebuildSelectBoxes();
  };

  chipContainer.appendChild(chip);

  const hidden = document.createElement("input");
  hidden.type = "hidden";
  hidden.name = "participants[]";
  hidden.value = userId;
  hidden.id = "hidden-" + userId;
  chipContainer.appendChild(hidden);
}

/* ============================
   プルダウン再生成
============================ */
export function rebuildSelectBoxesBase(users, createdBySelect, participantsSelect, chipContainer) {
  const selectedCreator = createdBySelect.value;
  const selectedParticipants = [...chipContainer.querySelectorAll(".chip")].map(
    chip => chip.dataset.userid
  );

  // 登録者
  createdBySelect.innerHTML = '<option value="">選択してください</option>';
  users.forEach(u => {
    if (!selectedParticipants.includes(u.user_id)) {
      createdBySelect.innerHTML += `<option value="${u.user_id}">${u.name}</option>`;
    }
  });
  createdBySelect.value = selectedCreator;

  // 同報者
  participantsSelect.innerHTML = '<option value="">選択してください</option>';
  users.forEach(u => {
    const isCreator = u.user_id === selectedCreator;
    const isAlreadyParticipant = selectedParticipants.includes(u.user_id);

    if (!isCreator && !isAlreadyParticipant) {
      participantsSelect.innerHTML += `<option value="${u.user_id}">${u.name}</option>`;
    }
  });
}

/* ============================
   時刻妥当性チェック（開始 <= 終了）
============================ */
export function isValidTimeRange(startHour, startMinute, endHour, endMinute) {
  if (!startHour || !startMinute || !endHour || !endMinute) return false;

  const start = Number(startHour) * 60 + Number(startMinute);
  const end = Number(endHour) * 60 + Number(endMinute);

  return end >= start;
}

export function validateTimeRangeOrAlert(startHour, startMinute, endHour, endMinute) {
  if (!isValidTimeRange(startHour, startMinute, endHour, endMinute)) {
    alert("終了時刻は開始時刻以降を選択してください");
    return false;
  }
  return true;
}

/* ============================
   定期予約 UI 共通処理
============================ */
export function setupRecurringSectionToggle(isRecurringCheckbox, recurringSection) {

/**
 * toggle の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
  const toggle = () => {
    recurringSection.style.display = isRecurringCheckbox.checked ? "block" : "none";
  };

  isRecurringCheckbox.addEventListener("change", toggle);
  toggle();

  return toggle;
}

export function buildRecurringPayload(isRecurringCheckbox, recurringEndDateInput, recurringFrequencySelect) {
  return {
    is_recurring: isRecurringCheckbox.checked,
    recurring_end_date: isRecurringCheckbox.checked ? recurringEndDateInput.value : null,
    recurring_frequency: isRecurringCheckbox.checked ? recurringFrequencySelect.value : null
  };
}

export function validateRecurringInputsOrAlert(isRecurringCheckbox, recurringEndDateInput, startDate) {
  if (!isRecurringCheckbox.checked) return true;

  if (!recurringEndDateInput.value) {
    alert("定期予約の終了日は必須です");
    return false;
  }

  if (recurringEndDateInput.value < startDate) {
    alert("定期予約の終了日は予定日以降にしてください");
    return false;
  }

  return true;
}

document.getElementById("btnBack").addEventListener("click", () => {
  window.location.href = "/";
});
