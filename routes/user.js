const lignator = require('lignator')
const formidable = require('formidable')
const extract = require("extract-zip")
const zipper = require('zip-local')
const XLSX = require('xlsx')
global.storage = require("./storage.js");
//TIME OUT
const minutes = 15
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))

//-----------------------------------------------login page call------------------------------------------------------
exports.login = function (req, res) {
    var message = ''

    if (req.method == "POST") {
        var post = req.body
        var user = post.user_name
        var pass = post.password
        if (!/^[a-z0-9]+$/.test(user) || !/^[A-Za-z0-9\d=!\-@._*]*$/.test(pass)) { // check user or pass is valid
            message = 'Incorrect username or password'
            res.render('index.ejs', { message: message })
            return;
        }
        var role = (post.role == "Student") ? "student_account" : "teacher_account" // select type account
        var hash = crypto.createHash('md5').update(pass).digest("hex") // encrypt pass md5
        var ipaddress = (req.headers['x-forwarded-for'] || // get ip address
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress).split(",")[0]
        if (ipaddress.includes(':')) {
            ipaddress = ipaddress.replace(/\:/g, '')
        }
        if (ipaddress.includes('.')) {
            ipaddress = ipaddress.replace(/\./g, '-')
        }
        var sql = ""
        if (role == "student_account") { // if student
            var sql = "SELECT userId, username FROM " + role + " WHERE (username='" + user + "' and password = '" + hash + "' and ip='" + ipaddress + "') or (username='" + user + "' and password = '" + hash + "' and " + new Date().getTime() + " >= ROUND(UNIX_TIMESTAMP(timeout) * 1000) and islogin=0)"
            db.query(sql, function (err, results) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                if (results.length) {
                    req.session.userId = results[0].userId
                    req.session.role = post.role
                    req.session.user = results[0].username
                    req.session.ipaddress = ipaddress
                    // record ip and timeout
                    sql = "UPDATE student_account SET ip='" + ipaddress + "',timeout='" + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + minutes * 60000).toISOString().substring(0, 19) + "', islogin=1 WHERE userId='" + results[0].userId + "'"
                    db.query(sql)
                    logger.info(req.session.role + " " + req.session.user + " has conected")
                    res.redirect('/home/dashboard')
                } else {
                    message = 'Incorrect username or password'
                    res.render('index.ejs', { message: message })
                }
            })

        } else { // teacher
            sql = "SELECT userId, username, rollnumber FROM " + role + " WHERE username='" + user + "' and password = '" + hash + "'"
            db.query(sql, function (err, results) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                if (results.length) {
                    req.session.userId = results[0].userId
                    req.session.role = post.role
                    req.session.user = results[0].username
                    req.session.ipaddress = ipaddress
                    logger.info(req.session.role + " " + req.session.user + " has conected")
                    res.redirect('/home/dashboard')
                } else {
                    message = 'Incorrect username or password'
                    res.render('index.ejs', { message: message })
                }

            })
        }
    } else {
        res.render('index.ejs', { message: message })
    }

}
//-----------------------------------------------dashboard page functionality----------------------------------------------

exports.dashboard = function (req, res, next) {
    var userId = req.session.userId  
    if (userId == null) {
        res.redirect("/login")
        return
    }
    res.render('dashboard.ejs', { role: req.session.role, user: req.session.user })
}
//------------------------------------logout functionality----------------------------------------------
exports.logout = function (req, res) {
    if (req.session.role == "Student") { // update record ip address and time out
        var sql = "UPDATE student_account SET ip='" + req.session.ipaddress + "',timeout='" + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + minutes * 60000).toISOString().substring(0, 19) + "', islogin=0 WHERE userId='" + req.session.userId + "'"
        db.query(sql)
    }
    logger.info(req.session.role + " " + req.session.user + " has disconected")
    req.session.destroy(function (err) {
        res.redirect("/login")
    })
}
//--------------------------------render user details after login--------------------------------
exports.profile = function (req, res) {
    var userId = req.session.userId,
        role = (req.session.role == "Student") ? "student_account" : "teacher_account"
    if (userId == null) {
        res.redirect("/login")
        return
    }
    var sql = "SELECT name FROM " + role + " WHERE userId='" + userId + "'"
    db.query(sql, function (err, result) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        res.render('profile.ejs', { data: result, role: req.session.role, user: req.session.user })
    })
}

