
const Complain = require('../models/complainSchema.js');

const complainCreate = async (req, res) => {
    try {
        const { userType, user } = req.body;
        let UserModel;
        
        switch(userType) {
            case 'Student':
                UserModel = require('../models/studentSchema');
                break;
            case 'Teacher':
                UserModel = require('../models/teacherSchema');
                break;
            case 'Parent':
                UserModel = require('../models/parentSchema');
                break;
            default:
                return res.status(400).json({ message: "Invalid user type" });
        }

        const userExists = await UserModel.findById(user);
        if (!userExists) {
            return res.status(400).json({ message: `${userType} not found` });
        }
        
        const complain = new Complain(req.body)
        const result = await complain.save()
        res.send(result)
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const complainList = async (req, res) => {
    try {
        let complains = await Complain.find({ school: req.params.id })
            .populate({
                path: 'user',
                refPath: 'userType',
                select: 'name email rollNum'
            })
            .lean();
        
        console.log('Raw complains:', complains);
        
        if (complains.length > 0) {
            res.send(complains)
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        console.error('Populate error:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { complainCreate, complainList };
