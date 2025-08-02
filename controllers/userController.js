const User = require("../models/userModel");
const createToken = require("../utils/createToken");

//Controller for User Signup
const signupUser = async (req, res) => {
    try{
        const {name, email, password, confirmPassword} = req.body;

        //Validate all fields are filled or not
        if(!name || !email || !password || !confirmPassword){
            return res.status(400).json({error: "All fields are required"});
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Basic email format validation using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ error: "Please enter a valid email address" });
        }

        // Password minimum length check
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        //Password should match with confirmPassword
        if(password !== confirmPassword){
            return res.status(400).json({error: "Passwords do not match"});
        }

        //Signup logic from model
        const user = await User.signup(name, normalizedEmail, password);

        //Create Token
        const token = createToken(user._id);

        res.status(201).json({
            message: "User registered successfully",
            user:{
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    }catch(err){
        res.status(400).json({error: err.message});
    }
};

//Controller for User Login
const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;

        //Validate input
        if(!email || !password){
            return res.status(400).json({error: "Email and password are required"});
        }

        const normalizedEmail = email.trim().toLowerCase();

        //Login logic from model
        const user = await User.login(normalizedEmail, password);

        //Create Token
        const token = createToken(user._id);

        res.status(200).json({
            message: "Login successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    }catch(err){
        res.status(400).json({error: err.message});
    }
};

// Controller for Get Profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile || "",
                location: user.location || ""
            }
        });
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Controller for Update Profile
const updateProfile = async (req, res) => {
    try {
        const { name, mobile, location } = req.body;

        // Validate name field
        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Name is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name: name.trim(), mobile, location },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                mobile: updatedUser.mobile || "",
                location: updatedUser.location || ""
            }
        });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    signupUser,
    loginUser,
    getProfile,
    updateProfile
};