//---------------------------------contest----------------------------------
exports.contest = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    var sql = "SELECT contest_id, contest_name, time_begin, time_end FROM contest WHERE teacher_id='" + userId + "' AND deleted=0"
    db.query(sql, function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        res.render('contest.ejs', { data: results, role: req.session.role, user: req.session.user })
    })
}
//---------------------------------Add a new contest----------------------------------
exports.add_contest = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    if (req.method == "POST") {
        var post = req.body
        var contest_name = post.contest_name.replace(/ /g, '-')
        var time_begin = post.time_begin
        var time_end = post.time_end
        var formatTimeBegin = new Date(formatTime(time_begin))
        var formatTimeEnd = new Date(formatTime(time_end))
        if (contest_name !== "" && ValidateDate(time_begin) && ValidateDate(time_end) && formatTimeBegin < formatTimeEnd) {
            // create 4 folder when add new contest
            if (!fs.existsSync(storage.BAILAM + contest_name)) {
                fs.mkdirSync(storage.BAILAM + contest_name)
            }
            if (!fs.existsSync(storage.DEBAI + contest_name)) {
                fs.mkdirSync(storage.DEBAI + contest_name)
            }
            if (!fs.existsSync(storage.TESTCASE + contest_name)) {
                fs.mkdirSync(storage.TESTCASE + contest_name)
            }
            if (!fs.existsSync(storage.NOPBAI + 'Logs/' + contest_name)) {
                fs.mkdirSync(storage.NOPBAI + 'Logs/' + contest_name)
            }
            // add contest to db
            var sql = "INSERT INTO contest(contest_name, teacher_id, time_begin, time_end) VALUES ('" + contest_name + "', '" + userId + "', '" + formatTime(time_begin) + "', '" + formatTime(time_end) + "')"
            db.query(sql, function (err) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                logger.info("Create contest " + contest_name +  " by " + userId)
                res.redirect("/contest")
            })
        } else {
            logger.info("Create contest fail")
            res.redirect("/contest")
        }
    } else {
        res.redirect("/error")
        return
    }
}
//---------------------------------Delete a contest----------------------------------
exports.delete_contest = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    if (req.method == "POST") {
        var post = req.body
        var contest_id = post.contest_id
        var contest_name = post.contest_name.replace(/ /g, '-')
        try {
            if (fs.existsSync(storage.BAILAM + contest_name)) {
                fs.renameSync(storage.BAILAM + contest_name, storage.BAILAM + '$' + contest_name)
            }
            if (fs.existsSync(storage.DEBAI + contest_name)) {
                fs.renameSync(storage.DEBAI + contest_name, storage.DEBAI + '$' + contest_name)
            }
            if (fs.existsSync(storage.TESTCASE + contest_name)) {
                fs.renameSync(storage.TESTCASE + contest_name, storage.TESTCASE + '$' + contest_name)
            }
            if (fs.existsSync(storage.NOPBAI + 'Logs/' + contest_name)) {
                fs.renameSync(storage.NOPBAI + 'Logs/' + contest_name, storage.NOPBAI + 'Logs/$' + contest_name)
            }
            // update status contest.deleted=1, student_account.in_contest=0
            var sql = "SELECT rollnumber FROM student_account WHERE contest_id=" + contest_id
            db.query(sql, function (err, results) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                for (let i = 0, l = results.length; i < l; ++i) {
                    fs.rename(storage.BAILAM + '$' + contest_name + '/' + results[i].rollnumber, storage.BAILAM + '$' + contest_name + '/$' + results[i].rollnumber, function (err) {
                        if (err) { logger.error(err); res.redirect("/error"); return }
                    })
                }
                sql = "UPDATE contest SET deleted=1 WHERE contest_id=" + contest_id
                db.query(sql);
                sql = "UPDATE student_account SET contest_id=0 WHERE contest_id=" + contest_id
                db.query(sql)
                logger.info("Contest " + contest_id + " has deleted")
                res.redirect("/contest")
            })
        } catch (error) {
            logger.error(error)
            res.redirect("/error")
            return
        }
    } else {
        res.redirect("/error")
        return
    }
}
//---------------------------------Edit a contest----------------------------------
exports.edit_contest = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    if (req.method == "POST") {
        var post = req.body
        var contest_id = post.contest_id
        var contest_name = post.contest_name
        var time_begin = post.time_begin
        var time_end = post.time_end
        var formatTimeBegin = new Date(formatTime(time_begin))
        var formatTimeEnd = new Date(formatTime(time_end))
        if (contest_name !== "" && ValidateDate(time_begin) && ValidateDate(time_end) && formatTimeBegin < formatTimeEnd) {
            // update contest_name, time_begin, time_end
            var sql = "UPDATE contest SET contest_name='" + contest_name + "',time_begin='" + formatTime(time_begin) + "',time_end='" + formatTime(time_end) + "' WHERE contest_id=" + contest_id
            db.query(sql, function (err) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                logger.info("Contest " + contest_id + " has changed time to begin:" + formatTime(time_begin) +  ", end: " + formatTime(time_end))
                res.redirect("/contest/detail?contest_id=" + contest_id)
            })
        } else {
            res.redirect("/contest/detail?contest_id=" + contest_id)
        }
    } else {
        res.redirect("/error")
        return
    }
}
//---------------------------------Download a contest----------------------------------
exports.download = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    var contest_id = req.query.contest_id
    var sql = "SELECT contest_name from contest WHERE contest_id=" + contest_id
    db.query(sql, function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        var contest_name = results[0].contest_name.replace(/ /g, '-')
        // zip folder "./public/thumucbailam/ contest_name
        zipper.sync.zip(storage.BAILAM + contest_name).compress().save("./public/download/" + contest_name + ".zip")
        logger.info("Contest " + contest_id + " has downloaded")
        res.download("./public/download/" + contest_name + ".zip") // download file .zip
    })
}
//---------------------------------contest-detail-get----------------------------------
exports.contest_detail = function (req, res) {
    var userId = req.session.userId
    var contest_id = req.query.contest_id
    if (userId == null) {
        res.redirect("/login")
        return
    }
    if (contest_id == null) {
        res.redirect("/contest")
        return
    }
    var message = ""
    if (req.session.deleted) { // check student is deleted in contest
        req.session.deleted = false
        message = "Succesfully! Students have been deleted."
    }
    var sql = "SELECT student_account.userId, student_account.rollnumber, student_account.name, student_account.class, contest.contest_id, contest.contest_name,contest.time_begin,contest.time_end FROM contest " +
        "INNER JOIN student_account ON student_account.contest_id=contest.contest_id " +
        "WHERE contest.contest_id=" + contest_id
    db.query(sql, function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        if (results.length == 0) { // if no student in contest
            sql = "SELECT contest_name, contest_id, time_begin, time_end FROM contest WHERE contest_id=" + contest_id
            db.query(sql, function (err, results) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                res.render('contest-detail.ejs', { data: results, totalStudent: 0, message: message, role: req.session.role, user: req.session.user })
            })
        } else { // at least 1 student
            res.render('contest-detail.ejs', { data: results, totalStudent: results.length, message: message, role: req.session.role, user: req.session.user })
        }

    })

}
//---------------------------------delete selected user----------------------------------
exports.delete_user = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    if (req.method == "POST") {
        var post = req.body
        var list_rollnumber = post.list_rollnumber
        var contest_id = post.contest_id
        var contest_name = post.contest_name.replace(/ /g, '-')
        if (list_rollnumber != "") { // // if has student in deleted list
            var list = list_rollnumber.split(",")
            var sql = "UPDATE student_account SET contest_id=0 WHERE "
            // update contest_id=0 in student_account
            for (let i = 0, l = list.length; i < l; ++i) {
                sql += "rollnumber='" + list[i] + "' OR "
                fs.rename(storage.BAILAM + contest_name + '/' + list[i], storage.BAILAM + contest_name + '/$' + list[i], function (err) {
                    if (err) { logger.error(err); res.redirect("/error"); return }
                })
            }
            sql = sql.slice(0, -4)
            db.query(sql, function (err) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                req.session.deleted = true
                logger.info(list.length + " students in contest " + contest_id + " has deleted: " + list)
                sleep(500).then(() => {
                    res.redirect("/contest/detail?contest_id=" + contest_id)
                })
            })
            
        } 
    } else {
        res.redirect("/error")
        return
    }
}
//---------------------------------load user----------------------------------
exports.load_user = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    var message = ""
    var error = ""
    var warning = ""
    if (req.session.added) {
        req.session.added = false
        message = "Succesfully! Students have been added."
    }
    var class_name = req.query.class_name
    var contest_id = req.query.contest_id
    var sql = "SELECT rollnumber, name, class FROM student_account WHERE class='" + class_name + "' and contest_id=0"
    db.query(sql, function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        if (results.length == 0) { // if query empty
            sql = "SELECT rollnumber FROM student_account WHERE class='" + class_name + "' LIMIT 1"
            db.query(sql, function (err, results) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                if (results.length == 0) {
                    error = "Sorry, the system cannot find class " + class_name
                    res.render('add-user.ejs', { data: results, contest_id: contest_id, message: message, error: error, warning: warning, class_name: class_name, role: req.session.role, user: req.session.user })
                    return
                } else {
                    warning = "All student are in contest"
                    res.render('add-user.ejs', { data: [], contest_id: contest_id, message: message, error: error, warning: warning, class_name: class_name, role: req.session.role, user: req.session.user })
                    return
                }
            })
        } else {
            res.render('add-user.ejs', { data: results, contest_id: contest_id, message: message, error: error, warning: warning, class_name: class_name, role: req.session.role, user: req.session.user })
        }
    })

}
//---------------------------------add user----------------------------------
exports.add_user = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    if (req.method == "POST") {
        var post = req.body
        var list_rollnumber = post.list_rollnumber
        var contest_id = post.contest_id
        var class_name = post.class_name

        if (list_rollnumber != "") { // if has student in added list
            var sql = "SELECT contest_name FROM contest WHERE contest_id=" + contest_id
            db.query(sql, function (err, results) {
                if (err || results.length == 0) { logger.error(err); res.redirect("/error"); return }
                var contest_name = results[0].contest_name.replace(/ /g, '-')
                var list = list_rollnumber.split(",")
                var sql = "UPDATE student_account SET contest_id=" + contest_id + " WHERE "
                for (let i = 0, l = list.length; i < l; ++i) {
                    // create a new folder contains submission files of student
                    if (!fs.existsSync(storage.BAILAM + contest_name + '/' + list[i])) {
                        fs.mkdirSync(storage.BAILAM + contest_name + '/' + list[i])
                    }
                    // update contest_id in student_account
                    sql += "rollnumber='" + list[i] + "' OR "
                }
                sql = sql.slice(0, -4)
                db.query(sql, function (err) {
                    if (err) { logger.error(err); res.redirect("/error"); return }
                    logger.info(list.length + " students in contest " + contest_id + " has added: " + list)
                    sleep(500).then(() => {
                        res.redirect("/contest/load-user?class_name=" + class_name + "&contest_id=" + contest_id)
                    })
                })
            })
            req.session.added = true
        }
    } else {
        res.redirect("/error")
        return
    }
}
//---------------------------------Load class----------------------------------
exports.load_class = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    try {
        //read file excel
        var class_name = req.query.class_name
        var workbook = XLSX.readFile(storage.EXCEL + class_name + '.xls')
        var sheet_name_list = workbook.SheetNames
        var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
        if (typeof xlData[0].RollNumber === "undefined" || typeof xlData[0].MemberCode === "undefined" || typeof xlData[0].FullName === "undefined") {
            res.render('add-class.ejs', { data: [], xlData: "", message: "", error: "Invalid file excel", class_name: class_name, role: req.session.role, user: req.session.user })
        } else {
            if (req.session.sql_err) {
                req.session.sql_err = false
                res.render('add-class.ejs', { data: [], xlData: xlData, message: "", error: "Duplicate student roll number", class_name: class_name, role: req.session.role, user: req.session.user })
            } else {
                res.render('add-class.ejs', { data: [], xlData: xlData, message: "Load students successfully!", error: "", class_name: class_name, role: req.session.role, user: req.session.user })
            }
        }
    } catch (error) {
        logger.error(error)
        res.redirect("/error")
        return
    }
}
//---------------------------------Add class----------------------------------
exports.add_class = function (req, res) {
    if (req.method == "POST") {
        var form = new formidable.IncomingForm()
        form.parse(req, function (err, fields, files) {
            if (err) { logger.error(err); res.redirect("/error"); return }
            var class_name = fields.class_name
            if (files.filetoupload.name == "" || class_name == "") { // check file name is empty
                res.render('add-class.ejs', { data: [], xlData: "", message: "", error: "The input must be not empty!", class_name: class_name, role: req.session.role, user: req.session.user })
                return
            }
            // check class is exist
            var sql = "SELECT rollnumber FROM student_account WHERE class='" + class_name + "' LIMIT 1"
            db.query(sql, function (err, results) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                if (results.length > 0) { // if class is exist, return error
                    res.render('add-class.ejs', { data: [], xlData: "", message: "", error: "Sorry, class " + class_name + " is exist!", class_name: class_name, role: req.session.role, user: req.session.user })
                    return
                }
                // get file upload and rewrite it 
                var newfile = class_name + '.xls'
                var oldpath = files.filetoupload.path
                var newpath = storage.EXCEL + newfile
                fs.readFile(oldpath, function (err, data) {
                    if (err) { logger.error(err); res.redirect("/error"); return }
                    // Write the file
                    fs.writeFile(newpath, data, function (err) {
                        if (err) { logger.error(err); res.redirect("/error"); return }
                    })
                    // Delete the file
                    fs.unlink(oldpath, function (err) {
                        if (err) { logger.error(err); res.redirect("/error"); return }
                    })
                    sleep(500).then(() => {
                        logger.info("Load file excel " + path.basename(newpath))
                        res.redirect("/contest/load-class?class_name=" + class_name)
                    })
                })
            })
        })
    } else {
        res.redirect("/error")
        return
    }
}
//-----------------------------------------------Create Class------------------------------------------------------
exports.create_class = function (req, res) {
    if (req.method == "POST") {
        var post = req.body
        var RollNumber = post.RollNumber.split(',')
        var MemberCode = post.MemberCode.split(',')
        var FullName = post.FullName.split(',')
        var class_name = post.class_name
        var password = post.password
        if (password == "") {
            password = "fpt@user"
        }
        var sql = "INSERT INTO student_account(rollnumber, username, password, name, class) VALUES ";
        for (let i = 0; i < RollNumber.length; i++) {
            var hash = crypto.createHash('md5').update(password).digest("hex")
            sql += "('" + RollNumber[i] + "','" + MemberCode[i] + "', '" + hash + "','" + FullName[i] + "','" + class_name + "'),"
        }
        sql = sql.slice(0, -1)
        db.query(sql, function (err) {
            if (err) {
                req.session.sql_err = true
                res.redirect("/contest/load-class?class_name=" + class_name)
            } else {
                logger.info(RollNumber.length + " students has added to database: " + RollNumber)
                req.session.added = true
                res.redirect('/contest/add-class')
            }
        })

    } else {
        res.redirect("/error")
        return
    }
}
// get folder in Directories
function getFolders(srcpath) {
    try {
        return fs.readdirSync(srcpath)
            .map(file => path.join(srcpath, file))
            .filter(path => fs.statSync(path).isDirectory())
    } catch (error) {
    }
}
//---------------------------------add problem----------------------------------
exports.add_problem = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    var error = ""
    var message = ""
    if (req.session.upload_err) {
        req.session.upload_err = false
        error = "Upload error!"
    }
    if (req.session.upload_success) {
        req.session.upload_success = false
        message = "Upload successfully!"
    }
    var contest_id = req.query.contest_id
    var problem_id = []
    var path_problem = []
    var path_testcase = []
    var testcase_size = []
    var limitSub = []
    var contest_name = ''
    var sql = "SELECT contest_name, problem_id, path_problem, path_testcase, times FROM contest_detail INNER JOIN contest ON contest_detail.contest_id = contest.contest_id WHERE contest_detail.contest_id=?"
    db.query(sql, [contest_id], function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        if (results.length == 0) {
            sql = "SELECT contest_name FROM contest WHERE contest_id=?"
            db.query(sql, [contest_id], function (err, results) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                contest_name = results[0].contest_name
                res.render('add-problem.ejs', { problem_id: problem_id, path_problem: path_problem, path_testcase: path_testcase, testcase_size: testcase_size, limitSub: limitSub, contest_id: contest_id, contest_name: contest_name, error: error, message: message, role: req.session.role, user: req.session.user })
            })
        } else {
            contest_name = results[0].contest_name
            for (let i = 0, l = results.length; i < l; i++) {
                problem_id.push(results[i].problem_id)
                path_problem.push(results[i].path_problem)
                path_testcase.push(results[i].path_testcase)
                testcase_size.push(getFolders(results[i].path_testcase).length) // testcase size
                limitSub.push(results[i].times)
            }
            res.render('add-problem.ejs', { problem_id: problem_id, path_problem: path_problem, path_testcase: path_testcase, testcase_size: testcase_size, limitSub: limitSub, contest_id: contest_id, contest_name: contest_name, error: error, message: message, role: req.session.role, user: req.session.user })
        }
    })
}
//---------------------------------upload problem and testcase----------------------------------
exports.add_problem_testcase = function (req, res) {
    if (req.session.role == "Student") {
        res.redirect("/error")
        return
    }
    if (req.method == "POST") {
        // upload problem to folder './public/debai/contest_name
        var form = new formidable.IncomingForm()
        form.maxFileSize = 5 * 1024 * 1024 // limit upload 5mb
        form.parse(req, function (err, fields, files) {
            var contest_id = fields.contest_id
            // check file is valid
            var type = files.filetouploadProblem.name.substring(files.filetouploadProblem.name.length - 4)
            if (err || files.filetouploadProblem.name == "" || (type !== "docx" && type !== ".doc" && type !== ".pdf") || fields.nameProb == "" || fields.limitSub == "") {
                req.session.upload_err = true
                res.redirect("/contest/add-problem?contest_id=" + contest_id)
                return
            }
            if (err || files.filetouploadTestcase.name == "" || files.filetouploadTestcase.name.substring(files.filetouploadTestcase.name.length - 4) !== ".zip") {
                req.session.upload_err = true
                res.redirect("/contest/add-problem?contest_id=" + contest_id)
                return
            }
            var contest_name = fields.contest_name
            var oldpathProb = files.filetouploadProblem.path
            var newpathProb = storage.DEBAI + contest_name + '/' + files.filetouploadProblem.name
            fs.readFile(oldpathProb, function (err, data) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                // Write the file
                fs.writeFile(newpathProb, data, function (err) {
                    if (err) { logger.error(err); res.redirect("/error"); return }
                })
                // Delete the file
                fs.unlink(oldpathProb, function (err) {
                    if (err) { logger.error(err); res.redirect("/error"); return }
                })
                var oldpathTest = files.filetouploadTestcase.path
                var newpathTest = storage.TESTCASE + contest_name + '/' + files.filetouploadTestcase.name
                var sql = "INSERT INTO contest_detail VALUES (?,?,?,?,?)"
                db.query(sql, [contest_id, fields.nameProb, newpathProb, newpathTest.substring(0, newpathTest.length - 4), fields.limitSub], function (err) {
                    if (err) {
                        req.session.upload_err = true
                        return res.redirect("/contest/add-problem?contest_id=" + contest_id)
                    }
                    fs.readFile(oldpathTest, function (err, data) {
                        if (err) { logger.error(err); res.redirect("/error"); return }
                        // Write the file
                        fs.writeFile(newpathTest, data, function (err) {
                            if (err) { logger.error(err); res.redirect("/error"); return }
                        })
                        // Delete the file
                        fs.unlink(oldpathTest, function (err) {
                            if (err) { logger.error(err); res.redirect("/error"); return }
                        })
                        try { // extract file .zip
                            extract(newpathTest, { dir: public_dir + storage.TESTCASE.substring(8) + contest_name })
                            sleep(1000).then(() => {
                                checkTestcase(newpathTest.substring(0, newpathTest.length - 4), req)
                                if (!req.session.upload_err) {
                                    req.session.upload_success = true
                                }
                                logger.info("Upload problem contest " + contest_id + " : " + files.filetouploadProblem.name + " .Testcase: " + files.filetouploadTestcase.name)
                                res.redirect("/contest/add-problem?contest_id=" + contest_id)
                            })
                        } catch (err) {
                            if (err) { logger.error(err); res.redirect("/error"); return }
                        }
                    })
                })
            })
        })
    } else {
        res.redirect("/error")
        return
    }
}
// Check testcase is valid
function checkTestcase(dir, req) {
    var results = []
    try {
        var list = fs.readdirSync(dir)
        list.forEach(function (file) {
            file = dir + '/' + file
            var stat = fs.statSync(file)
            if (stat && stat.isDirectory()) {
                /* Recurse into a subdirectory */
                results = results.concat(checkTestcase(file))
            } else {
                /* Is a file */
                var type = file.substring(file.length - 4)
                if (type !== ".inp" && type !== ".out") {
                    req.session.upload_err = true
                    return
                }
            }
        })
    } catch (error) {
        req.session.upload_err = true
    }
}
//---------------------------------edit problem and testcase----------------------------------
exports.edit_problem_testcase = function (req, res) {
    if (req.session.role == "Student") {
        res.redirect("/error")
        return
    }
    if (req.method == "POST") {
        var post = req.body
        var limitSubEdit = post.limitSubEdit
        var contest_id = post.contest_id
        var problem_id = post.problem_id
        var sql = "UPDATE contest_detail SET times=? WHERE contest_id=? AND problem_id=?"
        db.query(sql, [limitSubEdit, contest_id, problem_id], function (err) {
            if (err) { logger.error(err); res.redirect("/error"); return }
            logger.info("Update submission times of contest " + contest_id + " and problem " + problem_id + " to " + limitSubEdit)
            res.redirect("/contest/add-problem?contest_id=" + contest_id)
        })
    } else {
        res.redirect("/error")
        return
    }
}
//---------------------------------delete problem and testcase----------------------------------
exports.delete_problem_testcase = function (req, res) {
    if (req.session.role == "Student") {
        res.redirect("/error")
        return
    }
    if (req.method == "POST") {
        var post = req.body
        var contest_id = post.contest_id
        var problem_id = post.problem_id_del
        var sql = "DELETE FROM contest_detail WHERE contest_id=? AND problem_id=?"
        db.query(sql, [contest_id, problem_id], function (err) {
            if (err) { logger.error(err); res.redirect("/error"); return }
            logger.info("Delete in contest_detail where contest " + contest_id + " and problem " + problem_id)
            res.redirect("/contest/add-problem?contest_id=" + contest_id)
        })
    } else {
        res.redirect("/error")
        return
    }
}
//---------------------------------rank-time----------------------------------
exports.rank_time = function (req, res) {
    var userId = req.session.userId
    if (req.session.role == "Student") {
        res.redirect("/error")
        return
    }
    var sql = "SELECT contest_id, contest_name, time_begin, time_end FROM contest WHERE teacher_id='" + userId + "' AND deleted=0"
    db.query(sql, function (err, results) {
        if (err || results.length == 0) { logger.error(err); res.redirect("/error"); return }
        res.render('rank-time.ejs', { data: results, role: req.session.role, user: req.session.user })
    })
}
//---------------------------------data rank----------------------------------
exports.data_rank = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    var message = ""
    var contest_id = req.query.contest_id
    var sql = "SELECT rollnumber FROM student_account WHERE contest_id=" + contest_id + " LIMIT 1"
    db.query(sql, function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        if (results.length == 0) { // if No student in contest
            message = "No student in contest"
            res.render('data-rank.ejs', { data: [], problem_files: [], message: message, role: req.session.role, user: req.session.user })
        } else {
            sql = "SELECT contest.contest_name, contest.contest_id, contest.time_begin, contest.time_end, contest_detail.problem_id, contest_detail.path_problem FROM contest " +
                "INNER JOIN contest_detail ON contest.contest_id=contest_detail.contest_id " +
                "WHERE contest.contest_id=?"
            db.query(sql, [contest_id], function (err, results) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                if (results.length == 0) {
                    sql = "SELECT contest_name, contest_id, time_begin, time_end FROM contest WHERE contest_id=?"
                    db.query(sql, [contest_id], function (err, results) {
                        res.render('data-rank.ejs', { data: results, problem_files: [], message: message, role: req.session.role, user: req.session.user })
                    })
                } else {
                    var problem_files = []
                    for (let i = 0; i < results.length; ++i) {
                        problem_files.push(results[i].problem_id)
                    }
                    res.render('data-rank.ejs', { data: results, problem_files: problem_files, message: message, role: req.session.role, user: req.session.user })
                }
            })
        }
    })
}
//---------------------------------load rank -> json----------------------------------
exports.load_rank = function (req, res) {
    var contest_id = req.query.contest_id
    var sql = "SELECT student_account.userId, student_account.rollnumber, student_account.name, student_account.class, contest.contest_id, contest.contest_name, contest.time_begin, contest.time_end FROM contest " +
        "INNER JOIN student_account ON student_account.contest_id=contest.contest_id " +
        "WHERE contest.contest_id=?"
    db.query(sql, [contest_id], function (err, results) {
        if (err || results.length == 0) { logger.error(err); res.redirect("/error"); return }
        var contest_name = results[0].contest_name.replace(/ /g, '-')
        var problem_files = []
        var sql = "SELECT problem_id FROM contest_detail WHERE contest_id=?"
        db.query(sql, [contest_id], function (err, data) {
            if (err) { logger.error(err); res.redirect("/error"); return }
            if (data.length == 0) {
                var obj = {
                    data: []
                };
                for (let i = 0, l = results.length; i < l; ++i) {
                    tb = new Array()
                    tb.push('', results[i].rollnumber, results[i].name, results[i].class, 0, '<center>' + 0 + '</center>', '<center>' + 0 + '</center>');
                    obj.data.push(tb)
                }
                res.send(obj)
            } else {
                for (let i = 0; i < data.length; ++i) {
                    problem_files.push(data[i].problem_id)
                }
                // get all judged Logs in folder './public/nopbai/Logs/' + contest_name
                fs.readdir(storage.NOPBAI + 'Logs/' + contest_name, function (err, log_files) {
                    if (err) { logger.error(err); res.redirect("/error"); return }
                    log_files = log_files.map(function (fileName) {
                        return {
                            name: fileName,
                            time: fs.statSync(storage.NOPBAI + 'Logs/' + contest_name + '/' + fileName).mtime.getTime()
                        };
                    }).sort(function (a, b) {
                        return b.time - a.time
                    }).map(function (v) {
                        return v.name
                    });
                    var point = []
                    var times = []
                    var thoigian = []
                    var check = []
                    var validRollnum = []
                    for (let i = 0, l = results.length; i < l; ++i) {
                        point[results[i].rollnumber] = new Array()
                        times[results[i].rollnumber] = new Array()
                        thoigian[results[i].rollnumber] = new Array()
                        check[results[i].rollnumber] = new Array()
                        validRollnum.push(results[i].rollnumber)
                        for (let j = 0; j < problem_files.length; ++j) {
                            point[results[i].rollnumber][problem_files[j]] = "Not submit"
                            times[results[i].rollnumber][problem_files[j]] = 0
                            thoigian[results[i].rollnumber][problem_files[j]] = 0
                            check[results[i].rollnumber][problem_files[j]] = 0
                        }
                    }
                    for (let i = 0, l = log_files.length; i < l; ++i) {
                        rollnum = log_files[i].split('][')[3]
                        if (!validRollnum.includes(rollnum)) continue
                        if (!problem_files.includes(log_files[i].split('][')[4].split('].')[0])) {
                            continue;
                        }
                        prob = log_files[i].split('][')[4].split('].')[0]
                        if (!check[rollnum][prob]) {
                            var contents = fs.existsSync(storage.NOPBAI + 'Logs/' + results[0].contest_name.replace(/ /g, '-') + '/' + log_files[i]) ? fs.readFileSync(storage.NOPBAI + 'Logs/' + results[0].contest_name.replace(/ /g, '-') + '/' + log_files[i], 'utf8') : "";
                            if (!contents.split('\n')[0].includes('Error')) {
                                point[rollnum][prob] = parseFloat(contents.split('\n')[0])
                                thoigian[rollnum][prob] = Math.max(parseInt(log_files[i].split('][')[1]), thoigian[rollnum][prob])
                            } else {
                                point[rollnum][prob] = 0.0
                            }
                            check[rollnum][prob] = 1
                        }
                        times[rollnum][prob]++
                    }
                    var totalpoint = []
                    var totaltimes = []
                    var totalthoigian = []
                    for (let i = 0, l = results.length; i < l; ++i) {
                        totalpoint[results[i].rollnumber] = 0
                        totaltimes[results[i].rollnumber] = 0
                        totalthoigian[results[i].rollnumber] = 0

                        for (let j = 0, l = problem_files.length; j < l; ++j) {
                            
                            totaltimes[results[i].rollnumber] += times[results[i].rollnumber][problem_files[j]]
                            // var pen = 0;
                            // if (times[results[i].rollnumber][problem_files[j]] > 1) {
                            //     pen = (times[results[i].rollnumber][problem_files[j]] - 1) * 60000 * 15
                            // }
                            if (isNaN(point[results[i].rollnumber][problem_files[j]]) == false && point[results[i].rollnumber][problem_files[j]] > 0) {
                                if (point[results[i].rollnumber][problem_files[j]] > 1) {
                                    point[results[i].rollnumber][problem_files[j]] *= (1 - (times[results[i].rollnumber][problem_files[j]] - 1) * 0.1)
                                }
                                totalpoint[results[i].rollnumber] += parseFloat(point[results[i].rollnumber][problem_files[j]])
                                totalthoigian[results[i].rollnumber] = Math.max(thoigian[results[i].rollnumber][problem_files[j]], totalthoigian[results[i].rollnumber])
                            } else {
                                totalpoint[results[i].rollnumber] += 0.0
                            }
                            
                        }
                    }
                    var obj = {
                        data: []
                    };
                    for (let i = 0, l = results.length; i < l; ++i) {
                        tb = new Array()
                        tb.push('', results[i].rollnumber, results[i].name, results[i].class, totalthoigian[results[i].rollnumber])

                        for (let j = 0, l = problem_files.length; j < l; ++j) {
                            if (point[results[i].rollnumber][problem_files[j]] > 0) {
                                tb.push("<center class='solved'>" + point[results[i].rollnumber][problem_files[j]].toFixed(2) + '<br>(' + times[results[i].rollnumber][problem_files[j]] + ')</center>')
                            } else if (point[results[i].rollnumber][problem_files[j]] == 0) {
                                tb.push("<center class='attempted'>" + point[results[i].rollnumber][problem_files[j]] + '<br>(' + times[results[i].rollnumber][problem_files[j]] + ')</center>')
                            } else {
                                tb.push("<center>" + point[results[i].rollnumber][problem_files[j]] + '<br>(' + times[results[i].rollnumber][problem_files[j]] + ')</center>')
                            }
                        }
                        if (totaltimes[results[i].rollnumber] == 0) {
                            tb.push('<center>Not submit<br>(0)</center>')
                        } else {
                            tb.push('<center>' + totalpoint[results[i].rollnumber].toFixed(2) + '<br>(' + totaltimes[results[i].rollnumber] + ')</center>')
                        }
                        obj.data.push(tb)
                    }
                    res.send(obj)
                })
            }
        })
    })

}
//---------------------------------rank detail----------------------------------
exports.detail_rank = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    var rollnumber = req.query.rollnumber
    var sql = "SELECT contest.contest_name, contest.contest_id FROM contest INNER JOIN student_account ON student_account.contest_id=contest.contest_id WHERE student_account.rollnumber='" + rollnumber + "'"
    db.query(sql, function (err, results) {
        if (err || results.length == 0) { logger.error(err); res.redirect("/error"); return }
        var contest_name = results[0].contest_name.replace(/ /g, '-')
        var contest_id = results[0].contest_id
        // get all judged Logs in folder './public/nopbai/Logs/contest_name
        fs.readdir(storage.NOPBAI + 'Logs/' + contest_name, function (err, files) {
            if (err) { logger.error(err); res.redirect("/error"); return }
            var log_files = []
            var testcase_size = []
            for (let i = 0, l = files.length; i < l; i++) {
                if (files[i].includes(rollnumber)) {
                    log_files.push(files[i])
                }
            }
            // get all submissions of students in folder './public/thumucbailam/contest_name/rollnumber
            var bailam = traverseDir(storage.BAILAM + contest_name + '/' + rollnumber)
            var logs = []
            for (let i = 0; i < bailam.length; ++i) {
                for(let j = 0; j < log_files.length; ++j) {
                    if (bailam[i].includes(log_files[j].substring(0, log_files[j].length - 4))) {
                        logs.push(log_files[j])
                        var tmp = log_files[j].split('][')[log_files[j].split('][').length - 1].split('].')[0]
                        testcase_size.push(getFolders(storage.TESTCASE + contest_name + '/' + tmp).length)
                        break
                    }
                }
            }
            res.render('rank-detail.ejs', { bailam: bailam, contest_name: contest_name, contest_id: contest_id, rollnumber: rollnumber, log_files: logs, testcase_size: testcase_size, message: "", role: req.session.role, user: req.session.user })
        })
    })

}

