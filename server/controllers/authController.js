const authController = require('express').Router()
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const validateInput = require('../helpers/validator')

authController.post('/register', async (req, res) => {
    try {
        const missingFields = validateInput(req.body, ["email", "password", "firstName", "lastName"])
        if (missingFields) {
            return res.status(400).json({ message: missingFields })
        }
        const userExists = await User.findOne({ email: req.body.email })
        if (userExists) {
            return res.status(409).json({ message: "Email is already in use." })
        }

        if (!req.body.password || req.body.password.length < 6) {
            return res.status(400).json({ message: "Password must contain at least 6 characters." })
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newUser = await User.create({ ...req.body, password: hashedPassword })

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        const { password, ...otherProps } = newUser._doc;
        return res.status(201).json({ user: otherProps, token })
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong"});
    }
})

authController.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const passwordMatched = await bcrypt.compare(req.body.password, user.password)
        if (!passwordMatched) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

        const { password, ...others } = user._doc
        return res.status(200).json({ user: others, token })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Something went wrong"});
    }
})

module.exports = authController