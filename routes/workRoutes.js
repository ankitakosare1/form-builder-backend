const express = require("express");
const router = express.Router();

const { getRecentWorks, getSharedWorks } = require("../controllers/workController");
const authMiddleware = require("../middlewares/authenticateUser");

router.get("/recent", authMiddleware, getRecentWorks);
router.get("/shared", authMiddleware, getSharedWorks);

module.exports = router;
