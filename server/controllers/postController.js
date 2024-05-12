const postController = require("express").Router()
const Post = require("../models/Post")
const User = require("../models/User"); 
const {verifyToken, getLoggedInUser} = require('../middlewares/verifyToken')
const validateInput = require("../helpers/validator")
const estimateReadingTime = require("../helpers/readingTime")

postController.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    try {
        // Searching
        let query = { state: "PUBLISHED" };
        const searchableFieldMap = { title: 1 }
        const otherQueries = []
        Object.keys(req.query).forEach(key => {
            if (searchableFieldMap[key]) {
                otherQueries.push({[key]: { $regex: new RegExp(req.query[key], 'i') }})
            }
        })

        if (req.query.author) {
            // Find users whose firstName or lastName matches the search term
            const users = await User.find({
                $or: [
                    { firstName: { $regex: new RegExp(req.query.author, 'i') } },
                    { lastName: { $regex: new RegExp(req.query.author, 'i') } }
                ]
            });

            // Extract author IDs from found users
            const authorIds = users.map(user => user._id);
            otherQueries.push({
                author: { $in: authorIds }
            })
        }

        if (req.query.tags) {
            otherQueries.push({tags: req.query.tags})
        }

        if (otherQueries.length) {
            query["$or"] = otherQueries
        }

        const totalPosts = await Post.countDocuments(query);
        const queryToExecute = Post.find(query)
            .populate("author", '-password')
            .skip((page - 1) * limit)
            .limit(limit);

        // Sorting
        const sortCriteria = req.query.sortBy;
        const sortOrder = req.query.sortOrder;
        if (sortCriteria) {
            if (['readCount', 'readingTime', 'createdAt', 'updatedAt'].includes(sortCriteria)) {
                queryToExecute = queryToExecute.sort({ [sortCriteria]: sortOrder === "asc" ? 1 : -1 });
            }
        }

        const posts = await queryToExecute;

        return res.status(200).json({ data: posts, page, limit, totalItems: totalPosts })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

postController.get('/for/user', verifyToken, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    try {
        // Searching
        let query = { author: req.user.id};
        if (req.query.state) {
            query.state = req.query.state
        }
        const searchableFieldMap = { title: 1 }
        const otherQueries = []
        Object.keys(req.query).forEach(key => {
            if (searchableFieldMap[key]) {
                otherQueries.push({[key]: { $regex: new RegExp(req.query[key], 'i') }})
            }
        })

        if (req.query.tags) {
            otherQueries.push({tags: req.query.tags})
        }

        if (otherQueries.length) {
            query["$or"] = otherQueries
        }

        const totalPosts = await Post.countDocuments(query);
        let queryToExecute = Post.find(query)
            .populate("author", '-password')
            .skip((page - 1) * limit)
            .limit(limit);

        // Sorting
        const sortCriteria = req.query.sortBy;
        const sortOrder = req.query.sortOrder;
        if (sortCriteria) {
            if (['readCount', 'readingTime', 'createdAt', 'updatedAt'].includes(sortCriteria)) {
                queryToExecute = queryToExecute.sort({ [sortCriteria]: sortOrder === "asc" ? 1 : -1 });
            }
        }

        const posts = await queryToExecute;

        return res.status(200).json({ data: posts, page, limit, totalItems: totalPosts })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

postController.get('/:id', getLoggedInUser, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", '-password');
        if (!req.userId) {
            if (post.state === "DRAFT") {
                return res.status(404).json({ message: "Post not found" });
            }
            post.readCount += 1
            await post.save()
        } else {
            if (post.author._id != req.userId.toString()) {
                if (post.state === "DRAFT") {
                    return res.status(404).json({ message: "Post not found" });
                }
                post.readCount += 1
                await post.save()
            }
        }
        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json(error)
    }
})

postController.post('/', verifyToken, async (req, res) => {
    try {
        const missingFields = validateInput(req.body, ["title", "description", "body"])
        if (missingFields) {
            return res.status(400).json({ message: missingFields })
        }
        const readingTime = estimateReadingTime(req.body.body);
        const post = await Post.create({ ...req.body, readingTime, author: req.user.id });
        return res.status(201).json(post);
    } catch (error) {
        console.log(error)
        if (error.code === 11000) {
            res.status(409).json({ message: 'A post with this title already exists' });
        }
        return res.status(500).json({ message: "Something went wrong" });
    }
})

postController.put("/:id", verifyToken, async (req, res) => {
    try {
        const missingFields = validateInput(req.body, ["title", "description", "body"])
        if (missingFields) {
            return res.status(400).json({ message: missingFields })
        }
        const post = await Post.findById(req.params.id)
        if (post.author.toString() !== req.user.id.toString()) {
            return res.status(401).json({ message: "You can update only your own posts" })
        }

        const updateDto = { ...req.body, readingTime: estimateReadingTime(req.body.body) }

        const updatedPost = await Post
            .findByIdAndUpdate(req.params.id, { $set: updateDto }, { new: true })
            .populate('author', '-password')

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        return res.status(200).json(updatedPost)
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

postController.delete('/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.author.toString() !== req.user.id.toString()) {
            return res.status(401).json({ message: "You can only delete your own posts" })
        }

        await Post.findByIdAndDelete(req.params.id)

        return res.status(200).json({ message: "Post deleted" })
    } catch (error) {
        return res.status(500).json(error)
    }
})

module.exports = postController