const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authenticateUser");
const { createProject, getProjects, checkProjectExists, getProjectForms } = require("../controllers/projectController");

router.use(authenticateUser);
router.post("/create", createProject);
router.get("/my-projects", getProjects);
router.post("/check", checkProjectExists);
router.get("/:projectId/forms", getProjectForms);

module.exports = router;
