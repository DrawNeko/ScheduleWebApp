# API仕様

## 0. 共通

| 項目 | 内容 |
|---|---|
| ベースパス | `/api` |
| 認証方式 | セッションCookie（`sid`） |
| 認証不要 | `POST /api/auth/login`, `POST /api/auth/logout` |
| 認証必須 | 上記以外の `/api/*`（未ログイン時 `401`） |

---

## 1. 認証API（`/api/auth`）

### 1.1 `POST /api/auth/login`

**Request**

```json
{
  "user_id": "user1",
  "password": "pass1"
}
```

**Response 200**

```json
{
  "message": "ok",
  "user": {
    "user_id": "user1",
    "name": "ユーザ名",
    "email": "sample@example.com",
    "role": "member",
    "default_group_id": 1
  }
}
```

**Error**

- `401`: `{"error":"Invalid credentials"}`
- `500`: `{"error":"Failed to login"}`

### 1.2 `POST /api/auth/logout`

**Response 200**

```json
{ "message": "ok" }
```

### 1.3 `GET /api/auth/me`

- ログインユーザ情報を返却
- 未ログイン時は `401 Unauthorized`

---

## 2. グループAPI（`/api/groups`）

| Method | Path | 用途 |
|---|---|---|
| GET | `/api/groups` | 選択可能グループ一覧 + デフォルト取得 |
| GET | `/api/groups/:id/users` | グループ所属ユーザ取得 |
| PUT | `/api/groups/default` | デフォルト表示グループ更新 |
| GET | `/api/groups/editable` | 編集可能グループ一覧取得 |
| GET | `/api/groups/editable/:id` | 編集可能グループ詳細取得 |
| POST | `/api/groups/editable` | グループ作成 |
| PUT | `/api/groups/editable/:id` | グループ更新 |
| DELETE | `/api/groups/editable/:id` | グループ削除 |

### 2.1 `GET /api/groups` Response 200

```json
{
  "groups": [
    { "group_id": 1, "group_name": "Public", "group_type": "PUBLIC" }
  ],
  "default_group_id": 1
}
```

### 2.2 `PUT /api/groups/default`

**Request**

```json
{ "group_id": 1 }
```

**Error**

- `403`: `{"error":"Forbidden group access"}`

### 2.3 `GET /api/groups/editable` Response 200

```json
{
  "can_manage_public": true,
  "groups": [
    {
      "group_id": 1,
      "group_type": "PUBLIC",
      "group_name": "全体",
      "owner_user_id": null,
      "users": [{ "user_id": "user1", "name": "ユーザ1" }]
    }
  ]
}
```

### 2.4 `GET /api/groups/editable/:id` Response 200

```json
{
  "group_id": 3,
  "group_type": "PRIVATE",
  "group_name": "user1個人",
  "owner_user_id": "user1",
  "users": [{ "user_id": "user1", "name": "ユーザ1" }]
}
```

### 2.5 `POST /api/groups/editable`

```json
{
  "group_type": "PRIVATE",
  "group_name": "自分用",
  "member_user_ids": ["user1", "user2"]
}
```

**Response 201**

```json
{ "message": "created", "group_id": 10 }
```

**Validation / Authorization**

- `group_name` は必須
- `group_type` は `PUBLIC` / `PRIVATE`
- `member_user_ids` は1件以上必須
- `group_type=PUBLIC` はリーダー権限のみ許可（`role` が `ld` / `leader` / `リーダー`）

---

## 3. スケジュールAPI（`/api/schedules`）

| Method | Path | 用途 |
|---|---|---|
| GET | `/api/schedules` | スケジュール一覧 |
| GET | `/api/schedules/:id` | スケジュール詳細 |
| GET | `/api/schedules/users/:id` | 参加者一覧 |
| POST | `/api/schedules` | 新規作成 |
| PUT | `/api/schedules/:id` | 更新 |
| DELETE | `/api/schedules/delete/:id` | 削除 |

### 3.1 `GET /api/schedules`

**Query**

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| start | string (yyyy-mm-dd) | 任意 | 期間開始 |
| end | string (yyyy-mm-dd) | 任意 | 期間終了 |
| include_users | `1` / `true` | 任意 | 参加者情報を含める |

### 3.2 `POST /api/schedules`（主要項目）

```json
{
  "created_by": "user1",
  "title": "定例MTG",
  "date": "2026-03-01",
  "start_datetime": "2026-03-01 10:00:00",
  "end_datetime": "2026-03-01 11:00:00",
  "location": "会議室A",
  "memo": "週次",
  "color_name": "Blue",
  "participants": ["user2", "user3"],
  "is_recurring": true,
  "recurring_end_date": "2026-06-30",
  "recurring_frequency": "WEEKLY"
}
```

**Response 201**

```json
{ "message": "created", "schedule_id": 123 }
```

### 3.3 `DELETE /api/schedules/delete/:id`

- Query: `delete_recurring=0|1`（既定 `0`）
  - `0`: 対象1件を削除
  - `1`: 定期予約全体を削除（定期予定時）

**Response 200**

```json
{ "message": "deleted" }
```

---

## 4. ユーザAPI（`/api/users`）

| Method | Path | 用途 |
|---|---|---|
| GET | `/api/users` | ユーザ一覧 |
| GET | `/api/users/:id` | ユーザ詳細 |
| POST | `/api/users` | ユーザ作成 |
| DELETE | `/api/users/:id` | ユーザ削除 |

> NOTE: `POST /api/users` は現状JSON応答ではなく、`/user_register.html` へのリダイレクト実装です。

---

## 5. 色API（`/api/colors`）

| Method | Path | 用途 |
|---|---|---|
| GET | `/api/colors` | 色一覧 |
| GET | `/api/colors/:id` | 色詳細 |
| POST | `/api/colors` | 色作成 |
| DELETE | `/api/colors/:id` | 色削除 |

---

## 6. エラーレスポンス傾向

- 例外時は主に `500` + `{"error":"Failed to ..."}`
- フィールド単位の入力エラー（`400`）は限定的
