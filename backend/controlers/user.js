'use strict';
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../api/util/database');



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

