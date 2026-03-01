/**
 * scheduleWebApp/app/server/routes/users.js
 */

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.get('/', usersController.getAll);
router.get('/roles', usersController.getRoles);
router.get('/permissions', usersController.getPermissions);
router.put('/me', usersController.updateMyProfile);
router.put('/:id/role', usersController.updateRole);
router.put('/:id/reset-password', usersController.resetPassword);
router.get('/:id', usersController.getDetail);
router.post('/', usersController.create);
router.delete('/:id', usersController.remove);

module.exports = router;
