const ValidateDate = require('./tool').ValidateDate
const formatTime = require('./tool').formatTime
const getFolders = require('./tool').getFolders
const extract = require('extract-zip')
const XLSX = require('xlsx')
const formidable = require('formidable')
const zipper = require('zip-local')
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
//---------------------------------contest----------------------------------
/**
 * GET contest page
 */
exports.contest = function (req, res) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  var sql = ""
  if (req.session.teacher_role <= 1) {
    sql = "SELECT contest.contest_id, teacher_account.rollnumber, contest.contest_name, contest.time_begin, contest.time_end FROM contest INNER JOIN teacher_account ON contest.teacher_id=teacher_account.userId WHERE deleted=0 ORDER BY contest.contest_id"
  } else {
    sql = "SELECT contest.contest_id, teacher_account.rollnumber, contest.contest_name, contest.time_begin, contest.time_end FROM contest INNER JOIN teacher_account ON contest.teacher_id=teacher_account.userId WHERE contest.teacher_id='" + userId + "' AND deleted=0 ORDER BY contest.contest_id"
  }
  db.query(sql, function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    res.render('contest.ejs', { data: results, role: req.session.role, teacher_role: req.session.teacher_role, user: req.session.user })
  })
}
//---------------------------------Add a new contest----------------------------------
/**
 * Add a new contest
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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
    var language = Array.isArray(post.language) ? post.language.join() : post.language
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
      var sql = "INSERT INTO contest(teacher_id, contest_name, time_begin, time_end, language) VALUES (?,?,?,?,?)"
      db.query(sql, [userId, contest_name, formatTime(time_begin), formatTime(time_end), language], function (err) {
        if (err) { logger.error(err); res.redirect("/error"); return }
          logger.info("Create contest " + contest_name + " by " + userId)
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
/**
 * Delete a contest
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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
      var sql = "SELECT rollnumber FROM student_account WHERE contest_id=?"
      db.query(sql, [contest_id], function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        for (let i = 0, l = results.length; i < l; ++i) {
          fs.rename(storage.BAILAM + '$' + contest_name + '/' + results[i].rollnumber, storage.BAILAM + '$' + contest_name + '/$' + results[i].rollnumber, function (err) {
            if (err) { logger.error(err); res.redirect("/error"); return }
          })
        }
        // SET deleted=1 means this contest deleted
        sql = "UPDATE contest SET deleted=1 WHERE contest_id=?"
        db.query(sql, [contest_id]);
        // UPDATE all these contest_id=0 which correspond to student_account 
        sql = "UPDATE student_account SET contest_id=0 WHERE contest_id=?"
        db.query(sql, [contest_id])
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
/**
 * Update a contest
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.edit_contest = function (req, res) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  if (req.method == "POST") {
    var post = req.body
    var contest_id = post.contest_id
    var contest_name_new = post.contest_name_new
    var contest_name_old = post.contest_name_old
    var time_begin = post.time_begin
    var time_end = post.time_end
    var formatTimeBegin = new Date(formatTime(time_begin))
    var formatTimeEnd = new Date(formatTime(time_end))
    var language = Array.isArray(post.language) ? post.language.join() : post.language
    if (contest_name_new !== "" && ValidateDate(time_begin) && ValidateDate(time_end) && formatTimeBegin < formatTimeEnd) {
      // update contest_name, time_begin, time_end
      var sql = "UPDATE contest SET contest_name=?, time_begin=?, time_end=?, language=? WHERE contest_id=?"
      db.query(sql, [contest_name_new, formatTime(time_begin), formatTime(time_end), language, contest_id], function (err) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        fs.rename(storage.BAILAM + contest_name_old, storage.BAILAM + contest_name_new, function (err) {
          if (err) { logger.error(err); res.redirect("/error"); return }
        })
        fs.rename(storage.DEBAI + contest_name_old, storage.DEBAI + contest_name_new, function (err) {
          if (err) { logger.error(err); res.redirect("/error"); return }
        })
        fs.rename(storage.TESTCASE + contest_name_old, storage.TESTCASE + contest_name_new, function (err) {
          if (err) { logger.error(err); res.redirect("/error"); return }
        })
        fs.rename(storage.NOPBAI + 'Logs/' + contest_name_old, storage.NOPBAI + 'Logs/' + contest_name_new, function (err) {
          if (err) { logger.error(err); res.redirect("/error"); return }
        })

        logger.info("Contest " + contest_id + " has changed time to begin:" + formatTime(time_begin) + ", end: " + formatTime(time_end) + ", language=" + language)
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
  var sql = "SELECT contest_name from contest WHERE contest_id=?"
  db.query(sql, [contest_id], function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    var contest_name = results[0].contest_name.replace(/ /g, '-')
    // zip folder "./public/thumucbailam/ contest_name
    zipper.sync.zip(storage.BAILAM + contest_name).compress().save("./public/download/" + contest_name + ".zip")
    logger.info("Contest " + contest_id + " has downloaded")
    res.download("./public/download/" + contest_name + ".zip") // download file .zip
  })
}
//---------------------------------contest-detail-get----------------------------------
/**
 * GET contest detail page
 * if no student in this contest => Get only contest_name, contest_id, time_begin, time_end, language
 * if least a student in this contest => Get full information of both tables
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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
  var sql = "SELECT student_account.userId, student_account.rollnumber, student_account.name, student_account.class, contest.contest_id, contest.contest_name,contest.time_begin,contest.time_end,contest.language FROM contest " +
    "INNER JOIN student_account ON student_account.contest_id=contest.contest_id " +
    "WHERE contest.contest_id=?"
  db.query(sql, [contest_id], function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    if (results.length == 0) { // if no student in contest
      sql = "SELECT contest_name, contest_id, time_begin, time_end, language FROM contest WHERE contest_id=?"
      db.query(sql, [contest_id], function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        res.render('contest-detail.ejs', { data: results, totalStudent: 0, message: message, teacher_role: req.session.teacher_role, role: req.session.role, user: req.session.user })
      })
    } else { // at least 1 student
      res.render('contest-detail.ejs', { data: results, totalStudent: results.length, message: message, teacher_role: req.session.teacher_role, role: req.session.role, user: req.session.user })
    }

  })
}
//---------------------------------delete selected student----------------------------------
/**
 * Delete student in contest page
 * Then Rename file<name> deleted to $<name>
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.delete_student = function (req, res) {
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
          if (err) { 
            console.log('loi')
            logger.error(err); res.redirect("/error"); return }
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
//---------------------------------load student----------------------------------
/**
 * Load student have not entered class yet (load all student have contest_id = 0 of a class identiied)
 * But if all student joined into this contest => show message 'All student are in contest'
 * if do not have at least rollnumber => show message 'Sorry, the system cannot fild class'
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.load_student = function (req, res) {
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
  var sql = "SELECT rollnumber, name, class FROM student_account WHERE class=? and contest_id=0"
  db.query(sql, [class_name], function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    if (results.length == 0) { // if query empty
      sql = "SELECT rollnumber FROM student_account WHERE class=? LIMIT 1"
      db.query(sql, [class_name], function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        if (results.length == 0) {
          error = "Sorry, the system cannot find class " + class_name
          res.render('add-student.ejs', { data: results, contest_id: contest_id, message: message, error: error, warning: warning, class_name: class_name, role: req.session.role, user: req.session.user })
          return
        } else {
          warning = "All student are in contest"
          res.render('add-student.ejs', { data: [], contest_id: contest_id, message: message, error: error, warning: warning, class_name: class_name, role: req.session.role, user: req.session.user })
          return
        }
      })
    } else {
      res.render('add-student.ejs', { data: results, contest_id: contest_id, message: message, error: error, warning: warning, class_name: class_name, role: req.session.role, user: req.session.user })
    }
  })

}
//---------------------------------add student----------------------------------
/**
 * Add student to contest
 * Then create a new folder contains submission files of student
 * And update contest_id in student_account
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.add_student = function (req, res) {
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
      var sql = "SELECT contest_name FROM contest WHERE contest_id=?"
      db.query(sql, [contest_id], function (err, results) {
        if (err || results.length == 0) { logger.error(err); res.redirect("/error"); return }
        var contest_name = results[0].contest_name.replace(/ /g, '-')
        var list = list_rollnumber.split(",")
        var sql = "UPDATE student_account SET contest_id=? WHERE "
        for (let i = 0, l = list.length; i < l; ++i) {
          // create a new folder contains submission files of student
          if (!fs.existsSync(storage.BAILAM + contest_name + '/' + list[i])) {
            fs.mkdirSync(storage.BAILAM + contest_name + '/' + list[i])
          }
          // update contest_id in student_account
          sql += "rollnumber='" + list[i] + "' OR "
        }
        sql = sql.slice(0, -4)
        db.query(sql, [contest_id], function (err) {
          if (err) { logger.error(err); res.redirect("/error"); return }
          logger.info(list.length + " students in contest " + contest_id + " has added: " + list)
          sleep(500).then(() => {
            res.redirect("/contest/load-student?class_name=" + class_name + "&contest_id=" + contest_id)
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
/**
 * Load class from file excel
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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
/**
 * Add class from file excel loaded before
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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
      var sql = "SELECT rollnumber FROM student_account WHERE class=? LIMIT 1"
      db.query(sql, [class_name], function (err, results) {
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
/**
 * Create a new Class
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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
      sql += "('" + RollNumber[i] + "','" + MemberCode[i] + "', MD5(" + password + "),'" + FullName[i] + "','" + class_name + "'),"
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
//---------------------------------add problem----------------------------------
/**
 * Add a new problem 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.add_problem = function (req, res) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  var error = ""
  var message = ""
  // if file upload error
  if (req.session.upload_err) {
    req.session.upload_err = false
    error = "Upload error!"
  }
  // if file upload sucess
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
/**
 * Add problem and testcase
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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
//---------------------------------edit problem and testcase----------------------------------
/**
 * Edit times of limit submission
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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
/**
 * Delete Problem and testcase of a contesst
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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