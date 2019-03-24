'use strict'
const db = require('../api/util/database');

module.exports = class Email {

    static fetchAll(user, cb) {

        let sql = '';
        console.log('Email --------------------------------------------------------------------');
        console.log(user);
        console.log('Email --------------------------------------------------------------------');
        if (user.isSupport === 1) {
            sql = "SELECT * FROM `messages_view` WHERE ((eto = 'support' OR efrom = 'support') OR (mto = " + user.userId + " OR mfrom = " + user.userId + ")) AND archived_support = 0";
        } else {
            sql = "SELECT * FROM `messages_view` WHERE (mto = " + user.userId + " OR mfrom = " + user.userId + ") AND archived_user = 0";
        }
        console.log(sql);
        db.execute(sql).then(result => {
            cb({
                status: 200,
                message: 'Messages fetched successfully',
                data: result[0],
                user: user.userId
            });
        }).catch(err => {
            console.log(err);
            cb({
                status: 404,
                message: 'Error reading messages from database',
                error: err
            });
        });
    }

    static sendEmailMessage(emailMessage, userId, cb) {
        // console.log(emailMessage);

        let sql = '';
        let vals = [];

        if (emailMessage.to === 'support') {
            // console.log('Message to admin');
            sql = "SELECT id FROM users WHERE username = 'support'";
            db.execute(sql).then(result => {
                let ids = result[0][0].id;
                // console.log('We have support id?', ids);

                sql = "INSERT INTO messages (mfrom, mto, subject, message, messagedate) VALUES (?, ?, ?, ?, CURDATE())";
                vals = [userId, ids, emailMessage.subject, emailMessage.message];
                db.query(sql, vals).then(result => {
                    console.log('mail is sent!');
                }).catch(err => {
                    console.log(err);
                    cb({
                        status: 500,
                        message: 'Error sending message!',
                        error: err
                    });
                    return;
                });
            }).catch(err => {
                console.log(err);
                cb({
                    status: 500,
                    message: 'Error no support user found!',
                    error: err
                });
                return;
            });
        } else {
            sql = "SELECT id FROM users WHERE username = 'support'";
            db.execute(sql).then(result => {
                let ids = result[0][0].id;
                // console.log('We have support id?', ids);
                // need user id from email

                sql = "SELECT id FROM users WHERE email = ? ";
                vals = [emailMessage.to];
                // console.log('Saljemo email na adresu', emailMessage.to);
                db.query(sql, vals).then(result => {
                    console.log('-----------------------------------------------------');
                    console.log(result[0][0].id);
                    console.log('-----------------------------------------------------');
                    let id = result[0][0].id;
                    // console.log('Imamo id na osnovu email adrese!', id);
                    vals = [ids, id, emailMessage.subject, emailMessage.message];
                    sql = "INSERT INTO messages (mfrom, mto, subject, message, messagedate) VALUES (?, ?, ?, ?, CURDATE())";

                    db.query(sql, vals).then(result => {
                    }).catch(err => {
                        console.log(err);
                        cb({
                            status: 500,
                            message: 'Error sending message!',
                            error: err
                        });
                        return;
                    });
                }).catch(err => {
                    console.log(err);
                    cb({
                        status: 500,
                        message: 'Error sending message!',
                        error: err
                    });
                    return;
                });
            }).catch(err => {
                console.log(err);
                cb({
                    status: 500,
                    message: 'Error no support user found!',
                    error: err
                });
                return;
            });
        }
        cb({
            status: 201,
            message: 'Message sent successfully!'
        });
    }

    static read(id, cb) {
        // console.log(id);
        let sql = "UPDATE `messages` SET isread = 1 WHERE messageid = ?";
        let vals = [id];
        db.query(sql, vals).then(result => {
            cb({ status: 201 });
        }).catch(err => {
            console.log(err);
            cb({ status: 500, message: 'There was an error communicating with the server.' });
        });
    }

    static delete(user, id, cb) {
        let sql = '';
        if (user.isSupport === 1) {
            sql = "UPDATE `messages` SET archived_support = 1 WHERE `messages`.`messageid` = " + id + ";";
        } else {
            sql = "UPDATE `messages` SET archived_user = 1  WHERE `messages`.`messageid` = " + id + ";";
        }

        // console.log(sql);
        db.execute(sql).then(result => {
            cb({
                status: 200,
                message: 'Message archived successfully'
            });
        }).catch(err => {
            console.log(err);
            cb({
                status: 500,
                message: 'Error deleting message',
                error: err
            });
        });
    }


    static getUnreadEMails(user, cb) {

        let sql = '';
        if (user.isSupport === 1) {
            sql = "SELECT count(*) as total FROM `messages_view` WHERE ((eto = 'support') OR (mto = " + user.userId + ")) AND archived_support = 0 AND isread = 0";
        } else {
            sql = "SELECT count(*) as total FROM `messages_view` WHERE (mto = " + user.userId + ") AND archived_user = 0 AND isread = 0";
        }
        console.log(sql);
        db.execute(sql).then(result => {
            console.log(result[0]);
            cb({
                status: 200,
                message: 'Messages fetched successfully',
                data: result[0],
                user: user.userId
            });
        }).catch(err => {
            console.log(err);
            cb({
                status: 404,
                message: 'Error reading messages from database',
                error: err
            });
        });
    }
};



