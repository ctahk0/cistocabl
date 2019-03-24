'use strict'
const fs = require('fs');
const Category = require('../models/category');
const Member = require('../models/member');
const Packet = require('../models/packet');
const CustomerFile = require('../models/download');


/** ADD new category */
exports.postNewCategory = (req, res, next) => {
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }
    Category.addNew(req.body, cb => {
        if (cb.status === 201) {
            res.status(201).json({
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

/** Edit category */
exports.editCategory = (req, res, next) => {
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }

    Category.edit(req.body, cb => {
        if (cb.status === 201) {
            res.status(201).json({
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

/** DELETE Category */
exports.deleteCategory = (req, res, next) => {
    //if no admin
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }
    Category.delete(req.params.id, cb => {
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

/** Get members from database */
exports.getGetMembers = (req, res, next) => {
    // TODO: Sanitize this
    // if no admin
    // console.log('USER ID: ', req.userData.isAdmin);
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }
    console.log('getMembersControler:', req.query.postcode);
    Member.fetchAll(+req.query.pageSize,
        +req.query.pageIndex,
        req.query.filter,
        req.query.filtercol,
        req.query.cat,
        req.query.usid,
        req.query.sfilter,
        cb => {
        if (cb.status === 200) {
            res.status(200).json({
                message: cb.message,
                data: cb.data,
                totalRec: cb.totalRec
            });
        } else {
            res.status(cb.status).json({
                message: cb.message,
                error: cb.error
            });
        }
    });
};


/** ADD new packet */
exports.postNewPacket = (req, res, next) => {
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }
    Packet.addNew(req.body, cb => {
        if (cb.status === 201) {
            res.status(201).json({
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

/** DELETE Packet */
exports.deletePacket = (req, res, next) => {
    //if no admin
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }
    Packet.delete(req.params.id, cb => {
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

/** UPDATE / INSERT member*/
exports.updateAddMember = (req, res, next) => {
    if (req.userData.isAdmin != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }
    Member.editUpdate(req.body, cb => {
        // if (cb.status === 200 || cb.status === 201) {
        //     res.status(cb.status).json({
        //         message: cb.message
        //     });
        // } else {
        res.status(cb.status).json({
            message: cb.message,
            error: cb.error
        });
        //}
    });
};

exports.getGenerateAdminFileForDownload = (req, res, next) => {
    // console.log(req.body);
    // console.log(req.userData);
    CustomerFile.generateAdminFile(req.body.filter, req.body.filtercol, req.body.cat, req.userData.userId, cb => {
        if (cb.status === 201) {
            // File is successfully generated, 
            const fileName = cb.fileName;
            const filePath = cb.filePath;
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
}

