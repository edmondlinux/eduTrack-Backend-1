const bcrypt = require('bcrypt');
const Parent = require('../models/parentSchema.js');
const Student = require('../models/studentSchema');
const Admin = require('../models/adminSchema');

const parentRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const parent = new Parent({
            ...req.body,
            password: hashedPass,
            school: req.body.adminID
        });

        let result = await parent.save();
        result.password = undefined;
        res.send({ message: "Parent registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message || "An error occurred while processing your request" });
    }
};

const parentLogin = async (req, res) => {
    try {
        let parent = await Parent.findOne({ email: req.body.email })
            .populate('school', 'schoolName',  'email');

        if (parent) {
            const validated = await bcrypt.compare(req.body.password, parent.password);
            if (validated) {
                parent.password = undefined;
                res.send({ role: "Parent", ...parent._doc });
            } else {
                res.status(401).send({ message: "Invalid password" });
            }
        } else {
            res.status(404).send({ message: "Parent not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message || "An error occurred while processing your request" });
    }
};

const getParents = async (req, res) => {
    try {
        let parents = await Parent.find({ school: req.params.adminId })
            .populate({
                path: 'students',
                select: 'name rollNum sclassName'
            });
        res.send(parents);
    } catch (err) {
        res.status(500).json({ message: err.message || "An error occurred while processing your request" });
    }
};

const getParentDetail = async (req, res) => {
    try {
        let parent = await Parent.findById(req.params.parentId)
            .populate('school', 'schoolName')
            .populate({
                path: 'students',
                select: 'name rollNum sclassName attendance examResult',
                populate: {
                    path: 'sclassName',
                    select: 'sclassName'
                }
            });
        if (parent) {
            parent.password = undefined;
            res.send(parent);
        } else {
            res.status(404).send({ message: "Parent not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message || "An error occurred while processing your request" });
    }
};

const updateParent = async (req, res) => {
    try {
        const parent = await Parent.findById(req.params.parentId);
        if (!parent) {
            return res.status(404).send({ message: "Parent not found" });
        }

        if (req.body.currentPassword && req.body.newPassword) {
            const validated = await bcrypt.compare(req.body.currentPassword, parent.password);
            if (!validated) {
                return res.status(401).send({ message: "Current password is incorrect" });
            }
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.newPassword, salt);
        }

        const result = await Parent.findByIdAndUpdate(
            req.params.parentId,
            { $set: req.body },
            { new: true }
        );
        res.send({ message: "Parent updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message || "An error occurred while processing your request" });
    }
};

const deleteParent = async (req, res) => {
    try {
        await Parent.findByIdAndDelete(req.params.parentId);
        res.send({ message: "Parent deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message || "An error occurred while processing your request" });
    }
};

const getParentStudents = async (req, res) => {
    try {
        const parent = await Parent.findById(req.params.parentId)
            .populate({
                path: 'students',
                select: 'name rollNum sclassName attendance'
            });
        if (!parent) {
            return res.status(404).send({ message: "Parent not found" });
        }
        res.send(parent.students);
    } catch (err) {
        res.status(500).json({ message: err.message || "An error occurred while processing your request" });
    }
};

module.exports = {
    parentRegister,
    parentLogin,
    getParents,
    getParentDetail,
    updateParent,
    deleteParent,
    getParentStudents
};