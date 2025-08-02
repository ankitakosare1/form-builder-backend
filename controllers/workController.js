const Form = require("../models/formModel");
const Project = require("../models/projectModel");

const removeDuplicateByName = (items) => {
    const unique = {};
    return items.filter((item) => {
        if (!unique[item.name]) {
            unique[item.name] = true;
            return true;
        }
        return false;
    });
};

const getRecentWorks = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch user's forms and projects
        const forms = await Form.find({ userId }).sort({ updatedAt: -1 });
        const projects = await Project.find({ owner: userId }).sort({ updatedAt: -1 });

        // Sort forms: drafts first, then published
        const draftForms = forms.filter(f => f.status === "draft");
        const publishedForms = forms.filter(f => f.status === "published");

        // Combine: drafts first, then published forms, then projects
        const recentWorks = [...draftForms, ...publishedForms, ...projects];

        res.status(200).json({ success: true, recentWorks });
    } catch (err) {
        console.error("Error fetching recent works:", err);
        res.status(500).json({ success: false, message: "Failed to fetch recent works" });
    }
};

const getSharedWorks = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const sharedForms = await Form.find({
            $or: [
                { "responders.email": userEmail }, // Case 1: Object format
                { responders: userEmail }          // Case 2: Direct email strings
            ]
        }).sort({ updatedAt: -1 });

        const sharedProjects = await Project.find({
            $or: [
                { "responders.email": userEmail },
                { responders: userEmail }
            ]
        }).sort({ updatedAt: -1 });


        //Remove duplicate project names in shared works
        const uniqueSharedProjects = removeDuplicateByName(sharedProjects);

        res.status(200).json({
            success: true,
            sharedWorks: [...sharedForms, ...uniqueSharedProjects],
        });
    } catch (err) {
        console.error("Error fetching shared works:", err);
        res.status(500).json({ success: false, message: "Failed to fetch shared works" });
    }
};

module.exports = { getRecentWorks, getSharedWorks };

