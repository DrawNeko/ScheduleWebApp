import { groupsApi } from "./api.js";

const typeLabelMap = {
  PUBLIC: "パブリック",
  PRIVATE: "プライベート",
};

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("backButton").addEventListener("click", () => {
    window.location.href = "/index.html";
  });

  try {
    const data = await groupsApi.listEditable();
    renderRoleDescription(data.can_manage_public);
    renderTable(data.groups || []);
  } catch (err) {
    console.error(err);
    alert("グループ一覧の取得に失敗しました");
  }
});

function renderRoleDescription(canManagePublic) {
  const roleDescription = document.getElementById("roleDescription");
  roleDescription.textContent = canManagePublic
    ? "リーダー権限のため、パブリック / 自身作成のプライベートグループを編集できます。"
    : "自身が作成したプライベートグループを編集できます。";
}

function renderTable(groups) {
  const tbody = document.getElementById("groupsTbody");
  tbody.innerHTML = "";

  if (groups.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = '<td colspan="4">編集可能なグループはありません。</td>';
    tbody.appendChild(emptyRow);
  }

  groups.forEach((group) => {
    const tr = document.createElement("tr");

    const actionTd = document.createElement("td");
    actionTd.innerHTML = `
      <div class="action-links">
        <a class="action-link" href="/group_form.html?id=${group.group_id}">編集</a>
        <a class="action-link" href="/group_form.html?id=${group.group_id}">削除</a>
      </div>
    `;

    const typeTd = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "type-badge";
    badge.textContent = typeLabelMap[group.group_type] || group.group_type;
    typeTd.appendChild(badge);

    const nameTd = document.createElement("td");
    nameTd.textContent = group.group_name;

    const usersTd = document.createElement("td");
    usersTd.className = "chips-cell";
    (group.users || []).forEach((user) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = user.name;
      usersTd.appendChild(chip);
    });

    tr.appendChild(actionTd);
    tr.appendChild(typeTd);
    tr.appendChild(nameTd);
    tr.appendChild(usersTd);
    tbody.appendChild(tr);
  });

  const addRow = document.createElement("tr");
  addRow.className = "add-row";
  addRow.innerHTML = `<td colspan="4">+</td>`;
  addRow.addEventListener("click", () => {
    window.location.href = "/group_form.html";
  });
  tbody.appendChild(addRow);
}
