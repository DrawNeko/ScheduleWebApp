/**
 * scheduleWebApp/app/public/assets/js/api.js
 */

export const API = {
  USERS: "/users",
  COLORS: "/colors",
  SCHEDULES: "/schedules",
  AUTH: "/auth",
  GROUPS: "/groups",
};

/**
 * buildApiPath の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function buildApiPath(path, query = null) {
  if (!query) return `/api${path}`;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.append(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `/api${path}?${queryString}` : `/api${path}`;
}

/**
 * handleResponse の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    console.error("API Error:", res.status, text);
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}

export async function apiGet(path, query = null) {
  const res = await fetch(buildApiPath(path, query));
  return handleResponse(res);
}

export async function apiPost(path, body) {
  const res = await fetch(buildApiPath(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiPut(path, body) {
  const res = await fetch(buildApiPath(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiDelete(path, query = null) {
  const res = await fetch(buildApiPath(path, query), {
    method: "DELETE",
  });
  return handleResponse(res);
}

export const usersApi = {
  list: () => apiGet(API.USERS),
  detail: (userId) => apiGet(`${API.USERS}/${userId}`),
  roles: ({ assignableForCreate = false } = {}) =>
    apiGet(`${API.USERS}/roles`, {
      assignable_for_create: assignableForCreate ? 1 : undefined,
    }),
  permissions: () => apiGet(`${API.USERS}/permissions`),
  create: (payload) => apiPost(API.USERS, payload),
  updateMyProfile: (payload) => apiPut(`${API.USERS}/me`, payload),
  updateRole: (userId, payload) => apiPut(`${API.USERS}/${userId}/role`, payload),
  resetPassword: (userId) => apiPut(`${API.USERS}/${userId}/reset-password`, {}),
  remove: (userId) => apiDelete(`${API.USERS}/${userId}`),
};

// ---- domain helpers (schedules) ----
export const schedulesApi = {
  list: ({ start, end, includeUsers } = {}) =>
    apiGet(API.SCHEDULES, {
      start,
      end,
      include_users: includeUsers ? 1 : undefined,
    }),

  detail: (scheduleId) => apiGet(`${API.SCHEDULES}/${scheduleId}`),

  users: (scheduleId) => apiGet(`${API.SCHEDULES}/users/${scheduleId}`),

  create: (payload) => apiPost(API.SCHEDULES, payload),

  update: (scheduleId, payload) => apiPut(`${API.SCHEDULES}/${scheduleId}`, payload),

  remove: (scheduleId, { deleteRecurring = false } = {}) =>
    apiDelete(`${API.SCHEDULES}/delete/${scheduleId}`, {
      delete_recurring: deleteRecurring ? 1 : 0,
    }),
};

export const authApi = {
  login: (payload) => apiPost(`${API.AUTH}/login`, payload),
  logout: () => apiPost(`${API.AUTH}/logout`, {}),
  me: () => apiGet(`${API.AUTH}/me`),
};

export const groupsApi = {
  list: () => apiGet(API.GROUPS),
  users: (groupId) => apiGet(`${API.GROUPS}/${groupId}/users`),
  setDefault: (groupId) => apiPut(`${API.GROUPS}/default`, { group_id: groupId }),
  listEditable: () => apiGet(`${API.GROUPS}/editable`),
  detailEditable: (groupId) => apiGet(`${API.GROUPS}/editable/${groupId}`),
  createEditable: (payload) => apiPost(`${API.GROUPS}/editable`, payload),
  updateEditable: (groupId, payload) => apiPut(`${API.GROUPS}/editable/${groupId}`, payload),
  deleteEditable: (groupId) => apiDelete(`${API.GROUPS}/editable/${groupId}`),
};
