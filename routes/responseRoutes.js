const express = require("express");
const router = express.Router();
const { submitResponse } = require("../controllers/responseController");

router.post("/submit", submitResponse); // No auth - public form submission

module.exports = router;
