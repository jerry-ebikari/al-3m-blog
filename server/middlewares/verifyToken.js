const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    if (!req.headers.authorization) return res.status(401).json({ message: "No token" })

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        const token = req.headers.authorization.split(" ")[1]
        jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
            if (err) return res.status(401).json({ message: "Invalid or expired token" })
            else {
                req.user = data
                next()
            }
        })
    }
}

const getLoggedInUser = (req, res, next) => {
    if (!req.headers.authorization) next()

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        const token = req.headers.authorization.split(" ")[1]
        jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
            if (err) next()
            else {
                req.userId = data.id
                next()
            }
        })
    }
}

module.exports = {verifyToken, getLoggedInUser}