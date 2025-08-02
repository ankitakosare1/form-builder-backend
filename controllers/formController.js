const Form = require("../models/formModel");
const Project = require("../models/projectModel");

// Dummy name generator
//const generateDummyName = () => `Form_${Math.random().toString(36).substring(2, 8)}`;

// Create Form (Draft)
exports.createForm = async (req, res) => {
    try {
        let { name, projectId } = req.body;
        if (!name || name.trim() === "") name = "Untitled"; //Default name 

        const form = await Form.create({
            name,
            userId: req.user,
            projectId: projectId || null,  // Allow null if standalone form only
            status: "draft",
        });

        if (projectId) {
            await Project.findByIdAndUpdate(projectId, { $push: { forms: form._id } });
        }

        res.status(201).json({ success: true, form });
    } catch (err) {
        res.status(500).json({ error: "Failed to create form" });
    }
};

// Save Form as Draft
exports.saveDraft = async (req, res) => {
    try {
        const { name, pages, questions = [], truePage, falsePage, pageConditions } = req.body;
        const { formId } = req.params;

        // Validate required fields
        if (!formId || !name) {
            return res.status(400).json({ error: "Form ID, name are required" });
        }

        // Find form and update
        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }

        //  Normalize correctAnswers to store option texts
        const correctAnswers = questions.map((q) => {
            let answer;

            if (q.type === "Multiple Choice" || q.type === "Dropdown") {
                // Get selected option text
                answer = q.options.find(opt => opt === q.answer || opt._id === q.answer) || q.answer;
            } else if (q.type === "Checkbox") {
                // Convert array of IDs to array of texts
                answer = (q.answer || []).map(ans =>
                    q.options.find(opt => opt === ans || opt._id === ans) || ans
                );
            } else {
                // For text, rating, date, etc.
                answer = q.answer || "";
            }

            return { questionId: q._id || q.id, questionText: q.questionText, answer };
        });

        // Update fields
        form.name = name;
        form.pages = pages || form.pages;

        form.questions = questions;

        form.truePage = truePage || form.truePage;
        form.falsePage = falsePage || form.falsePage;
        form.pageConditions = pageConditions || form.pageConditions;

        form.correctAnswers = correctAnswers;
        form.status = "draft";

        await form.save();

        res.status(200).json({
            success: true,
            message: "Form saved as draft successfully",
            form,
        });
    } catch (err) {
        console.error("Save draft error:", err);
        res.status(500).json({ error: "Failed to save form draft" });
    }
};


// Publish Form
exports.publishForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const { name, pages, questions, truePage, falsePage, pageConditions, responders, projectId } = req.body;

        if (responders.length > 3) {
            return res.status(400).json({ error: "Max 3 responders allowed" });
        }

        const shareLink = `${formId}-${Date.now()}`;

        const form = await Form.findById(formId);
        if (!form) return res.status(404).json({ error: "Form not found" });

        form.name = name || form.name;
        form.pages = pages || form.pages;
        form.questions = questions || form.questions;
        form.truePage = truePage || form.truePage;
        form.falsePage = falsePage || form.falsePage;
        form.pageConditions = pageConditions || form.pageConditions;
        form.responders = responders || [];
        form.projectId = projectId || form.projectId;
        form.status = "published";
        form.shareLink = shareLink;

        // const form = await Form.findOneAndUpdate(
        //     { _id: formId, userId: req.user },
        //     { status: "published", projectId, responders, shareLink },
        //     { new: true }
        // );

        await form.save();

        res.json({ success: true, form, shareUrl: `${process.env.FRONTEND_URL}/form/${shareLink}` });
    } catch (err) {
        res.status(500).json({ error: "Failed to publish form" });
    }
};

// Get My Forms
exports.getMyForms = async (req, res) => {
    const forms = await Form.find({ userId: req.user });
    res.json({ success: true, forms });
};

// Public Access to Form (Share Link)
exports.getSharedForm = async (req, res) => {
    try {
        const { shareLink } = req.params;
        console.log("Incoming shareLink:", shareLink);

        const form = await Form.findOne({ shareLink, status: "published" });
        if (!form) return res.status(404).json({ error: "Form not found or unpublished" });
        res.json({ success: true, form });

    } catch (err) {
        res.status(500).json({ error: "Failed to fetch form" });
    }
};

exports.getFormById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

         console.log("Incoming Form ID:", id);
        console.log("User from auth:", req.user);

        const form = await Form.findOne({ _id: id, userId }).populate("projectId");

        if (!form) {
            return res.status(404).json({ success: false, message: "Form not found" });
        }

        res.status(200).json({ success: true, form });
    } catch (err) {
        console.error("Error fetching form:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Rename Form Controller
exports.renameForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const { name } = req.body;
        const userId = req.user._id;

        console.log("Incoming Form ID for Rename:", formId);
        console.log("New Name:", name);
        console.log("User from auth:", req.user);

        if (!name || name.trim() === "") {
            return res.status(400).json({ success: false, message: "Form name cannot be empty" });
        }

        const form = await Form.findOne({ _id: formId, userId });

        if (!form) {
            return res.status(404).json({ success: false, message: "Form not found or unauthorized" });
        }

        form.name = name.trim();
        await form.save();

        res.status(200).json({ success: true, message: "Form renamed successfully", form });
    } catch (err) {
        console.error("Error renaming form:", err);
        res.status(500).json({ success: false, message: "Server error while renaming form" });
    }
};




