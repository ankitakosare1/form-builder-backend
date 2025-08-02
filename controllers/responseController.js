const Response = require("../models/responseModel");
const Form = require("../models/formModel");

exports.submitResponse = async (req, res) => {
    try {
        const { formId, userAnswers, currentPageId } = req.body;
        console.log(" Incoming Request:", { formId, currentPageId, userAnswers });

        const form = await Form.findById(formId);
        if (!form) return res.status(404).json({ error: "Form not found" });

        console.log(" Form Loaded:", form._id);

        // Save user response
        await Response.create({
            formId,
            userAnswers,
            submittedAt: new Date()
        });

        // Check for page-level condition
        const condition = form.pageConditions?.[String(currentPageId)];
        if (condition) {
            const condAnswer = userAnswers.find(
                (a) => String(a.questionId) === String(condition.questionId)
            );
            const userAnswerValue = condAnswer
                ? (Array.isArray(condAnswer.answer) ? condAnswer.answer[0] : condAnswer.answer)
                : null;

            console.log("Condition Found:", condition, "User Answer:", userAnswerValue);

            // Type-safe string comparison
            if (String(userAnswerValue).trim() === String(condition.expectedAnswer).trim()) {
                console.log(" Redirecting to TRUE page:", condition.truePage);
                return res.json({ success: true, redirectPage: String(condition.truePage) });
            } else {
                console.log("Redirecting to FALSE page:", condition.falsePage);
                return res.json({ success: true, redirectPage: String(condition.falsePage) });
            }
        }

        // Page-Specific Validation (only for currentPage questions)
        let isValidated = true;
        const currentPage = form.pages.find(p => String(p.pageId) === String(currentPageId));
        if (currentPage && currentPage.questions.length > 0) {
            for (const q of currentPage.questions) {
                const correctAnswerObj = form.correctAnswers?.find(
                    (ca) => String(ca.questionId) === String(q.id)
                );

                if (correctAnswerObj) {
                    const userAns = userAnswers.find(
                        (ua) => String(ua.questionId) === String(q.id)
                    );

                    if (!userAns) {
                        isValidated = false;
                        break;
                    }

                    if (Array.isArray(correctAnswerObj.answer)) {
                        const correctSet = new Set(correctAnswerObj.answer.map(String));
                        const userSet = new Set((userAns.answer || []).map(String));
                        if (
                            correctSet.size !== userSet.size ||
                            ![...correctSet].every((a) => userSet.has(a))
                        ) {
                            isValidated = false;
                            break;
                        }
                    } else {
                        if (
                            String(userAns.answer || "").trim() !==
                            String(correctAnswerObj.answer || "").trim()
                        ) {
                            isValidated = false;
                            break;
                        }
                    }
                }
            }
        }

        console.log(` Validation Result: ${isValidated}`);

        // Return success (Frontend handles Thank You if no redirectPage is given)
        return res.json({
            success: true,
            isValidated
        });
    } catch (err) {
        console.error(" Server Error in submitResponse:", err);
        res.status(500).json({ error: "Failed to submit response", details: err.message });
    }
};



