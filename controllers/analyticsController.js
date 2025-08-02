const Response = require("../models/responseModel");
const Form = require("../models/formModel");

exports.getFormAnalytics = async (req, res) => {
    try {
        const { formId } = req.params;

        // Fetch form details
        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ success: false, message: "Form not found" });
        }

        // Fetch responses for this form
        const responses = await Response.find({ formId });

        // Build analytics for each question
        const analytics = form.questions.map((q) => {
            const optionsCount = {};
            q.options.forEach((opt) => (optionsCount[opt] = 0));

            // Count responses per option
            responses.forEach((res) => {
                const ans = res.userAnswers.find(
                    (a) => a.questionId === q._id.toString()
                );
                if (ans && optionsCount.hasOwnProperty(ans.answer)) {
                    optionsCount[ans.answer]++;
                }
            });

            return {
                question: q.text,
                options: optionsCount,
            };
        });

        res.json({ success: true, formName: form.name, analytics });
    } catch (err) {
        console.error("Error fetching analytics:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
