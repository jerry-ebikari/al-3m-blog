const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        unique: true,
        min: 3
    },
    description: {
        type: String,
        required: true,
        min: 10,
    },
    readCount: {
        type: Number,
        default: 0
    },
    readingTime: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        default: []
    },
    body: {
        type: String,
        required: true
    },
    state: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED'],
        default: 'DRAFT'
    }
}, {timestamps: true})

module.exports = mongoose.model("Post", PostSchema)