'use strict'
const express = require('express');
const router = express.Router();
const checkAuth = require('../../middleware/check-auth');
const multer = require('multer');

const db = require('../util/database');
const adminController = require('../../controlers/admin');
const fileWorker = require('../../controlers/file');

/** Multer upload destination setup */
const DIR = './uploads';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return cb(new Error('Wrong extension type'));
        }
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

/** Generate admin file for download */
router.post('/generate', checkAuth, adminController.getGenerateAdminFileForDownload);

/** Upload file (second approach) */
router.post('/file/upload', checkAuth, upload.single("file"), fileWorker.uploadFile);

/** Add new category */
router.post('/category', checkAuth, adminController.postNewCategory);

/** Edit category */
router.patch('/category', checkAuth, adminController.editCategory);

/** Delete packet */
router.delete('/category/:id', checkAuth, adminController.deleteCategory);

/** Add new packet */
router.post('/packet', checkAuth, adminController.postNewPacket);

/** Delete packet */
router.delete('/packet/:id', checkAuth, adminController.deletePacket);

/** Fetch members from database */
router.get('/members', checkAuth, adminController.getGetMembers);

router.post('/members', checkAuth, adminController.updateAddMember);

// delete
router.delete('/members/:id', checkAuth, (req, res, next) => {
    //if no admin
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }
    let sql = "DELETE FROM `members` WHERE `members`.`ID` = " + req.params.id + ";";
    db.execute(sql).then(result => {
        res.status(200).json({
            message: 'Member deleted successfully'
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'There was an error deleting member data',
            error: err
        });
    });
});


