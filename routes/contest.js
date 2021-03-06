const ValidateDate = require('./tool').ValidateDate
const formatTime = require('./tool').formatTime
const formatDate = require('./tool').formatDate
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

  var error = "";
  var message = "";
  
  if (req.session.sql_err) {
    req.session.sql_err = false
    error = "Contest acocunt has exist!"
  }

  if (req.session.added) {
    req.session.added = false
    message = "Successfully! Contest have been added."
  }

  if (req.session.deleted_contest) {
    req.session.deleted_contest = false
    message = "Successfully! Contest have been deleted."
  }

  var sql = ""
  if (req.session.teacher_role <= 1) {
    sql = "SELECT contest.contest_id, employee_account.rollnumber, contest.contest_name, contest.time_begin, contest.time_end FROM contest INNER JOIN employee_account ON contest.teacher_id=employee_account.userId WHERE contest.status=1 ORDER BY contest.contest_id"
  } else {
    sql = "SELECT contest.contest_id, employee_account.rollnumber, contest.contest_name, contest.time_begin, contest.time_end FROM contest INNER JOIN employee_account ON contest.teacher_id=employee_account.userId WHERE contest.teacher_id='" + userId + "' AND contest.status=1 ORDER BY contest.contest_id"
  }
  db.query(sql, function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    res.render('contest.ejs', { data: results, role: req.session.role, teacher_role: req.session.teacher_role, user: req.session.user, message: message, error: error })
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
    var time_limit = post.time_limit;
    var memory_limit = post.memory_limit;
    var check_format = post.check_format;
    var check_comment = post.check_comment;
    var check_comment_mode = post.check_comment_mode;
    var percentage_accept = post.percentage_accept;
    var percentage_minus_point = post.percentage_minus_point;
    var check_plagiarism = post.check_plagiarism;

    var format_minus_point = post.format_minus_point;
    var percentage_allow = post.percentage_allow;

    var penalty_mode = post.penalty_mode;
    var limit_submission = post.limit_submission;

    format_minus_point = format_minus_point === '' ? 0 : format_minus_point;
    percentage_accept = percentage_accept === '' ? 0 : percentage_accept;
    percentage_minus_point = percentage_minus_point === '' ? 0 : percentage_minus_point;
    percentage_allow = percentage_allow === '' ? 0 : percentage_allow;

    var data_config = "time_limit=" + time_limit + "\nmemory_limit=" + memory_limit + "\ncheck_format=" + 
    (check_format? "true" : "false") + "\n" + format_minus_point + "\ncheck_comment=" + (check_comment ? "true" : "false") +
    "\ncheck_comment_mode=" + check_comment_mode + "\n" + percentage_accept + "\n" + percentage_minus_point +
    "\ncheck_plagiarism=" + (check_plagiarism ? "true" : "false") + "\n" + percentage_allow +
    "\npenalty_mode=" + penalty_mode + "\n" + limit_submission;
    

    if (contest_name !== "" && ValidateDate(time_begin) && ValidateDate(time_end) && formatTimeBegin < formatTimeEnd) {
      // create 4 folder when add new contest
      if (!fs.existsSync(storage.BAILAM + contest_name)) {
        fs.mkdirSync(storage.BAILAM + contest_name)
      } else {
        logger.info("Create contest fail")
        res.redirect("/contest");
        return;
      }
      if (!fs.existsSync(storage.DEBAI + contest_name)) {
        fs.mkdirSync(storage.DEBAI + contest_name)
      }
      if (!fs.existsSync(storage.TESTCASE + contest_name)) {
        fs.mkdirSync(storage.TESTCASE + contest_name);
        fs.exists(storage.TESTCASE + contest_name + "/config.txt", function (exists) {
          fs.writeFileSync(storage.TESTCASE + contest_name + "/config.txt", data_config);
        });
      }
      if (!fs.existsSync(storage.NOPBAI + 'Logs/' + contest_name)) {
        fs.mkdirSync(storage.NOPBAI + 'Logs/' + contest_name)
      }
      // add contest to db
      var sql = "INSERT INTO contest(teacher_id, contest_name, time_begin, time_end, language) VALUES (?,?,?,?,?)"
      db.query(sql, [userId, contest_name, formatTime(time_begin), formatTime(time_end), language], function (err) {
        if (err) { logger.error(err);req.session.sql_err = true; res.redirect("/error"); return }
          req.session.added = true
          logger.info("Create contest " + contest_name + " by " + userId)
          res.redirect("/contest")
      })
    } else {
      req.session.sql_err = true
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
exports.delete_contest = async function (req, res) {
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
        var deleteWorkSpace = await deleteFolder(storage.BAILAM + '$' + contest_name);
        fs.renameSync(storage.BAILAM + contest_name, storage.BAILAM + '$' + contest_name)
      }
      if (fs.existsSync(storage.DEBAI + contest_name)) {
        var deleteProblem = await deleteFolder(storage.DEBAI + '$' + contest_name);
        fs.renameSync(storage.DEBAI + contest_name, storage.DEBAI + '$' + contest_name)
      }
      if (fs.existsSync(storage.TESTCASE + contest_name)) {
        var deleteTestCase = await deleteFolder(storage.TESTCASE + '$' + contest_name);
        fs.renameSync(storage.TESTCASE + contest_name, storage.TESTCASE + '$' + contest_name)
      }
      if (fs.existsSync(storage.NOPBAI + 'Logs/' + contest_name)) {
        var deleteSubmission = await deleteFolder(storage.NOPBAI + 'Logs/$' + contest_name);
        fs.renameSync(storage.NOPBAI + 'Logs/' + contest_name, storage.NOPBAI + 'Logs/$' + contest_name)
      }
      // update status contest.deleted=1, student_account.in_contest=0
      var sql = "SELECT `rollnumber` FROM `student_account`, contest_student WHERE " +
      " student_account.id = contest_student.student_id AND contest_student.contest_id = ?"
      db.query(sql, [contest_id], async function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        for (let i = 0, l = results.length; i < l; ++i) {
          var deleteStudent = await deleteFolder(storage.BAILAM + '$' + contest_name + '/$' + results[i].rollnumber);
          // fs.rename(storage.BAILAM + '$' + contest_name + '/' + results[i].rollnumber, storage.BAILAM + '$' + contest_name + '/$' + results[i].rollnumber, function (err) {
          //   if (err) { logger.error(err); res.redirect("/error"); return }
          // })
        }
        // SET deleted=1 means this contest deleted
        sql = "UPDATE contest SET status=0 WHERE contest_id=?"
        db.query(sql, [contest_id]);
        // UPDATE all these contest_id=0 which correspond to student_account 
        sql = "UPDATE `contest_student` SET `status`= 0 WHERE contest_id = ?"
        db.query(sql, [contest_id]);
        fs.writeFileSync(storage.EVENT + 'workspaceEvent/workspaceEvent.txt', Math.random(1000) + "changed");
        logger.info("Contest " + contest_id + " has deleted");
        req.session.deleted_contest = true;
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
    var language = Array.isArray(post.language) ? post.language.join() : post.language;
    var time_limit = post.time_limit;
    var memory_limit = post.memory_limit;
    var check_format = post.check_format;
    var check_comment = post.check_comment;
    var check_comment_mode = post.check_comment_mode;
    var percentage_accept = post.percentage_accept;
    var percentage_minus_point = post.percentage_minus_point;
    var check_plagiarism = post.check_plagiarism;

    var format_minus_point = post.format_minus_point;
    var percentage_allow = post.percentage_allow;

    var penalty_mode = post.penalty_mode;
    var limit_submission = post.limit_submission;

    format_minus_point = format_minus_point === '' ? 0 : format_minus_point;
    percentage_accept = percentage_accept === '' ? 0 : percentage_accept;
    percentage_minus_point = percentage_minus_point === '' ? 0 : percentage_minus_point;
    percentage_allow = percentage_allow === '' ? 0 : percentage_allow;
    var data_config = "time_limit=" + time_limit + "\nmemory_limit=" + memory_limit + "\ncheck_format=" + 
    (check_format? "true" : "false") + "\n" + format_minus_point + "\ncheck_comment=" + (check_comment ? "true" : "false") +
    "\ncheck_comment_mode=" + check_comment_mode + "\n" + percentage_accept + "\n" + percentage_minus_point +
    "\ncheck_plagiarism=" + (check_plagiarism ? "true" : "false") + "\n" + percentage_allow +
    "\npenalty_mode=" + penalty_mode + "\n" + limit_submission;

    if (contest_name_new !== "" && ValidateDate(time_begin) && 
      ValidateDate(time_end) && formatTimeBegin < formatTimeEnd) {
      // update contest_name, time_begin, time_end
      var sql = "UPDATE contest SET contest_name=?, time_begin=?, time_end=?, language=? WHERE contest_id=?"
      db.query(sql, [contest_name_new, formatTime(time_begin), 
        formatTime(time_end), language, contest_id], function (err) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        if(contest_name_old !== contest_name_new) {
          fs.rename(storage.BAILAM + contest_name_old, storage.BAILAM + contest_name_new, function (err) {
            if (err) { logger.error(err); res.redirect("/error"); return }
            fs.readdir(storage.BAILAM + contest_name_new, (err, folders) => {
              folders.forEach(folder => {
                fs.readdir(storage.BAILAM + contest_name_new + '/' + folder , (err, files) => {
                  files.forEach(file => {
                    var filenew = file.replace(contest_name_old, contest_name_new);
                    fs.rename(storage.BAILAM + contest_name_new +'/'+ folder +'/' + file,
                     storage.BAILAM + contest_name_new + '/'+ folder + '/' + filenew, (err) => {
                      if(err) { logger.error(err); res.redirect("/error"); return; }
                     });
                  })
                });
              });
            });
          })
          fs.rename(storage.DEBAI + contest_name_old, storage.DEBAI + contest_name_new, function (err) {
            if (err) { logger.error(err); res.redirect("/error"); return }
          })
          fs.rename(storage.TESTCASE + contest_name_old, storage.TESTCASE + contest_name_new, function (err) {
            if (err) { logger.error(err); res.redirect("/error"); return }
            fs.exists(storage.TESTCASE + contest_name_new + "/config.txt", function (exists) {
              fs.writeFileSync(storage.TESTCASE + contest_name_new + "/config.txt", data_config);
            })
          })
          fs.rename(storage.NOPBAI + 'Logs/' + contest_name_old, storage.NOPBAI + 'Logs/' + contest_name_new, function (err) {
            if (err) { logger.error(err); res.redirect("/error"); return }
            fs.readdir(storage.NOPBAI + 'Logs/' + contest_name_new, (err, folders) => {
              folders.forEach(file => {
                  var filenew = file.replace(contest_name_old, contest_name_new);
                  fs.rename(storage.NOPBAI + 'Logs/' + contest_name_new +'/' + file,
                   storage.NOPBAI + 'Logs/' + contest_name_new + '/' + filenew, (err) => {
                    if(err) {ogger.error(err); res.redirect("/error"); return;}
                   });
                })
            });
          })
        } else {
          fs.exists(storage.TESTCASE + contest_name_new + "/config.txt", function (exists) {
              fs.writeFileSync(storage.TESTCASE + contest_name_new + "/config.txt", data_config);
          })
        }
        logger.info("Contest " + contest_id + " has changed time to begin:" + formatTime(time_begin) + ", end: " + formatTime(time_end) + ", language=" + language)
        req.session.edit_contest_success = true;
        res.redirect("/contest/detail?contest_id=" + contest_id)
      })
    } else {
      req.session.edit_contest_fail = true;
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
  var message = "";
  var error = "";
  if (req.session.deleted) { // check student is deleted in contest
    req.session.deleted = false
    message = "Successfully! Students have been deleted."
  }
  if(req.session.edit_contest_fail) {
    req.session.edit_contest_fail = false;
    error = "Edit contest fail.";
  }
  if(req.session.edit_contest_success) {
    req.session.edit_contest_success = false;
    message = "Successfully! Contest have been edited."
  }
  // var sql = "SELECT student_account.userId, student_account.rollnumber, student_account.name, student_account.class, contest.contest_id, contest.contest_name,contest.time_begin,contest.time_end,contest.language FROM contest " +
  //   "INNER JOIN student_account ON student_account.contest_id=contest.contest_id " +
  //   "WHERE contest.contest_id=?"
  var sql = "SELECT student_account.userId, student_account.rollnumber, student_account.name, " +
    " class.class_name, class.semester, class.subject, " +
    " contest.contest_id, contest.contest_name,contest.time_begin,contest.time_end, " +
    "contest.language FROM contest, student_account, contest_student, class, " +
    " class_student WHERE contest_student.student_id " +
    "= student_account.id AND contest_student.contest_id = ? AND contest.contest_id = " +
    "contest_student.contest_id AND contest_student.status = 1 AND student_account.status = 1 " +
    "  AND class.status = 1 AND class_student.student_id = student_account.id " +
    " AND class_student.class_id = class.id AND class_student.status = 1 GROUP BY student_account.id";
  db.query(sql, [contest_id], function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    
    if (results.length == 0) { // if no student in contest
      sql = "SELECT contest_name, contest_id, time_begin, time_end, language FROM contest WHERE contest_id=?"
      db.query(sql, [contest_id], function (err, results) {
        if (err || results.length == 0) { logger.error(err); res.redirect("/error"); return }
        var data_config =  fs.readFileSync(storage.TESTCASE + results[0].contest_name + "/config.txt", {encoding:'utf8', flag:'r'});
        var data_config_inline = data_config.split('\n');
        results[0].time_limit = data_config_inline[0].split('=')[1];
        results[0].memory_limit = data_config_inline[1].split('=')[1];
        results[0].check_format = data_config_inline[2].split('=')[1];
        results[0].format_minus_point = data_config_inline[3];
        results[0].check_comment = data_config_inline[4].split('=')[1];
        results[0].check_comment_mode = data_config_inline[5].split('=')[1];
        results[0].percentage_accept = data_config_inline[6];
        results[0].percentage_minus_point = data_config_inline[7];
        results[0].check_plagiarism = data_config_inline[8].split('=')[1];
        results[0].percentage_allow = data_config_inline[9];
        results[0].penalty_mode = data_config_inline[10].split('=')[1];
        results[0].limit_submission = data_config_inline[11];
        res.render('contest-detail.ejs', { data: results, totalStudent: 0, message: message, error: error, teacher_role: req.session.teacher_role, role: req.session.role, user: req.session.user })
      })
    } else { // at least 1 student
      var data_config =  fs.readFileSync(storage.TESTCASE + results[0].contest_name + "/config.txt", {encoding:'utf8', flag:'r'});
      var data_config_inline = data_config.split('\n');
      results[0].time_limit = data_config_inline[0].split('=')[1];
      results[0].memory_limit = data_config_inline[1].split('=')[1];
      results[0].check_format = data_config_inline[2].split('=')[1];
      results[0].format_minus_point = data_config_inline[3];
      results[0].check_comment = data_config_inline[4].split('=')[1];
      results[0].check_comment_mode = data_config_inline[5].split('=')[1];
      results[0].percentage_accept = data_config_inline[6];
      results[0].percentage_minus_point = data_config_inline[7];
      results[0].check_plagiarism = data_config_inline[8].split('=')[1];
      results[0].percentage_allow = data_config_inline[9];
      results[0].penalty_mode = data_config_inline[10].split('=')[1];
      results[0].limit_submission = data_config_inline[11];
      res.render('contest-detail.ejs', { data: results, totalStudent: results.length, message: message, error: error, teacher_role: req.session.teacher_role, role: req.session.role, user: req.session.user })
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
      // update contest_id=0 in student_account
      var sql_contest_student = "SELECT `id` FROM `student_account` WHERE ";
      for (let i = 0, l = list.length; i < l; ++i) {

        fs.exists(storage.BAILAM + contest_name + '/$' + list[i], function (exists) {
          if (exists) {
            fs.rmdir(storage.BAILAM + contest_name + '/$' + list[i], {recursive: true}, (err) => {
              if (err) { 
              logger.error(err); res.redirect("/error"); return }
              fs.rename(storage.BAILAM + contest_name + '/' + list[i], storage.BAILAM + contest_name + '/$' + list[i], function (err) {
              if (err) { 
                  logger.error(err); res.redirect("/error"); return }
              });
            })            
          } else {
            fs.rename(storage.BAILAM + contest_name + '/' + list[i], storage.BAILAM + contest_name + '/$' + list[i], function (err) {
              if (err) { 
                logger.error(err); res.redirect("/error"); return }
            });
          }
        });

        
        sql_contest_student += " rollnumber = ? OR ";
        //select id of student by rollnumber NhanNT
      }  
      sql_contest_student = sql_contest_student.slice(0, -4);

      db.query(sql_contest_student, list, (errSelect, resSelect) => {
        if (errSelect) { logger.error(errSelect); res.redirect("/error"); return; }
          sql_contest_student = 'UPDATE `contest_student` SET `status`= 0 WHERE ';
          for(let i = 0, len = resSelect.length; i < len; i++) {
            sql_contest_student += " (student_id = " + resSelect[i].id +
             " AND contest_id = " + contest_id + ") OR "
          }
          sql_contest_student = sql_contest_student.slice(0, -4);
          //update student id and contest id into contest_student NhanNT
          db.query(sql_contest_student, (errInsert, resInsert) => {
            if (errInsert) { logger.error(errInsert); res.redirect("/error"); return; }
            req.session.deleted = true
            logger.info(list.length + " students in contest " + contest_id + " has deleted: " + list)
            
            fs.writeFileSync(storage.EVENT + 'workspaceEvent/workspaceEvent.txt', Math.random(1000) + "changed");
            res.redirect("/contest/detail?contest_id=" + contest_id)
          });
      });
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
exports.load_student = async function (req, res) {
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
    message = "Successfully! Students have been added."
  }
  var class_id = req.query.class_name;
  var class_name;
  var contest_id = req.query.contest_id;
  var time_begin = req.query.time_begin;
  var time_end = req.query.time_end;
  var time_begin_format =  formatDate(time_begin);
  var time_end_format =  formatDate(time_end);

  // var sql = "SELECT rollnumber, name, class FROM student_account WHERE class=? and contest_id=0"
  var sql = "SELECT student_account.id, student_account.rollnumber, " +
  " student_account.name, class.class_name FROM student_account, class," +
  " class_student WHERE class.id = " + class_id + " and class.id = " +
  " class_student.class_id and student_account.id = class_student.student_id " +
  " AND student_account.status = 1 AND class.status=1 AND class_student.status=1";
  let students = await getResult(sql);

  if(students.length == 0) {
    // List all class
    var sqlClass = "SELECT `id`, `semester`, `subject`, `class_name`, `status` FROM `class` WHERE status=1";
    let classes = await getResult(sqlClass);
    var listClass = [];
    for(var i = 0, len = classes.length; i < len; i++) {
      let semesterSubjectClass = classes[i].semester + "_" + classes[i].subject + "_" + classes[i].class_name;
      if(classes[i].id == class_id)
        class_name = classes[i].semester + "_" + classes[i].subject + "_" + classes[i].class_name;
      listClass.push({
        class_name: semesterSubjectClass,
        class_id: classes[i].id 
      });
    }
    res.render('add-student.ejs', { 
       list_class: listClass, 
       data: [], 
       contest_id: contest_id, 
       message: message, 
       error: error, 
       warning: "There is no student in class", 
       class_name: class_name,
       class_id: class_id,
       role: req.session.role, 
       user: req.session.user, 
       teacher_role: req.session.teacher_role,
       time_begin: time_begin,
       time_end: time_end 
    });
    return;
  }

  var studentResult = [];
  for(let i = 0, len = students.length; i < len; i++) {
    let sqlContest = "SELECT contest_student.student_id, contest.`contest_id`, " + 
    " contest.`contest_name`, contest.`time_begin`, contest.`time_end` FROM `contest`, " +
    " contest_student WHERE  contest.status = 1 AND contest_student.status = 1 " +
    " AND contest.contest_id = contest_student.contest_id " +
    " AND contest_student.student_id = " + students[i].id;
    let isValidStudent = true;
    let contests = await getResult(sqlContest);
    for(let j = 0, len1 = contests.length; j < len1; j++){
        var time_begin_db = formatDate(dayjs(contests[j].time_begin).format('DD-MM-YYYY HH:mm'));
        var time_end_db = formatDate(dayjs(contests[j].time_end).format('DD-MM-YYYY HH:mm'));
        if((time_begin_format <= time_begin_db && time_end_format >= time_begin_db) || 
          (time_begin_format <= time_end_db && time_end_format >= time_end_db)) {
          isValidStudent = false;
        }

    }
    if(isValidStudent) {
      studentResult.push(students[i]);
    }
  }
  var sqlClass = "SELECT `id`, `semester`, `subject`, `class_name`, `status` FROM `class` WHERE status=1";
  let classes = await getResult(sqlClass);
  var listClass = [];
  for(var i = 0, len = classes.length; i < len; i++) {
    let semesterSubjectClass = classes[i].semester + "_" + classes[i].subject + "_" + classes[i].class_name;
    if(classes[i].id == class_id)
      class_name = classes[i].semester + "_" + classes[i].subject + "_" + classes[i].class_name;
    listClass.push({
      class_name: semesterSubjectClass,
      class_id: classes[i].id 
    });
  }
  res.render('add-student.ejs', { 
   list_class: listClass, 
   data: studentResult, 
   contest_id: contest_id, 
   message: message, 
   error: error, warning: warning, 
   class_name: class_name,
   class_id: class_id,
   role: req.session.role, 
   user: req.session.user, 
   teacher_role: req.session.teacher_role,
   time_begin: time_begin,
   time_end: time_end 
 });
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
    var class_name = post.class_id
    var time_begin = post.time_begin;
    var time_end = post.time_end;
    if (list_rollnumber != "") { // if has student in added list
      var sql = "SELECT contest_name FROM contest WHERE contest_id=?"
      db.query(sql, [contest_id], function (err, results) {
        if (err || results.length == 0) { logger.error(err); res.redirect("/error"); return }
        var contest_name = results[0].contest_name.replace(/ /g, '-')
        var list = list_rollnumber.split(",")
        var student_name = "";
        var sql_contest_student = '';
        var data_student_name = "";
        var path_to_student_name_file = storage.TESTCASE + contest_name + "/student.txt";
        
        fs.exists(path_to_student_name_file, function (exists) {
          if (!exists) {
            fs.writeFileSync(storage.TESTCASE + contest_name + "/student.txt", data_student_name);
          } else {
            data_student_name =  fs.readFileSync(path_to_student_name_file, {encoding:'utf8', flag:'r'});
          }
        });

        for (let i = 0, l = list.length; i < l; ++i) {
          // create a new folder contains submission files of student
          if (!fs.existsSync(storage.BAILAM + contest_name + '/' + list[i])) {
            fs.mkdirSync(storage.BAILAM + contest_name + '/' + list[i])
            student_name += "\n" + list[i];
          }
          //select id of student by rollnumber NhanNT
          sql_contest_student = "SELECT `id`, `name` FROM `student_account` WHERE rollnumber = ?";
          db.query(sql_contest_student, [list[i]], (errSelect, resSelect) => {
            if (errSelect) { logger.error(errSelect); res.redirect("/error"); return; }
            //write students name by roll number student to student.txt 
            data_student_name += list[i] + "=" + resSelect[0].name + "\n";
            fs.exists(path_to_student_name_file, function (exists) {
              fs.writeFileSync(storage.TESTCASE + contest_name + "/student.txt", data_student_name);
            });
            //insert student id and contest id into contest_student NhanNT
            sql_contest_student = 'INSERT INTO `contest_student`( `student_id`, `contest_id`, `status`) VALUES (?,?,?)';
            db.query(sql_contest_student, [resSelect[0].id, contest_id, 1], (errInsert, resInsert) => {
              if (errInsert) { logger.error(errInsert); res.redirect("/error"); return; }
            });
          });
          //update contest_id in student_account
        }
        sql = sql.slice(0, -4)
        if (err) { logger.error(err); res.redirect("/error"); return }
        logger.info(list.length + " students in contest " + contest_id + " has added: " + list)
        sleep(500).then(() => {
          fs.writeFileSync(storage.EVENT + 'workspaceEvent/workspaceEvent.txt', results[0].contest_name + student_name);
          res.redirect("/contest/load-student?class_name=" + class_name +
           "&contest_id=" + contest_id + "&time_begin=" + time_begin + "&time_end=" + time_end)
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
    var other_class_name = req.query.other_class_name
    if (other_class_name != "") {
      var workbook = XLSX.readFile(storage.EXCEL + other_class_name)
    } else {
      var workbook = XLSX.readFile(storage.EXCEL + class_name)
    }
    
    // var workbook = XLSX.readFile(storage.EXCEL + class_name + '.xls')
    var sheet_name_list = workbook.SheetNames
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])

    if (typeof xlData[0].RollNumber === "undefined" || typeof xlData[0].Class === "undefined" || typeof xlData[0].FullName === "undefined" || typeof xlData[0].Email === "undefined") {
      res.render('add-class.ejs', { data: [], xlData: "", message: "", error: "Invalid file excel", class_name: class_name, role: req.session.role, user: req.session.user, teacher_role: req.session.teacher_role, detail: true })
    } else {
      if (req.session.sql_err) {
        req.session.sql_err = false
        res.render('add-class.ejs', { data: [], xlData: xlData, message: "", error: "Duplicate student roll number or email", class_name: class_name, role: req.session.role, user: req.session.user,teacher_role: req.session.teacher_role, detail: true })
      } else {
        res.render('add-class.ejs', { data: [], xlData: xlData, message: "Load students successfully!", error: "", class_name: class_name, role: req.session.role, user: req.session.user, teacher_role: req.session.teacher_role, detail: false })
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

      var class_name = files.filetoupload.name
      if (class_name == "") { // check if dont choose file
         res.render('add-class.ejs', {teacher_role: req.session.teacher_role, data: [], xlData: "", message: "", error: "Input must be not empty. Please choose a file!", class_name: class_name, role: req.session.role, user: req.session.user, detail: true })
        return
      }

      if (!/^(FA|SP|SU)\d{2}[_][A-Z]{3}\d{3}[_][A-Z]{2}\d{4}[.](|[A-Z]{2}[.])(xls|xlsx)$/.test(class_name)) {
        res.render('add-class.ejs', {teacher_role: req.session.teacher_role, data: [], xlData: "", message: "", error: "File name is not follow format!(Ex:SU21_PRO201_SE1302.xls or SU21_PRO201_SE1302.HL.xls)", class_name: class_name, role: req.session.role, user: req.session.user, detail: true })
        return
      }

      // check class is exist
      var splitClassname = class_name.split('.')[0].split('_');
      var semester = splitClassname[0]
      var subject = splitClassname[1]
      var className = class_name.split('.').length == 2 ? splitClassname[2] : (splitClassname[2] + "." + class_name.split('.')[1]);
      var sql = " SELECT semester, subject, class_name FROM class WHERE semester=? and subject=? and class_name=? AND status=1"
      var newfile = "";

      db.query(sql, [semester, subject, className], (err, results) => {
        if (err) { logger.error(err); res.redirect("/error"); return }
        if (results.length == 0) { // if class is not exist, insert new class to db
          var sqlCreateClass = " INSERT INTO `class`(`semester`, `subject`, `class_name`) VALUES (?,?,?) ";
          db.query(sqlCreateClass, [semester, subject, className], (err) => {
            if (err) { logger.error(err); res.redirect("/error"); return }
          });
          newfile = class_name;
        } else {
          var tmpCount = class_name.split('.').length;
          newfile = tmpCount == 2 ? (class_name.split('.')[0] + "_" + Math.random() + "." + class_name.split('.')[1]) : (class_name.split('.')[0] + "." + class_name.split('.')[1] + "_" + Math.random() + "." + class_name.split('.')[2]);
        }
        // get file upload and rewrite it 
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
            res.redirect("/contest/load-class?class_name=" + class_name + "&other_class_name=" + newfile)
          })
        });
      });
    })
  } else {
    res.redirect("/error")
    return
  }
}

function getResult(sql){
  return new Promise(function(resolve, reject){
    db.query(sql, function(err, result){
      if(err){
        reject("message error")
      }else{
        resolve(result)
      }
    })
  })
}

//-----------------------------------------------Create Class------------------------------------------------------
/**
 * Create a new Class
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.create_class = async function (req, res) {
  if (req.method == "POST") {
    var post = req.body
    var RollNumber = post.RollNumber.split(',')
    var FullName = post.FullName.split(',')
    var class_name = post.class_name
    var email = post.Email.split(',')

    var sqlInsert = "";
    var tmpUpdateStatusAndNameSql = "";
    var tmpUpdateEmailSql = "";
    for (let i = 0; i < RollNumber.length; i++) {
      sqlInsert = "INSERT INTO student_account(rollnumber, name, email) VALUES  ('" + 
      RollNumber[i] + "','" + FullName[i] + "','" + email[i] +  "') ON DUPLICATE KEY UPDATE rollnumber=rollnumber; ";
      tmpUpdateStatusAndNameSql = " UPDATE student_account SET status=1, name='" + FullName[i] + "' WHERE rollnumber='" + RollNumber[i] + "';";
      tmpUpdateEmailSql = "UPDATE student_account SET email='" + email[i] + "' WHERE rollnumber='" + RollNumber[i] + 
      "' AND (SELECT `email` FROM `student_account` WHERE email='" + email[i] + "') IS NULL;"
      var resInsert = await getResult(sqlInsert);
      var updateStatusAndNameInsert = await getResult(tmpUpdateStatusAndNameSql);
      var updateEmailInsert = await getResult(tmpUpdateEmailSql);
    }

    var splitClassname = class_name.split('_');
    var semester = splitClassname[0]
    var subject = splitClassname[1]
    var className = splitClassname[2].split('.').length == 2 ? splitClassname[2].split('.')[0] : (splitClassname[2].split('.')[0] + "." + splitClassname[2].split('.')[1]);

    var sqlGetIdClass = "SELECT `id` FROM `class` WHERE semester='"+ semester + "' and subject='"+ subject + "' and class_name='"+ className + "';";
    var selectClassID = await getResult(sqlGetIdClass);
    var ClassID = selectClassID[0].id;

    var checkAvailableStudentSql = "";
    var selectAvailableStudentInClass = "";
    var selectNotAvailableStudentInClass = "";
    var insertClassStudentSql = "";
    var count = 0;

    for (let i = 0; i < RollNumber.length; i++) {
      checkAvailableStudentSql = "SELECT `id` FROM `student_account` WHERE rollnumber='" + RollNumber[i] + "' AND status=1;";
      var selectStuID = await getResult(checkAvailableStudentSql);
      if (selectStuID.length != 0) {
        var StuID = selectStuID[0].id;
        selectAvailableStudentInClass = "SELECT `student_id`, `class_id`, `status` FROM `class_student` WHERE (student_id=" +
        StuID + " AND class_id=" + ClassID + ") AND status=1";
        var checkExistStuClass = await getResult(selectAvailableStudentInClass);
   
        selectNotAvailableStudentInClass = "SELECT `student_id`, `class_id`, `status` FROM `class_student` WHERE (student_id=" +
                  StuID + " AND class_id=" + ClassID + ") AND status=0";
        var checkDisable = await getResult(selectNotAvailableStudentInClass);

        if (checkExistStuClass.length == 0) {
          if (checkDisable.length != 0) {
            var  updateStatusSql = "UPDATE `class_student` SET `status`=1 WHERE student_id=" + StuID +" AND class_id=" + ClassID + " ;";
            var updateStatus = await getResult(updateStatusSql);
          } else {
            insertClassStudentSql = "INSERT INTO `class_student`(`student_id`, `class_id`) VALUES (" + StuID + ", " + ClassID + ")";
            var AddClassStudent = await getResult(insertClassStudentSql);
          }
          count += 1;
        } 
      }
    }
    req.session.stuAddClass = count;
    req.session.classAdded = class_name.split('.')[0];
    req.session.addByExcel = true
    res.redirect('/admin/student');
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
  // if Problem and testcase exist on db
  if (req.session.duplicate_prbAtc) {
    req.session.duplicate_prbAtc = false
    error = "Failed! Problem and testcase were existed!"
  }
  // wrong type file or the file's not is right testcase file
  if (req.session.upload_err) {
    req.session.upload_err = false
    error = "Failed! Please check your files!"
  }
  // if file upload sucess
  if (req.session.upload_success) {
    req.session.upload_success = false
    message = "Problem and testcase have been added."
  }
  //delete prblem and testcase successful
  if (req.session.delPrbSuccess) {
    req.session.delPrbSuccess = false
    message = "Problem and testcase have been deleted."
  }
  //cant delete prblem and testcase
  if (req.session.delPrbErr) {
    req.session.delPrbErr = false
    error = "Failed! Can not delete!"
  }
  var contest_id = req.query.contest_id
  var problem_id = []
  var path_problem = []
  var path_testcase = []
  var testcase_size = []
  var limitSub = []
  var contest_name = ''
  var sql = "SELECT contest_name, problem_id, path_problem, path_testcase, times FROM contest_detail INNER JOIN contest ON contest_detail.contest_id = contest.contest_id WHERE contest_detail.contest_id=?"
  var pathToContestConfigSetting;
  var data_config;
  var data_limitSub;

  db.query(sql, [contest_id], function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    if (results.length == 0) {
      sql = "SELECT contest_name FROM contest WHERE contest_id=?"
      db.query(sql, [contest_id], function (err, results) {
        if (err || results.length == 0) { logger.error(err); res.redirect("/error"); return }
        contest_name = results[0].contest_name 
        pathToContestConfigSetting = storage.TESTCASE + contest_name + "/config.txt";
        data_config =  fs.readFileSync(pathToContestConfigSetting, {encoding:'utf8', flag:'r'});
        var data_config_inline = data_config.split('\n');
        data_limitSub = data_config_inline[11];

        res.render('add-problem.ejs', {
          teacher_role: req.session.teacher_role, 
          problem_id: problem_id, 
          path_problem: path_problem, 
          path_testcase: path_testcase, 
          testcase_size: testcase_size, 
          limitSub: limitSub, 
          contest_id: contest_id, 
          contest_name: contest_name, 
          error: error, message: message, 
          role: req.session.role, user: req.session.user,
          data_limitSub: data_limitSub 
        })
      })
    } else {
      contest_name = results[0].contest_name;
      pathToContestConfigSetting = storage.TESTCASE + contest_name + "/config.txt";
      data_config =  fs.readFileSync(pathToContestConfigSetting, {encoding:'utf8', flag:'r'});
      var data_config_inline = data_config.split('\n');
      data_limitSub = data_config_inline[11];
      for (let i = 0, l = results.length; i < l; i++) {
        problem_id.push(results[i].problem_id)
        path_problem.push(results[i].path_problem)
        path_testcase.push(results[i].path_testcase)
        testcase_size.push(getFolders(results[i].path_testcase).length) // testcase size
        limitSub.push(data_limitSub)
      }


      res.render('add-problem.ejs', {
        teacher_role: req.session.teacher_role, 
        problem_id: problem_id, 
        path_problem: path_problem, 
        path_testcase: path_testcase, 
        testcase_size: testcase_size, 
        limitSub: limitSub, contest_id: contest_id, 
        contest_name: contest_name, 
        error: error, 
        message: message, 
        role: req.session.role, 
        user: req.session.user,
        data_limitSub: data_limitSub  
      })
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
exports.add_problem_testcase = async function (req, res) {
  if (req.session.role == "Student") {
    res.redirect("/error")
    return
  }
  if (req.method == "POST") {
    // upload problem to folder './public/debai/contest_name
    var form = new formidable.IncomingForm()
    form.maxFileSize = 5 * 1024 * 1024 // limit upload 5mb
    form.parse(req, async function (err, fields, files) {
      try {
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
      } catch (error){
        logger.error(error);
        res.redirect("/error");
        return
      }
      
      var contest_name = fields.contest_name
      var oldpathProb = files.filetouploadProblem.path
      var newpathProb = storage.DEBAI + contest_name + '/' + files.filetouploadProblem.name

      var checkExistSql = "SELECT `contest_id`, `problem_id` FROM `contest_detail` WHERE contest_id=" + 
      contest_id + " AND problem_id='" + fields.nameProb + "'";
      var checkExist = await getResult(checkExistSql);

      if (checkExist.length == 0) {
        fs.readFile(oldpathProb, async function (err, data) {
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

          fs.readFile(oldpathTest, async function (err, data) {
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
              sleep(1000).then(async () => {
                checkTestcase(newpathTest.substring(0, newpathTest.length - 4), req)
                if (!req.session.upload_err) {
                  req.session.upload_success = true
                  var sql = "INSERT INTO contest_detail VALUES (" + contest_id + ",'" + fields.nameProb + "','" + 
                  newpathProb + "','" + newpathTest.substring(0, newpathTest.length - 4) +"'," + fields.limitSub + ")";
                  var prbAndTcInsert = await getResult(sql);
                  logger.info("Upload Successfully! problem contest " + contest_id + " : " + files.filetouploadProblem.name + " .Testcase: " + files.filetouploadTestcase.name)
                } else {
                  var deleteZipFile = await deleteFolder(newpathTest);
                  var deleteTcDir = await deleteFolder(newpathTest.substring(0, newpathTest.length - 4));
                  var deletePrbDir = await deleteFolder(newpathProb);
                  logger.info("Upload Failure! Problem: " + files.filetouploadProblem.name + " . Testcase: " + files.filetouploadTestcase.name)
                }
                fs.writeFileSync(storage.EVENT + 'testcaseEvent/testcaseEvent.txt', Math.random(1000) + 'changed');
                res.redirect("/contest/add-problem?contest_id=" + contest_id)
              })
            } catch (err) {
              if (err) { logger.error(err); res.redirect("/error"); return }
            }
          })
        })
      } else {
        req.session.duplicate_prbAtc = true
        return res.redirect("/contest/add-problem?contest_id=" + contest_id)
      }
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
exports.delete_problem_testcase = async function (req, res) {
  if (req.session.role == "Student") {
    res.redirect("/error")
    return
  }
  if (req.method == "POST") {
    var post = req.body
    var contest_id = post.contest_id
    var problem_id = post.problem_id_del
    var sql = "DELETE FROM contest_detail WHERE contest_id="+ contest_id + " AND problem_id='" + problem_id + "'";
    var getPrbAndTCSql = "SELECT `contest_id`, `problem_id`, `path_problem`, `path_testcase` " + 
    " FROM `contest_detail` WHERE contest_id=" + contest_id + " AND problem_id='" + problem_id + "'";

    var selectPrbTC = await getResult(getPrbAndTCSql);
    if (selectPrbTC.length != 0) {
      try{
        var deletePrbAtcDb = await getResult(sql)
        var deleteZipFile = await deleteFolder(selectPrbTC[0].path_testcase + ".zip")
        var deleteTcDir = await deleteFolder(selectPrbTC[0].path_testcase)
        var deletePrbDir = await deleteFolder(selectPrbTC[0].path_problem)
        logger.info("Delete in contest_detail where contest " + contest_id + " and problem " + problem_id)
        req.session.delPrbSuccess = true;
      } catch(error){
        logger.info("Fail to delete in contest_detail where contest " + contest_id + " and problem " + problem_id)
        req.session.delPrbErr = true;
        res.redirect("/contest/add-problem?contest_id=" + contest_id)
        return;
      }
    }
    fs.writeFileSync(storage.EVENT + 'testcaseEvent/testcaseEvent.txt', Math.random(1000) + 'changed');
    res.redirect("/contest/add-problem?contest_id=" + contest_id)
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
    if (list.length == 0) {
      req.session.upload_err = true
      return
    }
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

exports.contestAll = function (req, res) {
  var sql = ""
    sql = "SELECT `contest_name`FROM `contest` WHERE status=1"
  db.query(sql, function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    res.send({ data: results })
  })
}

function deleteFolder(path) {
  return new Promise((resolve, reject) => {
    fs.exists(path, (exist) => {
      if(exist) {
        fs.rmdir(path , {recursive: true}, (err) => {
          resolve(true);
        })   
      }
      resolve(true);
    });
  });
}


exports.download_excel_template = (req, res) => {
  res.download("./public/excel/SU21_PRF192_IA1301.xlsx");
}