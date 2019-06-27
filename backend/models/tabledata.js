'use strict'
const db = require('../api/util/database');

module.exports = class ReadFromTable {

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
            console.log('Zaduzenja request:------------------');
            console.log(pageSize);
            console.log(currentPage);
            console.log(filter);

            if (filter) {
                filter = "'%" + filter + "%'";
                where = " WHERE (";
                if (filtercol) {
                    columns.forEach(el => {
                        where += "`" + el + "`" + " LIKE " + filter + " OR ";
                    });
                    where = where.slice(0, -4);  // remove last OR
                    where += ")";
                } else {
                    where = where.slice(0, -5);  // remove last OR
                }
            }

            let sql = "SELECT COUNT(*) AS totalRows FROM `" + tableName + "`" + where + ";";
            console.log(sql);

            const totalRows = await db.execute(sql);
            length = totalRows[0][0]['totalRows'];
            console.log(length);
            sql = "SELECT * FROM `" + tableName + "`" + where + " LIMIT " + limit + ", " + pageSize + ";";
            console.log(sql);
            const result = await db.execute(sql);

            return cb({
                status: 200,
                message: 'Successfull',
                totalRec: length,
                data: result[0]
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