/** Featch registered users from database */
router.get('/regusers', checkAuth, (req, res, next) => {
    //if no admin
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }
    // TODO: Sanitize this
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.pageIndex;
    let limit = currentPage * pageSize;
    let filter = req.query.filter;
    let length = 0;
    let where = '';
    let userid;

    console.log('ima li id?', req.query.userid);
    if (req.query.userid) {
        userid = req.query.userid;
        console.log('userid', userid);
    }

    let columns = [];
    if (userid) {
        console.log('history', userid);
        columns = [
            'lastlogin',
            'updatedAt'
        ];

    } else {
        console.log('no history', userid);
        columns = [
            'email',
            'firstname',
            'lastname'
        ];
    }

    if (filter) {
        filter = "'%" + filter + "%'";
        where = " WHERE ";
        columns.forEach(el => {
            where += "`" + el + "`" + " LIKE " + filter + " OR ";
        });
        where = where.slice(0, -4);  // remove last OR
        if (userid && userid !== '0') {
            where += " AND userid = " + userid;
        }

    } else {
        if (userid && userid !== '0') {
            where = " WHERE userid = " + userid;
        }
    }

    let sql = "";
    if (userid) {
        sql += "SELECT COUNT(*) AS totalRows FROM "; 
        sql += "(SELECT userid FROM ";
        sql += "`user_history`" + where + " group by userid) as t";

        // sql = "SELECT COUNT(*) AS totalRows FROM `user_history`" + where + " group by userid;";
    } else {
        sql = "SELECT COUNT(*) AS totalRows FROM `users`" + where + ";";
    }
    //  console.log('SQL000000000000000', sql);
    // TODO: [rows, fieldData] TODO:
    db.execute(sql)
        .then(result => {
            length = result[0][0]['totalRows'];
            if (userid) {
                sql = "SELECT userid,sum(total_records) as total_records,";
                sql += "sum(inserted_in_members) as inserted_in_members,";
                sql += "sum(inserted_in_upload) as inserted_in_upload,";
                sql += "sum(duplicates) as duplicates,";
                sql += "sum(no_filterclick) as no_filterclick,";
                sql += "sum(no_downloadclick) as no_downloadclick,";
                sql += "sum(no_download) as no_download,";
                sql += "MAX(lastlogin) as lastlogin,";
                sql += "MAX(updatedAt) as updatedAt "; 
                sql += "FROM `user_history` " ;
                sql += where + "group by userid LIMIT " + limit + ", " + pageSize + ";";
            } else {
                // console.log('---------------------------------------------------------------');
                if (where) {
                    where += " AND (email <> 'support')";
                    // console.log(where);
                } else {
                    // console.log('Nema uslova');
                    where = " WHERE (email <> 'support')";
                }
                sql = "SELECT id, email, firstname, lastname, downloadCredits, blocked, isContributor, isSupport, isSuperAdmin FROM `users`" + where + " LIMIT " + limit + ", " + pageSize + ";";
                // console.log(sql);
                // console.log('---------------------------------------------------------------');
            }
            db.execute(sql)
                .then(result => {
                    res.status(200).json({
                        message: 'Users fetched successfully',
                        totalRec: length,
                        data: result[0]
                    });
                })
                .catch(err => {
                    res.status(204).json({
                        message: 'There is no history data'
                    });
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
}); // END router.get('/members')

/** Update registered user (credit) */
router.patch('/regusers', checkAuth, (req, res, next) => {
    //if no admin
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }
    // connection.query('UPDATE users SET foo = ?, bar = ?, baz = ? WHERE id = ?', ['a', 'b', 'c', userId], function (error, results, fields) {
    //     if (error) throw error;
    //     // ...
    //   });
    // UPDATE `users` SET `downloadCredits`=5001 WHERE `email` = 'stanko@teol.net'
    let sql = "UPDATE `users` SET downloadCredits = ?, blocked = ?, isContributor = ?, isSupport = ?, isSuperAdmin = ? WHERE `email` = ?";
    let vals = [];
    console.log('From patch user ---> isadmin:', req.body.isAdmin);
    vals.push(req.body.downloadCredits, req.body.blocked, req.body.isContributor, req.body.isSupport, req.body.isSuperAdmin, req.body.email);
    db.execute(sql, vals).then(result => {
        console.log(result);
        res.status(201).json({
            message: 'User updated successfully'
        });
    })
        .catch(err => {
            res.status(501).json({
                message: 'Error updating user!',
                error: err
            });
            console.log(err);
        });
});


/** Featch users details from database */
router.get('/userdetails', checkAuth, (req, res, next) => {
    //if no admin
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }
    // TODO: Sanitize this
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.pageIndex;
    let limit = currentPage * pageSize;
    let filter = req.query.filter;
    let length = 0;
    let where = '';
    let userid;

    // console.log('ima li id?', req.query.userid);
    if (req.query.userid) {
        userid = req.query.userid;
        // console.log('userid', userid);
    }

    const columns = [
        'userid',
        'filters',
        'updatedAt'
    ];

    if (filter) {
        filter = "'%" + filter + "%'";
        where = " WHERE ";
        columns.forEach(el => {
            where += "`" + el + "`" + " LIKE " + filter + " OR ";
        });
        where = where.slice(0, -4);  // remove last OR
        if (userid && userid !== '0') {
            where += " AND userid = " + userid;
        }

    } else {
        if (userid && userid !== '0') {
            where = " WHERE userid = " + userid;
        }
    }

    let sql = '';
    let tsql = "SELECT count(*) as NumberOfSearch, userid, filters FROM `user_detail_report` ";
    // tsql += "GROUP BY userid, filters ";
    // tsql += "ORDER BY NumberOfSearch DESC"

    if (userid) {
        tsql += where;
        tsql += " GROUP BY userid, filters ";
        tsql += "ORDER BY NumberOfSearch DESC";
        sql = "SELECT COUNT(*) AS totalRows FROM (" + tsql + ") as t";
        // console.log(sql);
        // sql = "SELECT COUNT(*) AS totalRows FROM `user_detail_report`" + where + ";";
    }

    // TODO: [rows, fieldData] TODO:
    db.execute(sql)
        .then(result => {
            length = result[0][0]['totalRows'];
            sql = "SELECT count(*) as NumberOfSearch, userid, filters FROM `user_detail_report` " + where;
            sql += " GROUP BY userid, filters ";
            sql += "ORDER BY NumberOfSearch DESC";
            sql += " LIMIT " + limit + ", " + pageSize + ";";
            console.log(sql);
            db.execute(sql)
                .then(result => {
                    res.status(200).json({
                        message: 'User details fetched successfully',
                        totalRec: length,
                        data: result[0]
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
}); // END getuserDetails


/** Get keywords report */
router.get('/userdetails1', checkAuth, (req, res, next) => {
    //if no admin
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }
    // TODO: Sanitize this
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.pageIndex;
    let limit = currentPage * pageSize;
    let filter = req.query.filter;
    let length = 0;
    let where = '';
    let userid;

    // console.log('ima li id?', req.query.userid);
    if (req.query.userid) {
        userid = req.query.userid;
        // console.log('userid', userid);
    }

    const columns = [
        'filters'
    ];

    if (filter) {
        filter = "'%" + filter + "%'";
        where = " WHERE ";
        columns.forEach(el => {
            where += "`" + el + "`" + " LIKE " + filter + " OR ";
        });
        where = where.slice(0, -4);  // remove last OR
    }

    let sql = '';
    let tsql = "SELECT count(*) as NumberOfSearch, filters FROM `user_detail_report` ";
    // tsql += "GROUP BY userid, filters ";

        tsql += where;
        tsql += " GROUP BY filters ";
        tsql += "ORDER BY NumberOfSearch DESC";
        sql = "SELECT COUNT(*) AS totalRows FROM (" + tsql + ") as t";

    // TODO: [rows, fieldData] TODO:
    db.execute(sql)
        .then(result => {
            length = result[0][0]['totalRows'];
            sql = "SELECT count(*) as NumberOfSearch, filters FROM `user_detail_report` " + where;
            sql += " GROUP BY filters ";
            sql += "ORDER BY NumberOfSearch DESC";
            sql += " LIMIT " + limit + ", " + pageSize + ";";
            console.log(sql);
            db.execute(sql)
                .then(result => {
                    res.status(200).json({
                        message: 'Keywords fetched successfully',
                        totalRec: length,
                        data: result[0]
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
}); // END getuserDetails

module.exports = router;