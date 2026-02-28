# ドキュメントガイド

`scheduleWebApp/doc` 配下の仕様資料を、用途別ディレクトリ + 命名規則で整理しています。

## 1. フォルダ構成

| フォルダ | 用途 | 主なファイル |
|---|---|---|
| `01_overview/` | システム全体像・アーキテクチャ・用語 | `01_system-overview.md`, `02_architecture.md` |
| `02_screen-specs/` | 画面仕様・画面遷移 | `01_screen-map.md`, `07_display-group-spec.md`, `09_screen-transition-spec.md` |
| `03_backend-specs/` | バリデーション/API/エラー方針 | `01_validation-spec.md`, `02_api-spec.md`（`/api/groups/editable` 含む） |
| `04_design/` | 画面デザイン/CSS設計 | `01_css-layout-spec.md` |
| `05_database/` | DB構成・DDL関連 | `01_schema-ddl.md` |
| `06_operations/` | 運用・開発手順・テスト方針 | `01_delete-spec-edit.md`, `02_local-development-guide.md` |

## 2. ファイル名規則

- 形式: `NN_<topic>.md`
  - `NN`: 同一フォルダ内の表示順（2桁）
  - `<topic>`: 英小文字 + ハイフン（kebab-case）
- 例:
  - `01_validation-spec.md`
  - `03_weekly-top-screen.md`

## 3. 記述ルール（推奨）

- 見出し（`#`, `##`, `###`）で章立てを明確化
- 入出力・比較は **表** で整理
- リクエスト例・レスポンス例は **コードブロック**（`json`, `bash` など）を使用
- 補足事項は `> NOTE` 形式で明示

## 4. クイックリンク

- [全体仕様](./01_overview/01_system-overview.md)
- [アーキテクチャ概要](./01_overview/02_architecture.md)
- [用語集](./01_overview/03_glossary.md)
- [画面遷移仕様](./02_screen-specs/09_screen-transition-spec.md)
- [バリデーション仕様](./03_backend-specs/01_validation-spec.md)
- [API仕様](./03_backend-specs/02_api-spec.md)
- [エラーハンドリング方針](./03_backend-specs/03_error-handling-policy.md)
- [CSSレイアウト仕様](./04_design/01_css-layout-spec.md)
- [ローカル開発ガイド](./06_operations/02_local-development-guide.md)
- [テスト戦略](./06_operations/03_testing-strategy.md)
