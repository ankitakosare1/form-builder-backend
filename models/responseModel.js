const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
    userAnswers: { type: Array, required: true },
    isValidated: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Response", responseSchema);
