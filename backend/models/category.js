'use strict'
const db = require('../api/util/database');

module.exports = class Category {
    constructor(id, category_name) {
        this.id = id;
        this.category_name = category_name;
    }

    // save() {
    //     getProductsFromFile(products => {
    //         products.push(this);
    //         fs.writeFile(p, JSON.stringify(products), err => {
    //             console.log(err);
    //         });
    //     });
    // }
    static addNew(category, cb) {
        
        const vals = { 'category_name': category.AddNew }
        const sql = "INSERT INTO `category` SET ?";
        db.query(sql, vals).then(result => {
            cb({
                status: 201,
                message: 'Category created successfully!'
            });
        }).catch(err => {
            console.log(err);
            cb({
                status: 500,
                message: 'Error creating new category!',
                error: err
            });
        });
    }

    static edit(category, cb) {
        let vals = [];
        vals.push(category.name, category.id);
        // const vals = { 'category_name': category.name, 'id': category.id }
        // console.log(vals);
        const sql = "UPDATE `category` SET category_name = ? WHERE id = ?";
        db.query(sql, vals).then(result => {
            cb({
                status: 201,
                message: 'Category updated successfully!'
            });
        }).catch(err => {
            console.log(err);
            cb({
                status: 500,
                message: 'Error updating category!',
                error: err
            });
        });
    }

    static delete(id, cb) {

        const sql = "DELETE FROM `category` WHERE `category`.`id` = " + id + ";";
        // console.log(sql);
        db.execute(sql).then(result => {
            cb({
                status: 200,
                message: 'Category deleted successfully'
            });
        }).catch(err => {
            console.log(err);
            cb({
                status: 500,
                message: 'Error deleting category',
                error: err
            });
        });
    }

    static fetchAll(filter, cb) {
        let where = '';
        // define columns for filter
        const columns = [
            'category_name'
        ];
        if (filter) {
            filter = "'%" + filter + "%'";
            where = " WHERE ";
            columns.forEach(el => {
                where += "`" + el + "`" + " LIKE " + filter + " OR ";
            });
            where = where.slice(0, -4);  // remove last OR
            // limit = 0;                  // reset to first page on filter
        }
        const sql = "SELECT * FROM `category`" + where
        // console.log(sql);
        db.execute(sql)
            .then(result => {
                // console.log(result);
                cb({
                    status: 200,
                    message: 'Categories fetched successfully',
                    data: result[0]
                });
            })
            .catch(err => {
                console.log(err);
                cb({
                    status: 404,
                    message: 'Error reading category from database',
                    error: err
                });
            });
    }
};



