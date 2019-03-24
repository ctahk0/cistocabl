'use strict'
const db = require('../api/util/database');

module.exports = class Member {
    // constructor(id, category_name) {
    //     this.id = id;
    //     this.category_name = category_name;
    // }

    // save() {
    //     getProductsFromFile(products => {
    //         products.push(this);
    //         fs.writeFile(p, JSON.stringify(products), err => {
    //             console.log(err);
    //         });
    //     });
    // }

    static fetchAll(pageSize, currentPage, filter, filtercol, cat, userid, sfilter, cb) {
        // TODO: Sanitize this
        // const pageSize = +req.query.pageSize;
        // const currentPage = +req.query.pageIndex;
        const limit = currentPage * pageSize;
        // let filter = req.query.filter;
        let length = 0;
        let where = '';
        console.log('USER ID:', userid);
        if (userid) {
            console.log('Imamo user ID');
        } else {
            console.log('Nema user id');
        }
        const columns = filtercol.split(',');
        // console.log('filtercol', filtercol);
        // if (!filtercol) {
        //     console.log('Prazan je ');
        // }
        // console.log('FILTER: ', filter, columns.length);
        let tableName;
        if (cat || userid) {
            tableName = 'members_view';
        } else {
            tableName = 'members';
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

        if (userid) {
            if (where) {
                where += " AND (`upload_by` = " + userid + ")";
            } else {
                where += " WHERE (`upload_by` = " + userid + ")";
            }
        }

        console.log('Main WHERE ==>>>>', where);
        console.log('Static filter', sfilter);
        if (sfilter) {
            console.log('Imamo sfilter');
            if (where) {
                console.log('Ima where');
                where += " AND (" + sfilter + ")";
                console.log('Ima where', where);
            } else {
                console.log('Nema where, ide konstrukcija sa sfilter');
                where = " WHERE " + sfilter;
                console.log(where);
            }
        } else {
            console.log('Nemamo sfilter');
        }



        // console.log('==>>>>',tableName);
        let sql = "SELECT COUNT(*) AS totalRows FROM `" + tableName + "`" + where + ";";
        console.log(sql);
        // TODO: [rows, fieldData] TODO:
        db.execute(sql)
            .then(result => {
                length = result[0][0]['totalRows'];
                // console.log(result);
                console.log(length);
                sql = "SELECT * FROM `" + tableName + "`" + where + " LIMIT " + limit + ", " + pageSize + ";";
                console.log(sql);
                db.execute(sql)
                    .then(result => {
                        // console.log(result);
                        cb({
                            status: 200,
                            message: 'Members fetched successfully',
                            totalRec: length,
                            data: result[0]
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        cb({
                            status: 404,
                            message: 'Error getting members from database',
                            error: err
                        });
                    });
            })
            .catch(err => {
                console.log(err);
                cb({
                    status: 404,
                    message: 'Error getting members from database',
                    error: err
                });
            });
    }

    static editUpdate(member, cb) {

        const mb = member;
        let sql;
        let update = false;
        // check if exist, then edit
        // else insert new
        //TODO: Dodati jos uslova kasnije (tag - category)
        let values = [];
        values.push(
            mb['member_code'],
            mb['member_name'],
            mb['member_id'],               // For unique ID
            mb['member_address01'],
            mb['member_address02'],
            mb['member_address03'],
            mb['member_postcode'],
            mb['member_location'],
            mb['member_state'],
            mb['member_country'],
            mb['member_sex'],
            mb['member_phone_mobile'],     // For unique ID
            mb['member_phone_home'],
            mb['member_office'],
            mb['member_fax'],
            mb['member_email'],
            mb['member_occupation'],
            mb['member_language'],
            mb['member_race'],
            mb['member_recommend'],
            mb['member_type_a'],
            mb['member_type_a'],
            mb['member_type_c'],
            mb['member_preference'],
            mb['member_skintype'],
            mb['member_weight'],
            mb['member_height'],
            mb['member_lifetime_index'],
            mb['member_adv_accept'],
            mb['member_issued_name'],
            mb['member_issued_date'],
            mb['member_status'],
            mb['member_masterid'] // this is master ID for update
        );

        sql = "UPDATE `members` SET ";
        sql += "`Member Code` = ?, ";
        sql += "`Member Name` = ?, ";
        sql += "`Member ID` = ?, ";
        sql += "`Address01` = ?, ";
        sql += "`Address02` = ?, ";
        sql += "`Address03` = ?, ";
        sql += "`Postcode` = ?, ";
        sql += "`Location` = ?, ";
        sql += "`State` = ?, ";
        sql += "`Country` = ?, ";
        sql += "`Sex` = ?, ";
        sql += "`Phone-Mobile` = ?, ";
        sql += "`Phone-Home` = ?, ";
        sql += "`Phone-Office` = ?, ";
        sql += "`Fax` = ?, ";
        sql += "`Email` = ?, ";
        sql += "`Occupation` = ?, ";
        sql += "`Language` = ?, ";
        sql += "`Race` = ?, ";
        sql += "`Recommend` = ?, ";
        sql += "`Type_A` = ?, ";
        sql += "`Type_B` = ?, ";
        sql += "`Type_C` = ?, ";
        sql += "`Preference` = ?, ";
        sql += "`Skin Type` = ?, ";
        sql += "`Weight` = ?, ";
        sql += "`Height` = ?, ";
        sql += "`Lifetime Index` = ?, ";
        sql += "`Adv Accept` = ?, ";
        sql += "`Issued Name` = ?, ";
        sql += "`Issued Date` = ?, ";
        sql += "`MemberStatus` = ? ";
        sql += "WHERE `ID` = ? ";
        //'UPDATE users SET foo = ?, bar = ?, baz = ? WHERE id = ?', ['a', 'b', 'c', userId]
        // sql = sql.replace(/undefined/g, '');
        // sql = sql.replace(/null/g, '');
        // console.log(sql);
        // try to update, if fail go to insert/create new member

        db.query(sql, values).then(result => {
            result[0].affectedRows != 0 ? update = true : update = false;
            if (update) {
                cb({
                    status: 200,
                    message: 'Members updated successfully!'
                });
            } else {
                // INSERT NEW
                let vals = {};
                vals = {
                    'Member Code': mb['member_code'],
                    'Member Name': mb['member_name'],
                    'Member ID': mb['member_id'],
                    'Address01': mb['member_address01'],
                    'Address02': mb['member_address02'],
                    'Address03': mb['member_address03'],
                    'Postcode': mb['member_postcode'],
                    'Location': mb['member_location'],
                    'State': mb['member_state'],
                    'Country': mb['member_country'],
                    'Sex': mb['member_sex'],
                    'Phone-Mobile': mb['member_phone_mobile'],
                    'Phone-Home': mb['member_phone_home'],
                    'Phone-Office': mb['member_office'],
                    'Fax': mb['member_fax'],
                    'Email': mb['member_email'],
                    'Occupation': mb['member_occupation'],
                    'Language': mb['member_language'],
                    'Race': mb['member_race'],
                    'Recommend': mb['member_recommend'],
                    'Type_A': mb['member_type_a'],
                    'Type_B': mb['member_type_a'],
                    'Type_C': mb['member_type_c'],
                    'Preference': mb['member_preference'],
                    'Skin Type': mb['member_skintype'],
                    'Weight': mb['member_weight'],
                    'Height': mb['member_height'],
                    'Lifetime Index': mb['member_lifetime_index'],
                    'Adv Accept': mb['member_adv_accept'],
                    'Issued Name': mb['member_issued_name'],
                    'Issued Date': mb['member_issued_date'],
                    'MemberStatus': mb['member_status']
                };

                sql = "INSERT INTO `members` SET ?";
                db.query(sql, vals).then(result => {
                    cb({
                        status: 201,
                        message: 'Members created successfully!'
                    });
                }).catch(err => {
                    console.log(err);

                    return cb({
                        status: 500,
                        message: 'There was an error processing members data',
                        error: err
                    });
                });
            }
        }).catch(err => {
            console.log(err);
            cb({
                status: 500,
                message: 'There was an error processing members data',
                error: err
            });
        });

    }
}