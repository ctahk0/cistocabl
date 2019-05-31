'use strict'
const express = require('express');
const router = express.Router();
const checkAuth = require('../../middleware/check-auth');
const db = require('../util/database');
const adminController = require('../../controlers/admin');



/** Add new category */
router.post('/category', checkAuth, adminController.postNewCategory);

/** Edit category */
router.patch('/category', checkAuth, adminController.editCategory);

/** Delete packet */
router.delete('/packet/:id', checkAuth, adminController.deletePacket);

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



module.exports = router;