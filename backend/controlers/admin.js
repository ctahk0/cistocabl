'use strict';
const data = require('../models/tabledata');

/** Get table read */
exports.getZaduzenja = (req, res, next) => {
    // readData(query, tableName, filterColumns) --- za sva citanja iz tabela
    data.readData(req.query,'zaduzenje','broj,datum,vrsta_klijenta,opis', cb => {
        if (cb.status === 200) {
            res.status(200).json({
                status: cb.status,
                message: cb.message,
                totalRec: cb.totalRec,
                data: cb.data
            });
        } else {
            res.status(cb.status).json({
                status: cb.status,
                message: cb.message,
                error: cb.error
            });
        }
    });
}
