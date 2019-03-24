'use strict'
const db = require('../api/util/database');

module.exports = class Packet {

    static addNew(packet, cb) {
        console.log('We have a packet!');
        console.log(packet);
        if (packet.id) {
            console.log('Imamo id, ide edit');

            const vals = [packet.name, packet.columns.join(';'), packet.credit, packet.id];
            console.log(vals);
            const sql = "UPDATE `packet` SET name = ?, columns = ?, credits = ? WHERE id = ?";
            db.query(sql, vals).then(result => {
                cb({
                    status: 201,
                    message: 'packet updated successfully!'
                });
            }).catch(err => {
                console.log(err);
                cb({
                    status: 500,
                    message: 'Error updating packet!',
                    error: err
                });
            });
        } else {
            const vals = {
                'name': packet.name,
                'columns': packet.columns.join(';'),
                'credits': packet.credit
            };
            const sql = "INSERT INTO `packet` SET ?";
            db.query(sql, vals).then(result => {
                cb({
                    status: 201,
                    message: 'packet created successfully!'
                });
            }).catch(err => {
                console.log(err);
                cb({
                    status: 500,
                    message: 'Error creating new packet!',
                    error: err
                });
            });
        }
    }

    static fetchAll(cb) {

        let sql = "SELECT * FROM `packet`"

        db.execute(sql).then(result => {
            let selected = result[0];
            sql = "SHOW COLUMNS FROM `members`";
            db.execute(sql).then(result => {

                cb({
                    status: 200,
                    message: 'Packets fetched successfully',
                    data: selected,
                    columns: result[0]
                });
            }).catch(err => {
                console.log(err);
                cb({
                    status: 404,
                    message: 'Error reading packet from database',
                    error: err
                });
            });
        }).catch(err => {
            console.log(err);
            cb({
                status: 404,
                message: 'Error reading packet from database',
                error: err
            });
        });
    }

    static delete(id, cb) {

        const sql = "DELETE FROM `packet` WHERE `packet`.`id` = " + id + ";";
        // console.log(sql);
        db.execute(sql).then(result => {
            cb({
                status: 200,
                message: 'Packet deleted successfully'
            });
        }).catch(err => {
            console.log(err);
            cb({
                status: 500,
                message: 'Error deleting packet',
                error: err
            });
        });
    }
};



