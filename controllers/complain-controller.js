const Complain = require('../models/complainSchema.js');

const complainCreate = async (req, res) => {
    try {
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
                model: 'Student',
                select: 'name rollNum'
            })
            .lean();
        
        console.log('Raw complains:', complains); // Debug log
        
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