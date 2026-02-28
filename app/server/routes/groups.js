/**
 * scheduleWebApp/app/server/routes/groups.js
 */

const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groupsController");

router.get("/", groupsController.getAvailable);
router.get("/editable", groupsController.getEditable);
router.get("/editable/:id", groupsController.getEditableDetail);
router.post("/editable", groupsController.createEditable);
router.put("/editable/:id", groupsController.updateEditable);
router.delete("/editable/:id", groupsController.deleteEditable);
router.get("/:id/users", groupsController.getUsers);
router.put("/default", groupsController.setDefault);

module.exports = router;
