import { authApi, groupsApi, apiGet, API } from "./api.js";

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
let canManagePublic = false;

document.addEventListener("DOMContentLoaded", async () => {
  const me = await authApi.me();
  canManagePublic = isLeaderRole(me.role);

  setupActions();
  await loadUsers();

  if (groupId) {
    await loadGroupDetail(groupId);
  } else {
    setupCreateMode();
  }
});

function isLeaderRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  return normalized === "ld" || normalized === "leader" || normalized === "リーダー";
}

function setupActions() {
  document.getElementById("cancelButton").addEventListener("click", () => {
    window.location.href = "/group_manage.html";
  });

  document.getElementById("groupForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      group_type: document.getElementById("groupType").value,
      group_name: document.getElementById("groupName").value.trim(),
      member_user_ids: [...document.querySelectorAll("input[name='member']:checked")].map((el) => el.value),
    };

    if (!payload.group_name) {
      alert("グループ名を入力してください");
      return;
    }

    if (payload.member_user_ids.length === 0) {
      alert("所属ユーザを1名以上選択してください");
      return;
    }

    try {
      if (groupId) {
        await groupsApi.updateEditable(groupId, payload);
      } else {
        await groupsApi.createEditable(payload);
      }
      window.location.href = "/group_manage.html";
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  });

  document.getElementById("deleteButton").addEventListener("click", async () => {
    if (!groupId) return;
    if (!confirm("このグループを削除します。よろしいですか？")) return;

    try {
      await groupsApi.deleteEditable(groupId);
      window.location.href = "/group_manage.html";
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました");
    }
  });
}

async function loadUsers() {
  const users = await apiGet(API.USERS);
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  users.forEach((user) => {
    const label = document.createElement("label");
    label.className = "user-option";

    label.innerHTML = `
      <input type="checkbox" name="member" value="${user.user_id}">
      <span>${user.name} (${user.user_id})</span>
    `;

    userList.appendChild(label);
  });
}

function setupCreateMode() {
  document.getElementById("pageTitle").textContent = "グループ新規作成";
  const groupType = document.getElementById("groupType");
  if (!canManagePublic) {
    groupType.value = "PRIVATE";
    groupType.disabled = true;
  }
  document.getElementById("deleteButton").style.display = "none";
}

async function loadGroupDetail(targetGroupId) {
  try {
    const group = await groupsApi.detailEditable(targetGroupId);
    document.getElementById("pageTitle").textContent = "グループ編集";
    document.getElementById("groupType").value = group.group_type;
    document.getElementById("groupType").disabled = true;
    document.getElementById("groupName").value = group.group_name;

    const userIds = new Set((group.users || []).map((u) => u.user_id));
    document.querySelectorAll("input[name='member']").forEach((el) => {
      el.checked = userIds.has(el.value);
    });
  } catch (err) {
    console.error(err);
    alert("グループ詳細の取得に失敗しました");
    window.location.href = "/group_manage.html";
  }
}
