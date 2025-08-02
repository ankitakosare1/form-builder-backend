const Project = require("../models/projectModel");
const Form = require("../models/formModel");

exports.createProject = async (req, res) => {
    try {
        const { projectName, formName } = req.body;

        // Create Project
        const project = await Project.create({
            name: projectName,
            userId: req.user,
        });

        // Create Initial Form Linked to Project
        const form = await Form.create({
            name: formName || `Form_${Math.random().toString(36).substring(2, 8)}`, // dummy name if empty
            userId: req.user,
            projectId: project._id,
            status: "draft",
        });

        // Link Form to Project
        project.forms.push(form._id);
        await project.save();

        res.status(201).json({
            success: true,
            project,
            form,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create project with form" });
    }
};

exports.getProjects = async (req, res) => {
    try {
        // Fetch projects of the logged-in user & populate forms
        const projects = await Project.find({ userId: req.user })
            .populate({
                path: "forms",
                select: "name status createdAt updatedAt" // fetch only needed fields
            })
            .sort({ createdAt: -1 }); // latest first

        res.status(200).json({
            success: true,
            projects,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
};

exports.checkProjectExists = async (req, res) => {
    try {
        const { projectName } = req.body;
        const project = await Project.findOne({ name: projectName, userId: req.user });

        if (!project) {
            return res.json({ exists: false });
        }

        return res.json({ exists: true, projectId: project._id });
    } catch (err) {
        res.status(500).json({ error: "Error checking project" });
    }
};

exports.getProjectForms = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Fetch project and its linked forms
        const project = await Project.findById(projectId)
            .populate({
                path: "forms",
                select: "name status updatedAt createdAt"
            });

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        res.status(200).json({
            success: true,
            projectName: project.name,
            forms: project.forms,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch project forms" });
    }
};



