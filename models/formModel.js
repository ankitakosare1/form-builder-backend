const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
    name: { type: String, required: true },
    pages: { type: Array, default: [] }, // Full form structure (UI-based pages)
    questions: [
    {
        questionText: { type: String, required: true },
        options: { type: [String], default: [] },
        answer: { type: mongoose.Schema.Types.Mixed, default: "" }, 
        correctAnswer: { type: String }
    }
],
    truePage: { type: String }, // Page to redirect if answers validated
    falsePage: { type: String }, // Page to redirect if answers incorrect
    pageConditions: { type: Object, default: {} },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    responders: [{ email: String }], // For edit access
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    shareLink: { type: String }, // Unique public shareable link for published form
    correctAnswers: { type: Array, default: [] }, // Store validation answers
}, { timestamps: true });

module.exports = mongoose.model("Form", formSchema);


