import { authApi, groupsApi, apiGet, API } from "./api.js";

const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
let canManagePublic = false;
let currentUserId = "";
let existingEditableGroups = [];
let allUsers = [];
const selectedMemberUserIds = new Set();

document.addEventListener("DOMContentLoaded", async () => {
  const me = await authApi.me();
  currentUserId = me.user_id;
  canManagePublic = isLeaderRole(me.role);

  setupActions();
  await loadUsers();
  await loadEditableGroups();

  if (groupId) {
    await loadGroupDetail(groupId);
  } else {
    setupCreateMode();
  }

  validateGroupName();
});

function isLeaderRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  return normalized === "admin" || normalized === "ld" || normalized === "leader" || normalized === "リーダー";
}

function setupActions() {
  document.getElementById("cancelButton").addEventListener("click", () => {
    window.location.href = "/group_manage.html";
  });

  document.getElementById("groupType").addEventListener("change", validateGroupName);
  document.getElementById("groupName").addEventListener("input", validateGroupName);
  document.getElementById("memberFilter").addEventListener("input", renderUserList);
  document.getElementById("selectFilteredMembersButton").addEventListener("click", () => {
    getFilteredUsers().forEach((user) => selectedMemberUserIds.add(user.user_id));
    renderUserList();
  });

  document.getElementById("groupForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      group_type: document.getElementById("groupType").value,
      group_name: document.getElementById("groupName").value.trim(),
      member_user_ids: [...selectedMemberUserIds],
    };

    if (!payload.group_name) {
      alert("グループ名を入力してください");
      return;
    }

    if (isDuplicateGroupName(payload.group_name, payload.group_type)) {
      alert("同じグループ種別に同名グループが存在します");
      validateGroupName();
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

async function loadEditableGroups() {
  const editable = await groupsApi.listEditable();
  existingEditableGroups = editable.groups || [];
}

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

function isDuplicateGroupName(groupName, groupType) {
  if (groupId) return false;

  const normalizedGroupType = String(groupType || "").trim().toUpperCase();
  const normalizedName = normalizeName(groupName);
  if (!normalizedName) return false;

  if (normalizedGroupType === "PUBLIC") {
    return existingEditableGroups.some(
      (group) => group.group_type === "PUBLIC" && normalizeName(group.group_name) === normalizedName
    );
  }

  return existingEditableGroups.some(
    (group) =>
      group.group_type === "PRIVATE" &&
      group.owner_user_id === currentUserId &&
      normalizeName(group.group_name) === normalizedName
  );
}

function validateGroupName() {
  const groupName = document.getElementById("groupName").value;
  const groupType = document.getElementById("groupType").value;
  const saveButton = document.getElementById("saveButton");
  const hint = document.getElementById("groupNameHint");

  if (groupId) {
    saveButton.disabled = false;
    hint.textContent = "";
    hint.classList.remove("error");
    return;
  }

  const isDuplicate = isDuplicateGroupName(groupName, groupType);
  saveButton.disabled = isDuplicate;
  hint.textContent = isDuplicate
    ? "同じ種別に同名のグループが既に存在するため保存できません。"
    : "";
  hint.classList.toggle("error", isDuplicate);
}

async function loadUsers() {
  allUsers = await apiGet(API.USERS);
  renderUserList();
}

function getFilteredUsers() {
  const query = String(document.getElementById("memberFilter").value || "").trim().toLowerCase();
  if (!query) return allUsers;
  return allUsers.filter((user) => {
    const userId = String(user.user_id || "").toLowerCase();
    const userName = String(user.name || "").toLowerCase();
    return userId.includes(query) || userName.includes(query);
  });
}

function renderUserList() {
  const filteredUsers = getFilteredUsers();
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  filteredUsers.forEach((user) => {
    const label = document.createElement("label");
    label.className = "user-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "member";
    input.value = user.user_id;
    input.checked = selectedMemberUserIds.has(user.user_id);
    input.addEventListener("change", () => {
      if (input.checked) {
        selectedMemberUserIds.add(user.user_id);
      } else {
        selectedMemberUserIds.delete(user.user_id);
      }
    });

    const span = document.createElement("span");
    span.textContent = `${user.name} (${user.user_id})`;

    label.appendChild(input);
    label.appendChild(span);
    userList.appendChild(label);
  });

  document.getElementById("memberFilterCount").textContent = `表示件数: ${filteredUsers.length} / ${allUsers.length}（選択: ${selectedMemberUserIds.size}）`;
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
    const groupType = document.getElementById("groupType");
    groupType.value = group.group_type;

    const canSwitchPublicToPrivate = canManagePublic && group.group_type === "PUBLIC";
    groupType.disabled = !canSwitchPublicToPrivate;
    document.getElementById("groupName").value = group.group_name;

    selectedMemberUserIds.clear();
    (group.users || []).forEach((u) => selectedMemberUserIds.add(u.user_id));
    renderUserList();
  } catch (err) {
    console.error(err);
    alert("グループ詳細の取得に失敗しました");
    window.location.href = "/group_manage.html";
  }
}
