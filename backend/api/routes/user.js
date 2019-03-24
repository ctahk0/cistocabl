'use strict'
const express = require('express');
const checkAuth = require('../../middleware/check-auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../util/database');
const router = express.Router();

const userController = require('../../controlers/user');
const fileWorker = require('../../controlers/file');


/** Fetch user profile data */
router.get('/profile', checkAuth, userController.getUserData);

/** Fetch graph data from database */
router.get('/graphdata', checkAuth, userController.getGetGraph);

/** Fetch category */
router.get('/category', checkAuth, userController.getGetCategory);

/** Generate file for download */
router.post('/generate', checkAuth, userController.getGenerateFileForDownload);

/** Generate get user credit */
router.get('/usercredit', checkAuth, userController.getUserCredit);

/** List and download files */
router.get('/file/all', checkAuth, fileWorker.listUrlFiles);

router.get('/file/:filename', checkAuth, fileWorker.downloadFile);

/** Fetch packets from database */
router.get('/packet', checkAuth, userController.getGetPacket);

/** Fetch emails from database */
router.get('/email', checkAuth, userController.getGetEmail);

/** Get unread emails */
router.get('/emails', checkAuth, userController.getUnreadEmail);

/** Send email */
router.post('/email', checkAuth, userController.sendEmail);

/** Delete email */
router.delete('/email/:id', checkAuth, userController.deleteEmail);

/** Read email */
router.patch('/email/:id', checkAuth, userController.readEmail);

/** Register users download click */
router.get('/dlclick', checkAuth, userController.getDlClick);

/** Reset password - send email */
router.post('/resetpassword', userController.resetPassword);

/** User Signup */
router.post('/signup', (req, res, next) => {
    // console.log(req.body.email, req.body.password, req.body.firstname, req.body.lastname, req.body.contributor);
    let contributor = 0;
    req.body.contributor ? contributor = 1 : contributor = 0;
    bcrypt.hash(req.body.password, 10).then(hash => {
        let sql = "INSERT INTO `users` (`email`, `password`, `firstname`, `lastname`, `appliedforcontributor`) ";
        sql += "VALUES ( '" + req.body['email'] + "', ";
        sql += "'" + hash + "', ";
        sql += "'" + req.body['firstname'] + "', ";
        sql += "'" + req.body['lastname'] + "', ";
        sql += "'" + contributor + "')";

        db.execute(sql)
            .then(result => {
                // console.log('New user---------------------------------------------------------------');
                // console.log('New user created', result);
                const newuserid = result[0].insertId;
                // send message to support about new user if he applied for contributor account
                if (contributor === 1) {
                    sql = "SELECT id FROM users WHERE username = 'support'";
                    db.execute(sql).then(result => {
                        let ids = result[0][0].id;
                        sql = "INSERT INTO messages (mfrom, mto, subject, message, messagedate) VALUES (?, ?, ?, ?, CURDATE())";
                        const vals = [newuserid, ids, 'New user - Applied for Contributor', 'New user is registered and want to be a Contributor'];
                        db.query(sql, vals).then(result => {
                            console.log('Email to support is sent!');
                        }).catch(err => {
                            console.log(err);
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                }
                res.status(201).json({
                    message: 'User created successfully!'
                });
            })
            .catch(err => {
                res.status(409).json({
                    message: 'There is already a user with this email address. Please log in!'
                });
                console.log(err)
            });
    });
});

/** User login */
router.post('/login', (req, res, next) => {
    // console.log(req.body.email, req.body.password, req.body.firstname, req.body.lastname);
    // try to 'ping' connection before login

    let sql = "SELECT * FROM `users` WHERE `email` = '" + req.body['email'] + "'";
    // db.ping();
    db.execute(sql)
        .then(result => {
            if (result[0][0] == null) {
                return res.status(404).json({
                    message: 'There is no user registered with that email address!'
                });
            }
            console.log('Is blocked user?', result[0][0]['blocked']);
            if (result[0][0]['blocked'] !== 0) {
                return res.status(403).json({
                    message: 'The user account is currently disabled, please contact support!'
                });
            }
            let pass = result[0][0]['password'].toString('utf8');
            bcrypt.compare(req.body.password, pass)
                .then(match => {
                    if (!match) {
                        return res.status(401).json({
                            message: 'Authentication failed!'
                        });
                    }
                    const token = jwt.sign({
                        rauth: result[0][0]['isSuperAdmin'],
                        cauth: result[0][0]['isContributor'],
                        sauth: result[0][0]['isSupport'],
                        iauth: result[0][0]['id'],
                        email: result[0][0]['email']
                    },
                        process.env.PUBLIC_KEY,
                        { expiresIn: '2h' }
                    );
                    // console.log('Admin: ', result[0]['isAdmin']);
                    const ctime = new Date();
                    // check if no user history, create one record
                    // sql = "UPDATE user_history SET lastlogin = now() WHERE userid = " + result[0][0]['id'];
                    // db.execute(sql).then(data => {
                    //     if (data[0].affectedRows === 0) {
                    sql = "INSERT INTO user_history (userid, lastlogin) VALUES (" + result[0][0]['id'] + ", now() )";
                    db.execute(sql).then(result => { }).catch(err => console.log(err));
                    //    }
                    // }).catch(err => console.log(err));
                    console.log('-- User login -- ', result[0][0]['email'], + ' ' + ctime.toString());
                    // set expire token in 2 hour (7200 seconds)
                    res.status(200).json({
                        token: token,
                        expiresIn: 7200
                    });
                }).catch(err => {
                    res.status(401).json({
                        message: err
                    });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: err
            });
        });
});

module.exports = router;