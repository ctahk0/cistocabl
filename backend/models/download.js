'use strict'
const db = require('../api/util/database');
const fs = require('fs');
const fse = require('fs-extra')
const Papa = require('papaparse');
const path = require('path');

module.exports = class FileForDownload {

    static generateCustomerFile(userCredit, filter, numberOfRecords, cat, pid, user, cb) {
        //TODO: check for user credit!
        console.log('Packet ID', pid);
        console.log('Credit, records', userCredit, numberOfRecords);
        const uc = Number(userCredit);
        const rec = Number(numberOfRecords);
        const userID = user;

        let sql = "SELECT * FROM packet WHERE id = " + pid;

        db.execute(sql).then(result => {
            const columns = result[0][0].columns;
            const price = result[0][0].credits;

            const cost = rec * price;
            console.log(uc, rec, cost);

            let cols = columns.split(';');
            let strcols = '';
            cols.forEach(el => {
                strcols += '`' + el + '`,';
            });

            strcols = strcols.slice(0, -1);
            // console.log(strcols);

            if (cost >= uc) {
                console.log('Nema dovoljno kredita!');
                return cb({
                    status: 403,
                    message: 'Cannot continue, user don\'t have enough download credits!'
                });
            }
            if (uc < rec) {
                console.log('Cannot continue, user don\'t have enough download credits!');
                return cb({
                    status: 403,
                    message: 'Cannot continue, user don\'t have enough download credits!'
                });
            }

            // add total records in history table

            sql = "INSERT INTO user_history (userid, no_download) VALUES (" + userID + ", " + rec + ")";
            db.execute(sql).then(result => {}).catch(err => console.log(err));

            let tableName;
            let where = '';
            if (cat) {
                tableName = 'members_view';
            } else {
                tableName = 'members_unique_view';
            }


            // TODO: Fix this category filter!!!!!! !important
            if (filter !== '' || cat.length > 0) {
                // filter = "'%" + filter + "%'";
                if (cat.length > 0) {
                    if (filter) {
                        where = " WHERE (`category_id` In (" + cat + ")) AND (";
                    } else {
                        where = " WHERE (`category_id` In (" + cat + ")";
                    }
                } else {
                    where = " WHERE (";
                }
                where += filter;
                where += ")";
            }
            //TODO: Select columns for download!
            sql = "SELECT " + strcols + " FROM `" + tableName + "`" + where + " LIMIT " + rec;
            console.log(sql);

            db.execute(sql).then(result => {
                // console.log(result[0]);

                function GetDateFormat(date) {
                    let month = (date.getMonth() + 1).toString();
                    month = month.length > 1 ? month : '0' + month;
                    let day = date.getDate().toString();
                    day = day.length > 1 ? day : '0' + day;
                    let tim = date.getTime().toString();
                    return date.getFullYear() + '-' + month + '-' + day + '_' + tim;
                }

                var d = new Date();
                let dateFile = GetDateFormat(d);
                let filtName = filter;
                // console.log('Filter for name', filtName);
                let sname = filtName.replace(/BINARY/g, "");
                sname = sname.replace("`AgeRange` In ", "");
                sname = sname.replace("Age In ", "");
                sname = sname.replace(/AND/g, "_");
                sname = sname.replace("`Race` In", "");
                sname = sname.replace("`Sex` In", "");
                sname = sname.replace("Postcode In", "");
                sname = sname.replace("Location In", "");
                sname = sname.replace("State In", "");
                sname = sname.replace(/[{()}]/g, "");
                sname = sname.replace(/`/g, "");
                sname = sname.replace(/ /g, "");
                sname = sname.replace(/'/g, "");

                const fileName = dateFile + '_' + userID + '_' + sname + '.csv';

                const userDir = path.join('data', 'id_' + userID, 'downloads');
                // const userDirID = userDir + userID;

                // const dir = '/tmp/this/path/does/not/exist'
                const desiredMode = 0o2775
                const options = {
                    mode: 0o2775
                }

                // If user dir no exist, create it:
                fse.ensureDir(userDir, err => {
                    console.log(err) // => null
                    // dir has now been created, including the directory it is to be placed in
                    const filePath = path.join(userDir, fileName);
                    //console.log(filePath);
                    let stream = fs.createWriteStream(filePath);
                    // console.log(cols);
                    let csv = Papa.unparse({
                        fields: cols,
                        data: result[0]
                    },
                        {
                            quotes: false,
                            quoteChar: '"',
                            escapeChar: '\b',
                            header: true,
                            newline: "\r\n"
                        }
                    );
                    // delimiter: ";",

                    stream.write(csv);
                    stream.end();
                    stream.on('finish', () => {
                        console.log('File is generated!', filePath);
                        cb({
                            status: 201,
                            message: 'File generated successfully!',
                            fileName: fileName,
                            filePath: filePath,
                            cost: cost
                        });
                    });
                });

            }).catch(err => {
                console.log(err);
                cb({
                    status: 500,
                    message: 'Error creating file',
                    error: err
                });
            });

        }).catch(err => {
            console.log(err);
            return cb({
                status: 500,
                message: 'Error readiing downnload packet',
                error: err
            });

        });
    }

    /** GENERATE Admin file for download based on filter on Data  */
    static generateAdminFile(filter, filtercol, cat, user, cb) {

        const userID = user;

        let tableName;
        let where = '';
        console.log('filtercol', filtercol);
        const columns = filtercol;
        // const columns = filtercol.split(',');

        if (cat) {
            tableName = 'members_view';
        } else {
            tableName = 'members_unique_view';
        }

        if (filter || cat) {
            filter = "'%" + filter + "%'";
            if (cat) {
                where = " WHERE (`category_id` In (" + cat + ")) AND (";
            } else {
                where = " WHERE (";
            }
            if (filtercol) {
                columns.forEach(el => {
                    where += "`" + el + "`" + " LIKE " + filter + " OR ";
                });
                where = where.slice(0, -4);  // remove last OR
                where += ")";
            } else {
                where = where.slice(0, -5);  // remove last OR
                // where += ")";
                // limit = 0;                  // reset to first page on filter
            }
        }
        //TODO: Select columns for download!
        let sql = "SELECT * FROM `" + tableName + "`" + where;
        console.log(sql);

        db.execute(sql).then(result => {
            // console.log(result[0]);

            function GetDateFormat(date) {
                let month = (date.getMonth() + 1).toString();
                month = month.length > 1 ? month : '0' + month;
                let day = date.getDate().toString();
                day = day.length > 1 ? day : '0' + day;
                let tim = date.getTime().toString();
                return date.getFullYear() + '-' + month + '-' + day + '_' + tim;
            }

            var d = new Date();
            let dateFile = GetDateFormat(d);

            const fileName = dateFile + '_' + userID + '.csv';

            const userDir = path.join('data', 'id_' + userID, 'downloads');
            // const userDirID = userDir + userID;

            // const dir = '/tmp/this/path/does/not/exist'
            const desiredMode = 0o2775
            const options = {
                mode: 0o2775
            }

            // If user dir no exist, create it:
            fse.ensureDir(userDir, err => {
                console.log(err) // => null
                // dir has now been created, including the directory it is to be placed in
                const filePath = path.join(userDir, fileName);
                //console.log(filePath);
                let stream = fs.createWriteStream(filePath);

                // crate columns for papa.unparse
                let col = "Member Code,";
                col += "Member Name,";
                col += "Member ID,";
                col += "Address01,";
                col += "Address02,";
                col += "Address03,";
                col += "Postcode,";
                col += "Location,";
                col += "State,";
                col += "Sex,";
                col += "Phone-Mobile,";
                col += "Phone-Home,";
                col += "Phone-Office,";
                col += "Fax,";
                col += "Email,";
                col += "Occupation,";
                col += "Language,";
                col += "Race,";
                col += "Recommend,";
                col += "Type_A,";
                col += "Type_B,";
                col += "Type_C,";
                col += "Preference,";
                col += "Skin Type,";
                col += "Weight,";
                col += "Height,";
                col += "Lifetime Index,";
                col += "Adv Accept,";
                col += "Issued Name,";
                col += "Issued Date,";
                col += "MemberStatus,";
                col += "MemberBirthday";

                const cols = col.split(',');;

                let csv = Papa.unparse({
                    fields: cols,
                    data: result[0]
                },
                    {
                        quotes: false,
                        quoteChar: '"',
                        escapeChar: '\b',
                        header: true,
                        newline: "\r\n"
                    }
                );
                stream.write(csv);
                stream.end();
                stream.on('finish', () => {
                    console.log('File is generated!', filePath);
                    cb({
                        status: 201,
                        message: 'File generated successfully!',
                        fileName: fileName,
                        filePath: filePath
                    });
                });
            });

        }).catch(err => {
            console.log(err);
            cb({
                status: 500,
                message: 'Error creating file',
                error: err
            });
        });
    }
}