// traverse Directory
function traverseDir(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function (file) {
        try {
            file = dir + '/' + file
            var stat = fs.statSync(file)
            if (stat && stat.isDirectory()) {
                /* Recurse into a subdirectory */
                results = results.concat(traverseDir(file))
            } else {
                /* Is a file */
                if (/^(c|cpp|py)$/.test(file.split('.').pop())) {
                    results.push(file)
                }
            }
        } catch (error) {

        }

    })
    return results.map(function (fileName) {
        return {
            name: fileName,
            time: fs.statSync(fileName).mtime.getTime()
        };
    }).sort(function (a, b) {
        return b.time - a.time;
    }).map(function (v) {
        return v.name;
    });
}
//---------------------------------submissions page----------------------------------
exports.submission = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    var message = ""
    if (req.session.submit_success) {
        req.session.submit_success = false;
        message = "Submit successfully!"
    }
    if (req.session.submit_error) {
        req.session.submit_error = false;
        message = "Submit error!"
    }
    var sql = ''
    if (req.session.role == "Student") {
        sql = "SELECT contest.time_begin, contest.time_end, contest.contest_name, student_account.rollnumber, contest_detail.problem_id, contest_detail.path_problem, contest_detail.times FROM student_account " +
            "INNER JOIN contest_detail ON student_account.contest_id=contest_detail.contest_id " +
            "INNER JOIN contest ON student_account.contest_id=contest.contest_id " +
            "WHERE student_account.userId=?"
    } else {
        sql = "SELECT contest.time_begin, contest.time_end, contest.contest_name, teacher_account.rollnumber, contest_detail.problem_id, contest_detail.path_problem, contest_detail.times FROM teacher_account " +
            "INNER JOIN contest ON teacher_account.userId=contest.teacher_id " +
            "INNER JOIN contest_detail ON contest.contest_id=contest_detail.contest_id " +
            "WHERE contest.contest_id="+ req.query.contest_id
    }
    db.query(sql, [userId], function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        if (results.length == 0) { // if student have no contests
            error = "You have no contest"
            res.render('submit.ejs', { error: error, role: req.session.role, user: req.session.user })
        } else {
            var contest_name = results[0].contest_name.replace(/ /g, '-')
            var time_begin = results[0].time_begin
            var time_end = results[0].time_end
            req.session.time_begin = time_begin
            req.session.time_end = time_end
            req.session.contest_name = contest_name
            req.session.rollnumber = results[0].rollnumber
            req.session.times = {}
            req.session.debai = []
            req.session.problem_id = []
            for (let i = 0; i < results.length; ++i) {
                req.session.times[results[i].problem_id] = results[i].times
                req.session.debai.push(path.basename(results[i].path_problem))
                req.session.problem_id.push(results[i].problem_id)
            }
            var clonetimes = {}
            clonetimes[results[0].rollnumber] = JSON.parse(JSON.stringify(req.session.times))
            req.session.times = JSON.parse(JSON.stringify(clonetimes))
            var debai = JSON.parse(JSON.stringify(req.session.problem_id))
            if (req.session.role != "Student" && !fs.existsSync(storage.BAILAM + contest_name + '/' + results[0].rollnumber)) {
                fs.mkdirSync(storage.BAILAM + contest_name + '/' + results[0].rollnumber, (err) => { 
                    if (err) { 
                        return res.redirect("/error")
                    } 
                }); 
            }
            // get all submissions of student in folder './public/thumucbailam/contest_name/req.session.rollnumber
            var bailam = traverseDir(storage.BAILAM + contest_name + '/' + req.session.rollnumber)
            bailam = bailam.map(function (fileName) {
                return {
                    name: fileName,
                    time: fs.statSync(fileName).mtime.getTime()
                }
            }).sort(function (a, b) {
                return a.time - b.time
            }).map(function (v) {
                return v.name
            })
            // get all judged Logs in folder './public/nopbai/Logs/' + contest_name
            fs.readdir(storage.NOPBAI + 'Logs/' + contest_name, function (err, files) {
                if (err) {
                    res.redirect("/error")
                    return
                }
                log_files = []
                testcase_size = []
                for (let i = 0, l = files.length; i < l; ++i) {
                    var tmp = files[i].split('][')[files[i].split('][').length - 1].split('].')[0]
                    var roll = files[i].split('][')[files[i].split('][').length - 2]
                    if (roll != results[0].rollnumber) continue
                    if (clonetimes[roll][tmp] > 0) {
                        clonetimes[roll][tmp]--
                    }
                    if (clonetimes[roll][tmp] == 0) {
                        req.session.times[tmp] = 0
                    }
                    if (files[i].includes(req.session.rollnumber)) {
                        log_files.push(files[i])                
                    }
                }
                var logs = []
                for (let i = 0; i < bailam.length; ++i) {
                    for(let j = 0; j < log_files.length; ++j) {
                        if (bailam[i].includes(log_files[j].substring(0, log_files[j].length - 4))) {
                            logs.push(log_files[j])
                            var tmp = log_files[j].split('][')[log_files[j].split('][').length - 1].split('].')[0]
                            testcase_size.push(getFolders(storage.TESTCASE + contest_name + '/' + tmp).length)
                            break
                        }
                    }
                }
                res.render('submit.ejs', { error: "", contest_id: req.query.contest_id, rollnumber: results[0].rollnumber, contest_name: contest_name, time_begin: time_begin, time_end: time_end, debai: debai, bailam: bailam, log_files: logs, testcase_size: testcase_size, clonetimes: clonetimes, message: message, role: req.session.role, user: req.session.user })
            })
        }
    })
}
//---------------------------------submissions realtime result----------------------------------
exports.submission_realtime = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    var contest_name = req.session.contest_name
    var rollnumber = req.session.rollnumber
    // get all judged Logs in folder './public/nopbai/Logs/' + contest_name
    fs.readdir(storage.NOPBAI + 'Logs/' + contest_name, function (err, log_files) {
        if (err) { console.log(err); res.redirect("/error"); return }
        log_files = log_files.map(function (fileName) {
            return {
                name: fileName,
                time: fs.statSync(storage.NOPBAI + 'Logs/' + contest_name + '/' + fileName).mtime.getTime()
            };
        }).sort(function (a, b) {
            return b.time - a.time;
        }).map(function (v) {
            return v.name;
        });
        var check = {}
        var result = {}
        var rescnt = {}
        var reserr = {}
        var testcase_size = 0
        for (let i = 0, l = log_files.length; i < l; ++i) {
            var tmp = log_files[i].split('][')[log_files[i].split('][').length - 1].split('].')[0]
            if (log_files[i].includes(rollnumber) && !check[tmp]) {
                testcase_size = getFolders(storage.TESTCASE + contest_name + '/' + tmp).length
                var logcontent = fs.existsSync(storage.NOPBAI + 'Logs/' + contest_name + '/' + log_files[i]) ?  fs.readFileSync(storage.NOPBAI + 'Logs/' + contest_name + '/' + log_files[i], 'utf8') : ""
                if (logcontent) {
                    if (!logcontent.split('\n')[0].includes('Error')) {
                        result[tmp] = parseInt(parseFloat(logcontent.split('\n')[0]) * testcase_size / 10)
                        if (result[tmp] < testcase_size) {
                            if (logcontent.includes('Time Limit Exceeded')) {
                                reserr[tmp] = 'Time Limit Exceeded'
                            } else {
                                reserr[tmp] = 'Wrong answer'
                            }
                        }
                    } else {
                        result[tmp] = 0
                        reserr[tmp] = logcontent.split('\n')[0]
                    }
                    rescnt[tmp] = testcase_size
                }
                check[tmp] = 1
            }
        }
        var obj = {
            data: []
        }
        for (let i = 0; i < req.session.debai.length; ++i) {
            var data = "<div class='testcases'>"
            var tmp = req.session.problem_id[i]
            tb = new Array()
            tb.push(tmp, "<a href='/debai/" + contest_name + "/" + req.session.debai[i] + "' target='_blank'>" + req.session.debai[i].split('.')[0] + "</a>")
            if (fs.readdirSync(storage.NOPBAI).some(v => v.includes('[' + contest_name + '][' + req.session.rollnumber + '][' + tmp + ']'))) {
                data += "<i class='fa fa-hourglass fa-spin'></i> In queue"
                tb.push(data + "</div>")
                obj.data.push(tb)
                continue
            }
            for (let i = 0; i < result[tmp]; ++i) {
                data += "<span class='accepted' title='Test case " + (i + 1) + "/" + rescnt[tmp] + ": Accepted'><i class='fa fa-check'></i></span>"
            }
            if (reserr[tmp] == 'Wrong answer') {
                for (let i = result[tmp]; i < rescnt[tmp]; ++i) {
                    data += "<span class='rejected' title='Test case " + (result[tmp] + 1) + "/" + rescnt[tmp] + ": " + reserr[tmp] + "'><i class='fa fa-times'></i></span>"
                }
            } else {
                if (result[tmp] < rescnt[tmp]) {
                    data += "<span class='rejected' title='Test case " + (result[tmp] + 1) + "/" + rescnt[tmp] + ": " + reserr[tmp] + "'><i class='fa fa-times'></i></span>"
                }
                for (let i = 0; i < rescnt[tmp] - result[tmp] - 1; ++i) {
                    data += "<span class='rejected' title='Test case " + (result[tmp] + i + 2) + "/" + rescnt[tmp] + ": not checked'></span>"
                }
            }
            
            if (data == "<div class='testcases'>") {
                if (!check[tmp] || log_files.length == 0) {
                    if (fs.readdirSync(storage.NOPBAI).some(v => v.includes('[' + contest_name + '][' + req.session.rollnumber + '][' + tmp + ']'))) {
                        data += "<i class='fa fa-hourglass fa-spin'></i> In queue"
                    } else {
                        data += "Not submit"
                    }
                } else {
                    data += "<i class='fa fa-cog fa-spin'></i> Jugding"
                }
            }
            tb.push(data + "</div>")
            obj.data.push(tb)
        }
        res.send(obj)
    })
}
//---------------------------------Submit submissions file----------------------------------
exports.submit = function (req, res) {
    var userId = req.session.userId
    if (userId == null) {
        res.redirect("/login")
        return
    }
    if (req.method == "POST") {
        if (new Date() >= new Date(req.session.time_end)) {
            req.session.submit_error = true
            res.redirect("/submission")
            return
        }
        var upload = false
        var type = ''
        var form = new formidable.IncomingForm()
        form.maxFileSize = 2 * 1024 * 1024 // limit upload 2mb
        form.parse(req, function (err, fields, files) {
            if (fields.content == "") {
                // check file is valid
                if (err || typeof files.filetoupload === "undefined" || files.filetoupload.name == "" || !/^\w+\.(c|cpp|py)$/.test(files.filetoupload.name)) {
                    req.session.submit_error = true
                    res.redirect("/submission")
                    return
                }
                upload = true
            }
            if (err || !req.session.problem_id.includes(fields.tenbai) || req.session.times[fields.tenbai] == 0) {
                req.session.submit_error = true
                res.redirect("/submission")
                return
            }
            // create new formatted name of uploaded file
            if (upload) {
                type = files.filetoupload.name.split('.')[1]
            } else {
                if (fields.language == 'C') {
                    type = 'c'
                } else if (fields.language == 'C++') {
                    type = 'cpp'
                } else if (fields.language == 'Python 3') {
                    type = 'py'
                } else {
                    req.session.submit_error = true
                    res.redirect("/submission")
                    return
                }
            }
            var ip = req.session.ipaddress
            var newfile = '[' + ip + '][' + (new Date().getTime() - new Date(req.session.time_begin)) + '][' + req.session.contest_name.replace(/ /g, '-') + '][' + req.session.rollnumber + '][' + fields.tenbai + '].' + type
            var newpath = storage.NOPBAI + newfile
            if (upload) {
                var oldpath = files.filetoupload.path
                fs.readFile(oldpath, function (err, data) {
                    if (err) { logger.error(err); res.redirect("/error"); return }
                    // Write the file
                    fs.writeFile(newpath, data, function (err) {
                        if (err) { logger.error(err); res.redirect("/error"); return }
                    })
                    // Delete the file
                    fs.unlink(oldpath, function (err) {
                        if (err) { logger.error(err); res.redirect("/error"); return }
                    })
                    req.session.submit_success = true
                    logger.info("Sumit code file " + newfile + " of contest " + req.session.contest_name + " problem " + fields.tenbai + " by " + userId)
                    if (req.session.role != "Student") {
                        res.redirect("/submission?contest_id=" + fields.contest_id)
                    } else {
                        res.redirect("/submission")
                    }
                })
            } else {
                // Write the file
                fs.writeFile(newpath, fields.content, function (err) {
                    if (err) { logger.error(err); res.redirect("/error"); return }
                })
                req.session.submit_success = true
                logger.info("Sumit code content field " + newfile + " of contest " + req.session.contest_name + " problem " + fields.tenbai + " by " + userId)
                if (req.session.role != "Student") {
                    res.redirect("/submission?contest_id=" + fields.contest_id)
                } else {
                    res.redirect("/submission")
                }  
            }
        })
    } else {
        res.redirect("/error")
        return
    }
}
//---------------------------------Destroy session when closing tab or browser----------------------------------
exports.session_destroy = function (req, res) {
    if (req.session.role == "Student") {
        var sql = "UPDATE student_account SET ip='" + req.session.ipaddress + "',timeout='" + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + minutes * 60000).toISOString().substring(0, 19) + "', islogin=0 WHERE userId='" + req.session.userId + "'"
        db.query(sql)
    }
    logger.info(req.session.role + " " + req.session.user + " has disconected")
    req.session.destroy()
}
//---------------------------------Validate Datetime DD-MM-YYYY HH:ii----------------------------------
function ValidateDate(dt) {
    try {
        var isValidDate = false;
        var arr1 = dt.split('-');
        var year = 0; var month = 0; var day = 0; var hour = 0; var minute = 0; var sec = 0;
        if (arr1.length == 3) {
            var arr2 = arr1[2].split(' ');
            if (arr2.length == 2) {
                var arr3 = arr2[1].split(':');
                try {
                    year = parseInt(arr2[0], 10);
                    month = parseInt(arr1[1], 10);
                    day = parseInt(arr1[0], 10);
                    hour = parseInt(arr3[0], 10);
                    minute = parseInt(arr3[1], 10);
                    //sec = parseInt(arr3[0],10);
                    sec = 0;
                    var isValidTime = false;
                    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && sec >= 0 && sec <= 59)
                        isValidTime = true;
                    else if (hour == 24 && minute == 0 && sec == 0)
                        isValidTime = true;

                    if (isValidTime) {
                        var isLeapYear = false;
                        if (year % 4 == 0)
                            isLeapYear = true;

                        if ((month == 4 || month == 6 || month == 9 || month == 11) && (day >= 0 && day <= 30))
                            isValidDate = true;
                        else if ((month != 2) && (day >= 0 && day <= 31))
                            isValidDate = true;

                        if (!isValidDate) {
                            if (isLeapYear) {
                                if (month == 2 && (day >= 0 && day <= 29))
                                    isValidDate = true;
                            }
                            else {
                                if (month == 2 && (day >= 0 && day <= 28))
                                    isValidDate = true;
                            }
                        }
                    }
                }
                catch (er) { isValidDate = false; }
            }
        }
        return isValidDate;
    }
    catch (err) { alert('ValidateDate: ' + err); }
}
function formatTime(s) {
    d = s.split('-')[0]
    m = s.split('-')[1]
    y = s.split('-')[2].split(' ')[0]
    return y + '-' + m + '-' + d + s.substring(10) + '+00:00'
}