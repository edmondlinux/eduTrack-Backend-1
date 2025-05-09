
const mongoose = require('mongoose');

const complainSchema = new mongoose.Schema({
    userType: {
        type: String,
        enum: ['Student', 'Teacher', 'Parent'],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userType',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    complaint: {
        type: String,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    }
});

module.exports = mongoose.model("Complain", complainSchema);
