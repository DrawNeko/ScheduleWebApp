/**
 * scheduleWebApp/app/server/routes/schedules.js
 */

const express = require('express');
const router = express.Router();
const schedulesController = require('../controllers/schedulesController');
const multer = require('multer');
const upload = multer();

/* ============================================================
   ページ（静的 or HTML返却）
============================================================ */
// 新規登録画面
router.get('/add', schedulesController.getAddPage);
// 編集画面
router.get('/edit/:id', schedulesController.getEditPage);
// 詳細画面（※最後の動的ページではない。API より前に置く）
router.get('/detail/:id', schedulesController.getDetailPage);

/* ============================================================
   API（JSON）
============================================================ */
// スケジュール詳細 API（JSON）
router.get('/:id', schedulesController.getDetailAPI);
// 参加者一覧 API
router.get('/users/:id', schedulesController.getUsers);

// 一覧取得
router.get('/', schedulesController.getAll);
// 新規登録
router.post('/', schedulesController.create);
// 更新
router.put('/:id', upload.none(), schedulesController.update);
// 削除
router.delete('/delete/:id', schedulesController.remove);

module.exports = router;
