'use strict'
const db = require('../api/util/database');

module.exports = class Graph {

    static getGraphData(filter, cat, userid, recordclick, cb) {
        // register user click on filter
        // console.log('record click:', recordclick);
        let sql = '';
        if (recordclick === 'true') {
            // sql = "UPDATE user_history SET no_filterclick = no_filterclick + 1 WHERE userid = " + userid;
            // db.execute(sql).then(d => {
            //  console.log('updated click', d);
            // }).catch(err => console.log(err));

            sql = "INSERT INTO user_history (userid, no_filterclick) VALUES (" + userid + ", 1)";
            db.execute(sql).then(result => {}).catch(err => console.log(err));

            if (filter) {
                // console.log('filter ----------------', filter);
                let filt = filter.replace(/BINARY/g, "");

                filt = filt.replace(/[{()}]/g, "");
                filt = filt.replace(/ In /g, ": ");
                filt = filt.replace(/`/g, "");
                filt = filt.replace(/'/g, "");

                // console.log('filter ----------------', filt);
                sql = "INSERT INTO user_detail_report (userid, filters) VALUES (" + userid + ", '" + filt + "')";
                // console.log(sql);
                db.execute(sql).catch(err => console.log(err));
            }
        }

        // TODO: Sanitize this
        let where = '';

        // define columns for filter
        const columns = [
            'Member Code',
            'Member Name',
            'Member ID'
        ];
        let tableName;
        let tableState;
        if (cat) {
            tableName = 'members_view';
        } else {
            tableName = 'members_unique_view';
        }
        if (filter || cat) {
            // filter = "'%" + filter + "%'";
            if (cat) {
                if (filter) {
                    where = " WHERE (`category_id` In (" + cat + ")) AND (";
                } else {
                    where = " WHERE (`category_id` In (" + cat + ")";
                }
            } else {
                where = " WHERE (";
            }
            // columns.forEach(el => {
            //     where += "`" + el + "`" + " LIKE " + filter + " OR ";
            // });
            // where = where.slice(0, -4);  // remove last OR
            where += filter;
            where += ")";

        }

        //chained propises
        // getGender(tableName, where)
        //     .then(function () { return second_promise(); })
        //     .then(function () { return third_promise(); })
        //     .then(function () { return nth_promise(); });
        sql = "SELECT sex as name, count(*) as value FROM `" + tableName + "`" + where + " ";
        sql += "group by sex";
        // console.log(sql);
        let byGender;
        let byState;
        let byAgeRange;
        let byRace;
        db.execute(sql)
            .then(result => {
                // console.log(result);
                byGender = result[0];
                sql = "SELECT AgeRange as name, count(*) as value FROM `" + tableName + "`" + where + " ";
                sql += "group by AgeRange";
                // console.log(sql);
                db.execute(sql).then(result => {
                    byAgeRange = result[0];
                    // console.log(result[0]);
                    sql = "DROP TEMPORARY TABLE IF EXISTS statetop9, statetoptmp; ";
                    sql += "CREATE TEMPORARY TABLE statetop9 ";
                    sql += "SELECT `State` AS `name`, count(*) AS `value` from `" + tableName + "` " + where + " ";
                    sql += "GROUP BY `State` order by count(*) desc limit 9; "
                    sql += "CREATE TEMPORARY TABLE statetoptmp "
                    sql += "SELECT `State` AS `name`, count(*) AS `value` from `" + tableName + "` " + where + " ";
                    sql += "GROUP BY `State` order by count(*) desc limit 9; "
                    sql += "SELECT * FROM `statetoptmp` ";
                    sql += "UNION ";
                    sql += "SELECT 'Other' AS `name`, COUNT(*) AS `value` FROM `" + tableName + "` " + where + " ";
                    if (where) {
                        sql += "AND (NOT (`" + tableName + "`.`State` IN (SELECT `statetop9`.`name` FROM `statetop9`)));"
                    } else {
                        sql += "WHERE (NOT (`" + tableName + "`.`State` IN (SELECT `statetop9`.`name` FROM `statetop9`)));"
                    }
                    // console.log('===============================================================================');
                    // console.log(sql);
                    // console.log('===============================================================================');
                    db.query(sql).then(result => {
                        byState = result[0][3];
                        sql = "SELECT Race as name, count(*) as value FROM `" + tableName + "`" + where + " ";
                        sql += "group by Race";
                        db.execute(sql).then(result => {
                            byRace = result[0];
                            return cb({
                                status: 200,
                                message: 'Data fetched successfully',
                                byGender: byGender,
                                byAgeRange: byAgeRange,
                                byState: byState,
                                byRace: byRace
                            });
                        }).catch(err => {
                            console.log(err);
                            return cb({
                                status: 404,
                                message: 'Error getting data from database',
                                error: err
                            });
                        });
                    }).catch(err => {
                        console.log(err);
                        return cb({
                            status: 404,
                            message: 'Error getting data from database',
                            error: err
                        });
                    });
                }).catch(err => {
                    console.log(err);
                    return cb({
                        status: 404,
                        message: 'Error getting data from database',
                        error: err
                    });
                });
            }).catch(err => {
                console.log(err);
                return cb({
                    status: 404,
                    message: 'Error getting data from database',
                    error: err
                });
            });
    }

}

/*
.catch(err => {
    console.log(err);
    cb({
        status: 404,
        message: 'Error getting data from database',
        error: err
    });
});
 */
/* sql = "SELECT state as name, count(*) as value FROM `" + tableName + "`" + where + " ";
            sql += "group by state";
            db.execute(sql).then(result => {
                const byState = result[0];
                cb({
                    status: 200,
                    message: 'Data fetched successfully',
                    byGender: byGender,
                    byState: byState
                });
            }).catch(err => {
                console.log(err);
                cb({
                    status: 404,
                    message: 'Error getting data from database',
                    error: err
                });
            });
*/
