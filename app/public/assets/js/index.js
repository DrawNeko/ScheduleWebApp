/**
 * scheduleWebApp/app/public/assets/js/index.js
 */

import { schedulesApi, authApi, groupsApi, usersApi } from "./api.js";

let currentDate = new Date();
let currentGroupId = null;
let currentGroupUsers = [];
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];


function getWeekendClass(dayOfWeek) {
  if (dayOfWeek === 0) return "sunday";
  if (dayOfWeek === 6) return "saturday";
  return "";
}


document.addEventListener("DOMContentLoaded", async () => {
  await setupHamburgerMenu();
  await setupGroupBar();
  setupButtons();
  await renderWeek();
});

/**
 * setupHamburgerMenu の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
async function setupHamburgerMenu() {
  const user = await authApi.me();
  const permissions = await usersApi.permissions();

  const menuButton = document.getElementById("btnHamburgerMenu");
  const menuPanel = document.getElementById("hamburgerMenuPanel");
  const loginUser = document.getElementById("loginUser");

  if (loginUser) {
    loginUser.innerHTML = `${user.name}<br>${user.user_id}<br>${user.role_name_ja}`;
  }

  const menuUserRegister = document.getElementById("menuUserRegister");
  const menuUserProfileEdit = document.getElementById("menuUserProfileEdit");
  const menuUserMaintenance = document.getElementById("menuUserMaintenance");
  const menuLogout = document.getElementById("menuLogout");

  if (menuUserRegister) {
    if (!permissions.can_create_user) {
      menuUserRegister.style.display = "none";
    } else {
      menuUserRegister.onclick = () => {
        window.location.href = "/user_register.html";
      };
    }
  }

  if (menuUserProfileEdit) {
    menuUserProfileEdit.onclick = () => {
      window.location.href = "/user_profile_edit.html";
    };
  }

  if (menuUserMaintenance) {
    if (!permissions.can_assign_role && !permissions.can_delete_user && !permissions.can_reset_password) {
      menuUserMaintenance.style.display = "none";
    } else {
      menuUserMaintenance.onclick = () => {
        window.location.href = "/user_maintenance.html";
      };
    }
  }

  if (menuLogout) {
    menuLogout.onclick = async () => {
      await authApi.logout();
      location.href = "/login.html";
    };
  }

  if (menuButton && menuPanel) {
    menuButton.onclick = () => {
      const isHidden = menuPanel.classList.toggle("hidden");
      menuButton.setAttribute("aria-expanded", String(!isHidden));
    };

    document.addEventListener("click", (event) => {
      if (menuPanel.classList.contains("hidden")) return;

      const clickedInsideMenu = menuPanel.contains(event.target) || menuButton.contains(event.target);
      if (!clickedInsideMenu) {
        menuPanel.classList.add("hidden");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }
}

/**
 * setupGroupBar の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
async function setupGroupBar() {
  const groupSelect = document.getElementById("groupSelect");
  const btnSaveDefaultGroup = document.getElementById("btnSaveDefaultGroup");
  const btnEditGroups = document.getElementById("btnEditGroups");

  const data = await groupsApi.list();
  groupSelect.innerHTML = "";
  data.groups.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.group_id;
    opt.textContent = `${g.group_name}${g.group_type === "PRIVATE" ? " (Private)" : ""}`;
    groupSelect.appendChild(opt);
  });

  currentGroupId = data.default_group_id || (data.groups[0] && data.groups[0].group_id);
  if (currentGroupId) {
    groupSelect.value = String(currentGroupId);
    currentGroupUsers = await groupsApi.users(currentGroupId);
  }

  groupSelect.addEventListener("change", async () => {
    currentGroupId = Number(groupSelect.value);
    currentGroupUsers = await groupsApi.users(currentGroupId);
    await renderWeek();
  });

  btnSaveDefaultGroup.addEventListener("click", async () => {
    if (!currentGroupId) return;
    await groupsApi.setDefault(currentGroupId);
    alert("デフォルト表示グループを保存しました");
  });

  btnEditGroups.addEventListener("click", () => {
    window.location.href = "/group_manage.html";
  });
}

/**
 * setupButtons の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function setupButtons() {
  document.getElementById("btnPrevWeek").onclick = async () => {
    currentDate.setDate(currentDate.getDate() - 7);
    await renderWeek();
  };

  document.getElementById("btnPrevDay").onclick = async () => {
    currentDate.setDate(currentDate.getDate() - 1);
    await renderWeek();
  };

  document.getElementById("btnThisWeek").onclick = async () => {
    currentDate = new Date();
    await renderWeek();
  };

  document.getElementById("btnNextDay").onclick = async () => {
    currentDate.setDate(currentDate.getDate() + 1);
    await renderWeek();
  };

  document.getElementById("btnNextWeek").onclick = async () => {
    currentDate.setDate(currentDate.getDate() + 7);
    await renderWeek();
  };
}

/**
 * renderWeek の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
async function renderWeek() {
  try {
    const displayStart = normalizeDate(currentDate);
    const weekDates = getWeekDates(displayStart);

    weekDates.forEach((d, idx) => {
      const dayLabel = document.querySelector(`.day-label[data-day="${idx}"]`);
      const dateLabel = document.querySelector(`.date[data-day="${idx}"]`);
      const headerCell = dateLabel.closest('th');
      const weekendClass = getWeekendClass(d.getDay());

      dayLabel.textContent = WEEKDAY_LABELS[d.getDay()];
      dateLabel.textContent = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;

      dayLabel.classList.remove('saturday', 'sunday');
      dateLabel.classList.remove('saturday', 'sunday');
      headerCell.classList.remove('saturday', 'sunday');

      if (weekendClass) {
        dayLabel.classList.add(weekendClass);
        dateLabel.classList.add(weekendClass);
        headerCell.classList.add(weekendClass);
      }
    });

    const users = [...currentGroupUsers];

    const tbody = document.getElementById("member-rows");
    tbody.innerHTML = "";

    users.forEach(u => {
      const tr = document.createElement("tr");
      tr.dataset.userid = u.user_id;

      const th = document.createElement("th");
      th.textContent = u.name;
      tr.appendChild(th);

      for (let day = 0; day < 7; day++) {
        const td = document.createElement("td");
        td.id = `cell-${u.user_id}-${day}`;

        const weekendClass = getWeekendClass(weekDates[day].getDay());
        if (weekendClass) {
          td.classList.add(weekendClass);
        }

        const inner = document.createElement("div");
        inner.className = "cell-inner";
        inner.innerHTML = `<div class="empty"></div>`;

        td.appendChild(inner);
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });

    const startStr = formatDate(weekDates[0]);
    const endStr = formatDate(weekDates[6]);

    let schedules = await schedulesApi.list({
      start: startStr,
      end: endStr,
      includeUsers: true
    });

    schedules.sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

    for (const sch of schedules) {
      const start = normalizeDate(new Date(sch.start_datetime));
      const dayIndex = getDayDiff(displayStart, start);

      if (dayIndex < 0 || dayIndex > 6) continue;

      const usersInSchedule = Array.isArray(sch.participants) ? sch.participants : [];

      usersInSchedule.forEach(u => {
        const cell = document.getElementById(`cell-${u.user_id}-${dayIndex}`);
        if (!cell) return;

        const inner = cell.querySelector(".cell-inner");

        const chip = document.createElement("div");
        chip.className = "event-chip";
        chip.dataset.scheduleId = sch.schedule_id;
        chip.style.backgroundColor = sch.color_code_bg || "#888";
        chip.style.color = sch.color_code_text || "#000";

        const startTime = sch.start_datetime.slice(11, 16);
        const endTime = sch.end_datetime ? sch.end_datetime.slice(11, 16) : "";

        chip.innerHTML = `
          <div><strong>${sch.title}</strong></div>
          <div>${startTime}${endTime ? " ～ " + endTime : ""}</div>
        `;

        inner.appendChild(chip);
      });
    }

    syncRowHeights();
    syncChipHeights();

    document.querySelectorAll(".event-chip").forEach(chip => {
      chip.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const scheduleId = e.currentTarget.dataset.scheduleId;
        window.location.href = `schedule_edit.html?id=${scheduleId}`;
      });
    });

    document.querySelectorAll("#schedule-table td").forEach(cell => {
      const chip = cell.querySelector(".event-chip");

      if (!chip) {
        cell.classList.add("empty-cell");
      } else {
        const chipWidth = chip.offsetWidth;
        const cellWidth = cell.offsetWidth;

        if (chipWidth < cellWidth) {
          cell.classList.add("empty-cell");
        } else {
          cell.classList.remove("empty-cell");
        }
      }

      cell.addEventListener("dblclick", (e) => {
        if (e.target.closest(".event-chip")) return;

        const userId = cell.parentElement.dataset.userid;
        const dayIndex = parseInt(cell.id.split("-").pop());
        if (dayIndex < 0) return;

        const baseDate = normalizeDate(currentDate);
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + dayIndex);

        const dateStr = formatDate(date);

        window.location.href = `schedule_add.html?user=${userId}&date=${dateStr}`;
      });
    });
  } catch (err) {
    console.error(err);
    alert("データ取得に失敗しました");
  }
}

/**
 * syncRowHeights の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function syncRowHeights() {
  const rows = document.querySelectorAll("#member-rows tr");

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    cells.forEach(c => c.style.height = "auto");

    let maxHeight = 60;
    cells.forEach(c => {
      const h = c.offsetHeight;
      if (h > maxHeight) maxHeight = h;
    });

    cells.forEach(c => c.style.height = maxHeight + "px");
  });
}

/**
 * syncChipHeights の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function syncChipHeights() {
  for (let day = 0; day < 7; day++) {
    const chips = document.querySelectorAll(`td[id$="-${day}"] .event-chip`);
    if (chips.length === 0) continue;

    chips.forEach(chip => chip.style.height = "auto");

    let maxHeight = 0;
    chips.forEach(chip => {
      const h = chip.offsetHeight;
      if (h > maxHeight) maxHeight = h;
    });

    chips.forEach(chip => {
      chip.style.height = maxHeight + "px";
    });
  }
}

/**
 * formatDate の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * normalizeDate の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * getDayDiff の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function getDayDiff(baseDate, targetDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((normalizeDate(targetDate) - normalizeDate(baseDate)) / msPerDay);
}

/**
 * getWeekDates の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function getWeekDates(startDate) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(d);
  }
  return dates;
}
