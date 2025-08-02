const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authenticateUser");
const { createForm, saveDraft, publishForm, getMyForms, getSharedForm, getFormById, renameForm } = require("../controllers/formController");

// Public route
router.get("/shared/:shareLink", getSharedForm);

router.use(authenticateUser);
router.post("/create", createForm);
router.put("/save-draft/:formId", saveDraft);
router.put("/publish/:formId", publishForm);
router.get("/my-forms", getMyForms);
router.get("/:id", getFormById);
router.put("/rename/:formId", renameForm);


module.exports = router;
