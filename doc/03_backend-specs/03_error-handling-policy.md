# エラーハンドリング方針（現状と改善方針）

## 1. 現状のレスポンス方針

| 層 | 現状 |
|---|---|
| Controller | `try/catch` で例外捕捉し、主に `500` を返却 |
| Service | 入力不整合時に `Error` を投げる実装あり |
| Middleware | 未認証APIに `401 Unauthorized` を返却 |

## 2. 代表的なHTTPステータス

| ステータス | 利用箇所 | 例 |
|---|---|---|
| `200` | 正常取得/更新/削除 | `{"message":"ok"}` |
| `201` | 作成成功 | `POST /api/schedules` |
| `401` | 未認証・認証失敗 | `/api/auth/login`, 認証必須API |
| `403` | 権限外グループアクセス | `/api/groups/:id/users` |
| `500` | サーバ例外全般 | `{"error":"Failed to ..."}` |

## 3. JSONエラー形式（実運用向け提案）

```json
{
  "error": "ValidationError",
  "message": "title is required",
  "field": "title",
  "code": "SCHEDULE_TITLE_REQUIRED"
}
```

## 4. 改善優先度

1. バリデーションエラーを `400` で返却
2. 権限エラーを `403` に統一
3. 404（存在しないリソース）を明示
4. フロントで表示しやすい `code` を返却

## 5. フロント実装時の注意

- 現行 `api.js` は `res.ok` 以外を例外化し、`Error("API Error: <status>")` を投げる
- 画面側ではアラート中心のため、将来的に画面内エラー表示へ移行する場合は
  エラーJSONの構造統一が前提
