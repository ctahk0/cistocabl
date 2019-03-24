'use strict';
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decToken = jwt.verify(token, process.env.PUBLIC_KEY);
        //rauth: result[0][0]['isAdmin'], iauth: result[0][0]
        req.userData = { isAdmin: decToken.rauth, isContributor: decToken.cauth, isSupport: decToken.sauth, userId: decToken.iauth, email: decToken.email };
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Authorization failed!" })
    }

};