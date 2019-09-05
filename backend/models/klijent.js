'use strict'
// const db = require('../api/util/database');

const odbc = require('odbc');
const conStr = "DSN=cistoca;";

module.exports = class ReadKlijentData {

    static async readData(req_query, table_name, filter_columns, cb) {
        try {
            const pageSize = +req_query.pageSize;
            const currentPage = +req_query.pageIndex;
            const limit = currentPage * pageSize;
            let filter = req_query.filter;
            const tableName = table_name;
            const filtercol = filter_columns;
            const columns = filtercol.split(',');
            let length = 0;
            let where = '';

            if (filter) {
                filter = "'%" + filter + "%'";
                where = " WHERE (";
                if (filtercol) {
                    columns.forEach(el => {
                        where += "LOWER (" + el +") LIKE " + filter + " OR ";
                    });
                    where = where.slice(0, -4);  // remove last OR
                    where += ")";
                } else {
                    where = where.slice(0, -5);  // remove last OR
                }
            }
            // let sql = "SELECT is_case_insens FROM sysmaster:sysdatabases WHERE name LIKE  'mi_cistoca19';"

            let sql = "SELECT COUNT(*) AS totalRows FROM " + tableName + " " + where;
            console.log(sql);
            // Otvaramo konekciju na informix db
            // const conn = db.openSync(ConStr);
            // db.open(ConStr, async (err, conn) => {
            odbc.connect(conStr, async (err, conn) => {
                if (err) {
                    console.log('Informix connection open error!');
                    console.log(err);
                }
                try {
                    console.log('Success!');
                    const totalRows = await conn.query(sql);

                    console.log(totalRows[0].totalrows);
                    
                    length = totalRows[0].totalrows;
                    console.log('Ukupno klijenata:----------------------------------');
                    console.log(length);

                    // IBM syntax offset
                    // SELECT SKIP 50 FIRST 10 a, b FROM tab1;
                    sql = "SELECT sif_par, naz_par FROM " + tableName + " " + where + " LIMIT " + pageSize + ";";
                    console.log(sql);
                    const result = await conn.query(sql);

                    conn.close(function () {
                        console.log('done');
                    });
                    // conn.close();
                    // conn.closeSync();
                    // console.log(result);
                    return cb({
                        status: 200,
                        message: 'Successfull',
                        totalRec: length,
                        data: result
                    });
                } catch (error) {
                    console.log('Error catch 1!', error);
                    return cb({
                        status: 500,
                        message: 'Error reading from customer table',
                        error: error
                    });
                }
            });

        } catch (error) {
            console.log('Error catch!', error);
            return cb({
                status: 500,
                message: 'Error reading from table',
                error: error
            });
        }
    }

}