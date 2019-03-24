'use strict';
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../api/util/database');
const Graph = require('../models/graph');
const Category = require('../models/category');
const CustomerFile = require('../models/download');
const User = require('../models/user');
const Packet = require('../models/packet');
const Email = require('../models/email');


/** Get user profile data */
exports.getUserData = (req, res, next) => {
    // req.userData.email
    User.getUserData(req.userData, cb => {
        if (cb.status === 200) {
            res.status(200).json({
                data: cb.data,
                role: cb.role
            });
        } else {
            res.status(cb.status).json({
                message: cb.message,
                error: cb.error
            });
        }
    });
};

/** Get category from database */
exports.getGetCategory = (req, res, next) => {
    // TODO: Sanitize this
    // console.log('USER ID: ', req.userData.isAdmin);
    // if (req.userData.isAdmin != 1) {
    //     return res.status(401).json({
    //         message: 'Not Authorized!'
    //     });
    // }
    Category.fetchAll(req.query.filter, categories => {
        if (categories.status === 200) {
            res.status(200).json({
                message: categories.message,
                data: categories.data
            });
        } else {
            res.status(categories.status).json({
                message: categories.message,
                error: categories.error
            });
        }
    });
};

/** Get graph data from database */
exports.getGetGraph = (req, res, next) => {
    // TODO: Sanitize this
    Graph.getGraphData(req.query.filter, req.query.cat, req.userData.userId, req.query.recc, cb => {
        if (cb.status === 200) {
            res.status(200).json({
                status: cb.status,
                message: cb.message,
                byGender: cb.byGender,
                byAgeRange: cb.byAgeRange,
                byState: cb.byState,
                byRace: cb.byRace
            });
        } else {
            res.status(cb.status).json({
                status: cb.status,
                message: cb.message,
                error: cb.error
            });
        }
    });
};

exports.getGenerateFileForDownload = (req, res, next) => {
    // console.log(req.body);
    // console.log(req.userData);
    User.getUserCredit(req.userData.email, cb => {
        if (cb.status === 200) {

            CustomerFile.generateCustomerFile(cb.credit, req.body.filter, req.body.nor, req.body.cat, req.body.pid, req.userData.userId, cb => {
                if (cb.status === 201) {
                    // File is successfully generated, 
                    // reduce users credit
                    const fileName = cb.fileName;
                    const filePath = cb.filePath;
                    const cost = cb.cost;

                    User.adjustUserCredit(req.userData.email, cost, cb => {
                        if (cb.status === 200) {
                            console.log('User credit adjusted, continue with file');

                            res.setHeader('Content-Type', 'text/csv');
                            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
                            res.setHeader(
                                'Content-Disposition',
                                'attachment; filename="' + fileName + '"',
                            );
                            const file = fs.createReadStream(filePath);
                            file.pipe(res);
                        } else {
                            return res.status(cb.status).json({
                                message: cb.message,
                                error: cb.error
                            });
                        }
                    });

                    // res.status(201).json({
                    //     message: cb.message
                    // });
                } else {
                    return res.status(cb.status).json({
                        message: cb.message,
                        error: cb.error
                    });
                }
            });
        } else {
            return res.status(cb.status).json({
                message: 'Error reading user download credit',
                error: cb.error
            });
        }
    });
};

exports.getUserCredit = (req, res, next) => {
    // req.userData.email
    User.getUserCredit(req.userData.email, cb => {
        if (cb.status === 200) {
            res.status(200).json({
                credit: cb.credit
            });
        } else {
            res.status(cb.status).json({
                message: cb.message,
                error: cb.error
            });
        }
    });
};


/** Get Packets from database */
exports.getGetPacket = (req, res, next) => {
    // TODO: Sanitize this
    //if no admin
    // if (req.userData.isAdmin != 1) {
    //     return res.status(401).json({
    //         message: 'Not Authorized!'
    //     });
    // }
    Packet.fetchAll(cb => {
        if (cb.status === 200) {
            res.status(200).json({
                message: cb.message,
                data: cb.data,
                columns: cb.columns
            });
        } else {
            res.status(cb.status).json({
                message: cb.message,
                error: cb.error
            });
        }
    });
};


/** Get Email from database */
exports.getGetEmail = (req, res, next) => {
    Email.fetchAll(req.userData, cb => {
        if (cb.status === 200) {
            res.status(200).json({
                message: cb.message,
                data: cb.data,
                user: cb.user
            });
        } else {
            res.status(cb.status).json({
                message: cb.message,
                error: cb.error
            });
        }
    });
};

/** Send Email*/
exports.sendEmail = (req, res, next) => {
    Email.sendEmailMessage(req.body, req.userData.userId, cb => {
        res.status(cb.status).json({
            message: cb.message,
            error: cb.error
        });
    });
};

/** Set email as read */
exports.readEmail = (req, res, next) => {
    Email.read(req.params.id, cb => {
        if (cb.status === 201) {
            res.status(201).json();
        } else {
            res.status(cb.status).json({
                message: cb.message,
                error: cb.error
            });
        }
    });
};

