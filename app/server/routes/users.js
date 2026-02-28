/**
 * scheduleWebApp/app/server/routes/users.js
 */

// ------------------------------------------------------
// URL と HTTP メソッドの定義だけを書く層。
// 実際の処理は controller に委譲する。
// ------------------------------------------------------

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// 一覧取得
router.get('/', usersController.getAll);

// 詳細取得
router.get('/:id', usersController.getDetail);

// 新規登録
router.post('/', usersController.create);

// 削除
router.delete('/:id', usersController.remove);

module.exports = router;
