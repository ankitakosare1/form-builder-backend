const express = require("express");
const router = express.Router();

const {signupUser, loginUser, getProfile, updateProfile} = require("../controllers/userController");
const authenticateUser = require("../middlewares/authenticateUser");

//Signup route
router.post("/signup", signupUser);

//Login route
router.post("/login", loginUser);


router.use(authenticateUser);

// Fetch logged-in user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

module.exports = router;