/** Get UnreadEmails from database */
exports.getUnreadEmail = (req, res, next) => {
    Email.getUnreadEMails(req.userData, cb => {
        if (cb.status === 200) {
            res.status(200).json({
                data: cb.data
            });
        } else {
            res.status(cb.status).json({
                message: cb.message,
                error: cb.error
            });
        }
    });
};

/** DELETE Packet */
exports.deleteEmail = (req, res, next) => {
    Email.delete(req.userData, req.params.id, cb => {
        if (cb.status === 200) {
            res.status(200).json({
                message: cb.message
            });
        } else {
            res.status(cb.status).json({
                message: cb.message,
                error: cb.error
            });
        }
    });
};

/** Patch user download click (record) */
exports.getDlClick = (req, res, next) => {
    User.registerDownloadClick(req.userData.userId, cb => {
        if (cb.status === 201) {
            res.status(201).json({
                message: cb.message
            });
        } else {
            res.status(cb.status).json({
                message: cb.message
            });
        }
    });
};

/** Send Email to reset user pass */
exports.resetPassword = (req, res, next) => {
    console.log(req.body.email);
    console.log(req.body.token);
    // console.log(req.body.password);

    if (req.body.token) {
        // set new password
        let vals = [];
        vals.push(req.body.token);
        // SELECT id, count(*) as user, passwordResetExpires, now() as now FROM `users` 
        // WHERE passwordResetToken = '24a2befb858e231a5d6fbe71c5da8b45b56ef4b0d9a16c0624e0834ea6194692' 
        // AND passwordResetExpires > now()
        let sql = "SELECT id, count(*) as user FROM `users` "; 
        sql += "WHERE passwordResetToken = ? ";
        sql += "AND passwordResetExpires > now()"
        // check for token expiration
        db.execute(sql, vals)
            .then(result => {
                // console.log(result[0][0]);
                if (result[0][0].user !== 0) {
                    const userid = result[0][0].id;
                    const newpass = req.body.password;
                    bcrypt.hash(newpass, 10)
                        .then(hash => {
                            sql = "UPDATE `users` SET password = '" + hash + "' WHERE id = " + userid;
                            db.execute(sql)
                                .then(result => {
                                    console.log('Password has been reset successfully!');
                                    return result;
                                })
                                .catch(err => {
                                    console.log(err);
                                    return res.status(500).json({
                                        message: 'Error processing password!'
                                    });
                                });
                        })
                        .catch(err => {
                            console.log(err);
                            return res.status(500).json({
                                message: 'Error creating password hash!'
                            });
                        });

                } else {
                    return res.status(401).json({
                        message: 'Invalid or expired token!'
                    });
                }
                res.status(200).json({
                    message: 'Password has been reset successfully!'
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: 'Failed to reset password. Invalid or expired token!'
                });
            });

    } else {
        // no token, then send email
        if (!req.body.email) {
            return res.status(400).json({
                message: 'Bad request!'
            });
        }
        let vals = [];
        vals.push(req.body.email);

        let sql = "SELECT count(*) as user FROM `users` WHERE email = ?";

        db.execute(sql, vals)
            .then(result => {
                // console.log('Result', result[0][0].user);
                if (result[0][0].user !== 0) {
                    // console.log('Imamo usera, send mail');
                    const api_key = process.env.MAIL_API_KEY;
                    const domain = process.env.MAIL_DOMAIN;
                    const mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

                    crypto.randomBytes(32, (err, buffer) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                message: 'Error generating security token!'
                            });
                        }
                        const token = buffer.toString('hex');
                        sql = "UPDATE users SET passwordResetToken = '" + token + "', passwordResetExpires = DATE_ADD(now(), INTERVAL 1 HOUR) ";
                        sql += "WHERE email = ?"
                        db.execute(sql, vals)
                            .then(result => {
                                return result;
                            })
                            .then(result => {
                                /** Sending mail */
                                const maildata = {
                                    from: 'Target Marketing Tools <noreply@mg.afternut.com>',
                                    to: req.body.email,
                                    subject: 'Reset Password',
                                    // text: 'Someone recently requested to reset your account password for "afternut.com"',
                                    html: `
                                    <p>Someone recently requested to reset your account password for "afternut.com"</p>
                                    <p>Just click the link below or copy and paste the address in your browser to reset.</p>
                                    <p>On the website, you\'ll be able to enter and confirm your new password.</p>
                                    <p>Reset link: <a href="http://afternut.com/#/newpassword?rst=${token}">http://afternut.com/#/newpassword?rst=${token}</a></p>
                                    <p>This link is valid for 1 hour</p>
                                `
                                };
                                // <p>Reset link: <a href="http://localhost:8000/api/user/resetpassword/${token}">http://localhost/${token}</a></p> 
                                // console.log(maildata.html);

                                mailgun.messages().send(maildata, function (error, body) {
                                    console.log(body);
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    message: 'Failed to write token data!'
                                });
                            });
                    });
                } else {
                    res.status(404).json({
                        message: 'There is no account with this email in our database!'
                    });
                }
                res.status(200).json({
                    message: 'Mail send successfully!'
                });
            })
            .catch(err => {
                console.log(err)
            });
    }
}

