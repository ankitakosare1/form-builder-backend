const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authenticateUser");
const { getFormAnalytics } = require("../controllers/analyticsController");

// Protect all analytics routes
router.use(authenticateUser);

// Route to fetch form analytics
router.get("/form/:formId", getFormAnalytics);

module.exports = router;
