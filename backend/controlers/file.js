'use strict'
const fs = require('fs');
const path = require('path');
const db = require('../api/util/database');

exports.listUrlFiles = (req, res) => {
    // const fileName = 'user_id_date.csv'

    const userID = req.userData.userId;
    if (!userID) {
        return res.status(404).json({
            message: 'Cannot find user id!'
        });
    }
    const tmpfold = 'id_' + String(userID);
    console.log('User data folder!', tmpfold);
    const downloadFolder = path.join('data', tmpfold, 'downloads/');
    console.log('upload folder', downloadFolder);
    // console.log('file path', filePath);

    fs.readdir(downloadFolder, (err, files) => {
        // for (let i = 0; i < files.length; ++i) {
        //     files[i] = files[i];
        // }

        res.send(files);
    })
}

exports.downloadFile = (req, res) => {
    const userID = req.userData.userId;

    if (!userID) {
        return res.status(404).json({
            message: 'Cannot find user id!'
        });
    }
    let filename = req.params.filename;
    const tmpfold = 'id_' + String(userID);
    const downloadFolder = path.join('data', tmpfold, 'downloads/', filename);


    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
        'Content-Disposition',
        'attachment; filename="' + filename + '"'
    );

    const file = fs.createReadStream(downloadFolder);
    file.pipe(res);
}

/** Upload file and insert into database! */
// TODO : Check file type

