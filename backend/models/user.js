'use strict';
const db = require('../api/util/database');

module.exports = class User {


    static getUserCredit(email, cb) {

        const vals = { 'email': email }
        const sql = "SELECT `downloadCredits` FROM `users` WHERE ? ";

        db.query(sql, vals).then(result => {
            // console.log('Resultat user: ', result[0][0].downloadCredits);
            cb({
                status: 200,
                credit: result[0][0].downloadCredits
            });
        }).catch(err => {
            console.log(err);
            cb({
                status: 500,
                message: 'Error getting user data!',
                error: err
            });
        });
    }

    static adjustUserCredit(email, credit, cb) {

        const vals = [credit, email];
        const sql = "UPDATE users SET `downloadCredits` = (`downloadCredits` - ?) WHERE email = ? ";

        db.query(sql, vals).then(result => {
            // console.log('Resultat user: ', result[0][0].downloadCredits);
            cb({
                status: 200,
                credit: result[0][0]
            });
        }).catch(err => {
            console.log(err);
            cb({
                status: 500,
                message: 'Error getting user data!',
                error: err
            });
        });
    }

    static registerDownloadClick(userid, cb) {

        // let sql = "UPDATE user_history SET no_downloadclick = no_downloadclick + 1 WHERE userid = " + userid;
        let sql = "INSERT INTO user_history (userid, no_downloadclick) VALUES (" + userid + ", 1)";
        db.execute(sql).then(result => {
            // console.log(result);
            cb({
                status: 201,
                message: 'Action recorded...',
            });
            // if (result[0].affectedRows === 0) {
            //     sql = "INSERT INTO user_history (userid, no_downloadclick) VALUES (" + userid + ", " + 1 + ")";
            //     db.execute(sql).catch(err => console.log(err));
            // }
        }).catch(err => {
            console.log(err);
            cb({
                status: 304,
                message: 'Error recording action!',
            });
        });

    }

    static getUserData(userdata, cb) {
        let sql = "SELECT firstname, lastname, email FROM `malezija`.`users` WHERE id = ?";
        // console.log(userdata);
        let vals = [userdata.userId];
        let role = '';
        if (userdata.isAdmin === 1) {
            role += 'Admin';
        }
        if (userdata.isSupport === 1) {
            if (role !== '') {
                role += ', Support';
            } else {
                role += 'Support'
            }
        }
        if (userdata.isContributor === 1) {
            if (role !== '') {
                role += ', Contributor';
            } else {
                role += 'Contributor'
            }
        }

        db.query(sql, vals).then(result => {
           
            cb({
                status: 200,
                data: result[0][0],
                role: role
            });
        }).catch(err => {
            console.log(err);
            cb({
                status: 500,
                message: 'Error getting user data!',
                error: err
            });
        });
    }
}