exports.uploadFile = (req, res, next) => {
    req.connection.setTimeout(1000 * 60 * 10); // 10 minutes
    //if no admin
    // console.log(req.userData);
    if (req.userData.isContributor != 1 && req.userData.isAdmin != 1 && req.userData.isSupport != 1) {
        return res.status(401).json({
            message: 'Not Authorized!'
        });
    }

    const category = req.body.cat;
    const usrId = req.userData.userId;

    if (!category) {
        return res.status(406).json({
            message: 'Missing category value, cannot continue with data upload!'
        });
    }

    let start = +new Date();
    console.log('1. ----- Starting upload process...');
    const file = './' + req.file.destination + '/' + req.file.filename;

    // const file1 =  './' + req.file.destination + '/1546180487094-import-template.xlsx';
    let dirname = '';
    const fn = req.file.filename;
    // const fn = req.file.filename.replace(/ /g, "");
    // const file1 = './' + req.file.destination + '/' + fn;
    ///fs.rename(file, file1, function (err) {
    //if (err) console.log('ERROR: ' + err);
    let args = '';
    if (process.platform === "win32") {

        dirname = path.resolve(req.file.destination) + '\\';
        console.log('windows: ', dirname, req.file.filename);

        // dirname = "C:\\xampp\\htdocs\\_dev\\malaysia_ccs\\backend\\uploads\\";
        args = __dirname + '\\xlsx2csv.py';
    } else {
        // dirname = "/home/ctahk0/backend/uploads/";
        dirname = path.resolve(req.file.destination) + '/';
        console.log('linux: ', dirname, req.file.filename);
        args = __dirname + '/xlsx2csv.py';
    }

    // if (fs.existsSync(file)) {
    //     console.log('ima file');
    // } else {
    //     console.log('nema');
    // }

    console.log('2. ---- Create members_tmpID table!');
    // let sql = '';
    let sql = "DROP TABLE IF EXISTS `members_temp" + usrId + "`; ";
    // sql += "DROP TABLE IF EXISTS `members_temp" + usrId + "_old`; ";
    db.query(sql).then(result => {
        console.log('Deleted tmp table');

        sql += "CREATE TABLE `members_temp" + usrId + "` (";
        sql += "`t_ID` bigint(20) NOT NULL,";
        sql += "`Member Code` varchar(8) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Member Name` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Member ID` varchar(12) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Address01` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Address02` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Address03` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Postcode` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Location` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`State` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Country` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Sex` varchar(6) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Phone-Mobile` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Phone-Home` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Phone-Office` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Fax` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Email` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Occupation` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Language` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Race` varchar(20) COLLATE utf8_unicode_ci NOT NULL,";
        sql += "`Recommend` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Type_A` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Type_B` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Type_C` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Preference` mediumtext COLLATE utf8_unicode_ci,";
        sql += "`Skin Type` varchar(24) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Weight` float DEFAULT NULL,";
        sql += "`Height` float DEFAULT NULL,";
        sql += "`Lifetime Index` smallint(6) DEFAULT NULL,";
        sql += "`Adv Accept` tinyint(1) DEFAULT NULL,";
        sql += "`Issued Name` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`Issued Date` datetime DEFAULT NULL,";
        sql += "`MemberStatus` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,";
        sql += "`masteridtmp` varchar(32) COLLATE utf8_unicode_ci NOT NULL) ";
        sql += "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci; ";

        sql += "ALTER TABLE `members_temp" + usrId + "` ";
        sql += "ADD PRIMARY KEY (`t_ID`),";
        sql += "ADD KEY `Member ID` (`Member ID`), ";
        sql += "ADD KEY `Postcode` (`Postcode`), ";
        sql += "ADD KEY `Phone-Mobile` (`Phone-Mobile`),";
        sql += "ADD KEY `masteridtmp` (`masteridtmp`);";

        sql += "ALTER TABLE `members_temp" + usrId + "` ";
        sql += "MODIFY `t_ID` bigint(20) NOT NULL AUTO_INCREMENT;"

        // sql += "RENAME TABLE `members_temp" + usrId + "` TO `members_temp" + usrId + "_old`, `members_temp" + usrId + "_new` TO `members_temp" + usrId + "`;"
        // console.log('------------SQL----------------');
        // console.log(sql);
        db.query(sql).then(result => {
            console.log('Temptable prepared');
            // console.log(result);


            const { execFile } = require('child_process');

            // const args1 = ";";
            const args2 = dirname + fn;
            const args3 = dirname + fn + '.csv';
            const args4 = '-f %m/%d/%Y';
            // const args5 = "-q 'none'";

            const child = execFile('python', [args, args4, args2, args3], (error, stdout, stderr) => {
                if (error) {
                    throw error;
                }
                console.log('CSV File is generated');
                // console.log(stdout);

                // const workbook = xlsx.readFile(file);
                //console.log('File is read');
                // const wbout = xlsx.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]], { FS: ';', strip: true });
                // const wbout = xlsx.stream.to_csv(workbook.Sheets[workbook.SheetNames[0]], { FS: ';', strip: true });
                // const idx = wbout.indexOf('MemberStatus');
                function get_line(filename, line_no, callback) {
                    var stream = fs.createReadStream(filename, {
                        flags: 'r',
                        encoding: 'utf-8',
                        fd: null,
                        mode: parseInt('0666',8),
                        bufferSize: 64 * 1024
                    });

                    var fileData = '';
                    stream.on('data', function (data) {
                        fileData += data;

                        // The next lines should be improved
                        var lines = fileData.split("\n");

                        if (lines.length >= +line_no) {
                            stream.destroy();
                            callback(null, lines[+line_no]);
                        }
                    });

                    stream.on('error', function () {
                        callback('Error', null);
                    });

                    stream.on('end', function () {
                        callback('File end reached without finding line', null);
                    });

                }
                let idx = 288;
                get_line(file + '.csv', 0, function (err, line) {
                    // console.log('The line: ' + line);
                    idx = line.indexOf('MemberStatus');
                    console.log('index: ', idx);

                    let end = +new Date();  // log end timestamp
                    let diff = end - start;
                    console.log('3. ---- File conversion done in in: ', diff.toLocaleString(), ' seconds');
                    // good place to delete temp table

                    // sql = "DELETE FROM `members_temp` WHERE 1";
                    // db.execute(sql).then(() => {
                    // console.log('3. ---- We have a category, temp table prepared');

                    sql = "LOAD DATA LOCAL INFILE ? INTO TABLE `members_temp" + usrId + "` FIELDS TERMINATED BY ';'";
                    sql += " ENCLOSED BY  '\"'";
                    sql += " ESCAPED BY '\b' ";
                    sql += " LINES TERMINATED BY '\n' IGNORE 1 ROWS";
                    // ako je veliki file
                    if (idx === 288) {
                        sql += " (`Member Code`,`Member Name`,@`Member ID`,`Address01`,`Address02`,`Address03`,`Postcode`,`Location`,`State`,`Country`,`Sex`,@`Phone-Mobile`, ";
                        sql += "`Phone-Home`,`Phone-Office`,`Fax`,`Email`,`Occupation`,`Language`,`Race`,`Recommend`,`Type_A`,`Type_B`,`Type_C`,`Preference`,`Skin Type`, ";
                        sql += "`Weight`,`Height`,`Lifetime Index`,@`Adv Accept`,`Issued Name`,@`Issued Date`,@`MemberStatus`,@`masteridtmp`) ";
                        sql += "SET `Issued Date` = STR_TO_DATE(@`Issued Date`, '%m/%d/%Y %H:%i:%s'), ";
                        sql += "`Member ID` = @`Member ID`, `Phone-Mobile` = @`Phone-Mobile`, ";
                        sql += "`Adv Accept` = IF(@`Adv Accept`='TRUE',1,0), `MemberStatus` = TRIM(TRAILING '\r' FROM @`MemberStatus`), ";
                        sql += "`masteridtmp` = Concat(@`Member ID`, @`Phone-Mobile`);";
                    } else {
                        sql += " (@`Member ID`,`Member Name`, `Address01`,`Address02`,`Address03`,`Postcode`,`Location`,`State`,`Country`,@`Phone-Mobile`,`Sex`,`Race`,@`masteridtmp`) ";
                        sql += "SET `Member ID` = @`Member ID`, `Phone-Mobile` = @`Phone-Mobile`, ";
                        sql += "`masteridtmp` = Concat(@`Member ID`, @`Phone-Mobile`);";
                    }

                    let info = { 'Total Records': '', 'Members table': '', 'Upload table': '' };

                    db.query(sql, file + '.csv').then(result => {
                        // console.log('******************** INSERT TOTAL INFO *************************');
                        // console.log(result);
                        // console.log('************************ END TOTAL INFO *****************************');
                        let inf = result[0].affectedRows;

                        info['Total Records'] = inf;
                        console.log('4. ----- File successfully upload in temp table!');
                        console.log('------------------------------------------------------------------------');

                        sql = "INSERT INTO `members` (";
                        sql += "`Member Code`, ";
                        sql += "`Member Name`, ";
                        sql += "`Member ID`, ";
                        sql += "`Address01`, ";
                        sql += "`Address02`, ";
                        sql += "`Address03`, ";
                        sql += "`Postcode`, ";
                        sql += "`Location`, ";
                        sql += "`State`, ";
                        sql += "`Country`, ";
                        sql += "`Sex`, ";
                        sql += "`Phone-Mobile`, ";
                        sql += "`Phone-Home`, ";
                        sql += "`Phone-Office`, ";
                        sql += "`Fax`, ";
                        sql += "`Email`, ";
                        sql += "`Occupation`, ";
                        sql += "`Language`, ";
                        sql += "`Race`, ";
                        sql += "`Recommend`, ";
                        sql += "`Type_A`, ";
                        sql += "`Type_B`, ";
                        sql += "`Type_C`, ";
                        sql += "`Preference`, ";
                        sql += "`Skin Type`, ";
                        sql += "`Weight`, ";
                        sql += "`Height`, ";
                        sql += "`Lifetime Index`, ";
                        sql += "`Adv Accept`, ";
                        sql += "`Issued Name`, ";
                        sql += "`Issued Date`, ";
                        sql += "`MemberStatus`, ";
                        sql += "`MemberBirthday`) ";


                        sql += "SELECT ";
                        sql += "Max(members_temp" + usrId + ".`Member Code`) AS `Member Code`, ";
                        sql += "Max(members_temp" + usrId + ".`Member Name`) AS `Member Name`, ";
                        sql += "Max(members_temp" + usrId + ".`Member ID`) AS `Member ID`, ";
                        sql += "Max(members_temp" + usrId + ".Address01) AS Address01, ";
                        sql += "Max(members_temp" + usrId + ".Address02) AS Address02, ";
                        sql += "Max(members_temp" + usrId + ".Address03) AS Address03, ";
                        sql += "Max(members_temp" + usrId + ".Postcode) AS Postcode, ";
                        sql += "Max(members_temp" + usrId + ".Location) AS Location, ";
                        sql += "Max(members_temp" + usrId + ".State) AS State, ";
                        sql += "Max(members_temp" + usrId + ".Country) AS Country, ";
                        sql += "Max(members_temp" + usrId + ".Sex) AS Sex, ";
                        sql += "Max(members_temp" + usrId + ".`Phone-Mobile`) AS `Phone-Mobile`, ";
                        sql += "Max(members_temp" + usrId + ".`Phone-Home`) AS `Phone-Home`, ";
                        sql += "Max(members_temp" + usrId + ".`Phone-Office`) AS `Phone-Office`, ";
                        sql += "Max(members_temp" + usrId + ".Fax) AS Fax, ";
                        sql += "Max(members_temp" + usrId + ".Email) AS Email, ";
                        sql += "Max(members_temp" + usrId + ".Occupation) AS Occupation, ";
                        sql += "Max(members_temp" + usrId + ".`Language`) AS Language, ";
                        sql += "Max(members_temp" + usrId + ".Race) AS Race, ";
                        sql += "Max(members_temp" + usrId + ".Recommend) AS Recommend, ";
                        sql += "Max(members_temp" + usrId + ".Type_A) AS Type_A, ";
                        sql += "Max(members_temp" + usrId + ".Type_B) AS Type_B, ";
                        sql += "Max(members_temp" + usrId + ".Type_C) AS Type_C, ";
                        sql += "Max(members_temp" + usrId + ".Preference) AS Preference, ";
                        sql += "Max(members_temp" + usrId + ".`Skin Type`) AS `Skin Type`, ";
                        sql += "Max(members_temp" + usrId + ".Weight) AS Weight, ";
                        sql += "Max(members_temp" + usrId + ".Height) AS Height, ";
                        sql += "Max(members_temp" + usrId + ".`Lifetime Index`) AS `Lifetime Index`, ";
                        sql += "Max(members_temp" + usrId + ".`Adv Accept`) AS `Adv Accept`, ";
                        sql += "Max(members_temp" + usrId + ".`Issued Name`) AS `Issued Name`, ";
                        sql += "Max(members_temp" + usrId + ".`Issued Date`) AS `Issued Date`, ";
                        sql += "Max(members_temp" + usrId + ".MemberStatus) AS MemberStatus, ";
                        sql += "GETAGE(members_temp" + usrId + ".`Member ID`) AS Birthday ";
                        sql += "FROM idcheck ";
                        sql += "RIGHT JOIN members_temp" + usrId + " ON idcheck.MasterID = members_temp" + usrId + ".masteridtmp ";
                        sql += "WHERE idcheck.MasterID IS NULL ";
                        sql += "GROUP BY members_temp" + usrId + ".masteridtmp";

                        // drugi

                        db.execute(sql).then(result => {
                            // console.log('******************** INSERT INTO MEMBERS INFO *************************');
                            // console.log(result);
                            // console.log('************************ END MEMBERS INFO *****************************');
                            let inf2 = result[0].affectedRows;

                            info['Members table'] = inf2;
                            console.log('5. ----- Successfully inserted into members table');
                            end = +new Date();  // log end timestamp
                            diff = end - start;
                            console.log('Done in: ', diff.toLocaleString(), ' seconds');
                            console.log('------------------------------------------------------------------------');
                            // ide treci

                            sql = "INSERT IGNORE INTO `uploads` (cat_id, mem_id, uploadby) ";
                            sql += "select " + category + " AS `c_id`, `members`.`ID` AS `m_id`, " + usrId + " AS upl ";
                            sql += "from (`members_temp" + usrId + "` left join `members` on(((`members`.`Member ID` = `members_temp" + usrId + "`.`Member ID`) and (`members`.`Phone-Mobile` = `members_temp" + usrId + "`.`Phone-Mobile`)))) ";
                            sql += "group by `members_temp" + usrId + "`.`Member ID`,`members_temp" + usrId + "`.`Phone-Mobile`";
                            //  console.log(sql);
                            db.execute(sql).then(result => {

                                // console.log('******************** INSERT INTO UPLOADS INFO *************************');
                                // console.log(result);
                                // console.log('************************ END UPLOADS INFO *****************************');
                                let inf3 = result[0].affectedRows;

                                info['Upload table'] = inf3;
                                console.log('6. ----- Successfully inserted into upload table');
                                console.log('------------------------------------------------------------------------');
                                end = +new Date();  // log end timestamp
                                diff = end - start;
                                console.log('Done in: ', diff.toLocaleString(), ' seconds');
                                fs.unlinkSync(file);
                                fs.unlinkSync(file + '.csv');
                                // console.log('INFO:', inf);
                                // console.log('INFO:', inf2);
                                // console.log('INFO:', inf3);
                                sql = "INSERT INTO user_history (userid, total_records, inserted_in_members, inserted_in_upload, duplicates) ";
                                sql += "VALUES (" + usrId + ", " + inf + ", " + inf2 + ", " + inf3 + ", " + (Number(inf) - Number(inf3)) + ");";
                                db.execute(sql).then(result => {
                                    // console.log('Added to user history');
                                    // console.log(result);
                                }).catch(err => {
                                    console.log('Error updating user history: ', err);
                                });

                                sql = "DROP TABLE IF EXISTS `members_temp" + usrId + "`; "; //this is async, can wait
                                // sqldrop += "DROP TABLE IF EXISTS `members_temp" + usrId + "_old`; "; //this is async, can wait
                                db.query(sql).then(result => {
                                    console.log('FINISH!!!! Old temp table deleted FINISH!!!!');
                                }).catch(err => {
                                    console.log(err);
                                });

                                return res.status(200).json({
                                    'Total Records in import file': inf,
                                    'Inserted in members table': inf2,
                                    'Inserted in upload table': inf3,
                                    'Duplicates': Number(inf) - Number(inf3)
                                });
                            }).catch(err => { console.log(err); });
                            return;
                        }).catch(err => { console.log(err); });
                        return;
                        // END OF PROMISE
                    }).catch(err => {
                        console.log(err);
                        return res.status(500).json({
                            message: 'Something is wrong with file upload!'
                        });

                    });
                    // }).catch(err => {
                    //     console.log(err);
                    //     return res.status(406).json({
                    //         message: 'Something is wrong deleting temp table!'
                    //     });
                    // });

                });        // end getLine
                // END PREPARE tmpTable


            });
            //});
        }).catch(err => {
            console.log('Error creating temp table', err);
        });
        // end delete temp first!
    }).catch(err => {
        console.log(err);
    });



}
