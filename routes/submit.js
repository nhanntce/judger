const getFolders = require('./tool').getFolders
const RoundAndFix = require('./tool').RoundAndFix
const formidable = require('formidable')
const storage = require('./storage');
//---------------------------------submissions page----------------------------------
/**
 * @author NhanNT
 * query sync
 * @param  {[type]} sql    [description]
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
var queryPromise = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if(err) {
        reject(err);
      } else {
        resolve(results);
      }
    })
  });
}
/** */
exports.submission = async function (req, res) {
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
  var listsql = []
 
  if (req.session.role == "Student") {
    var listContestSql = "SELECT contest.`contest_id`, contest.time_begin, contest.time_end FROM `contest`, contest_student WHERE " +
    " contest.contest_id = contest_student.contest_id AND contest_student.student_id = " +
    " (SELECT `id` FROM `student_account` WHERE userId = ?) AND contest.status = 1 AND contest_student.status = 1";
    try {
      var listContests = await queryPromise(listContestSql, [userId]);
      if (listContests.length == 0) { // if student have no contests
        error = "You have no contest"
        res.render('submit.ejs', { error: error, role: req.session.role, user: req.session.user, teacher_role: req.session.teacher_role })
        return;
      } else {
        var time_tmp = 0;
        for(let i = 0; i < listContests.length; i++) {
          if(new Date() > new Date(listContests[i].time_begin) && new Date() < new Date(listContests[i].time_end)) {
            time_tmp = i;
            break;
          }
          
          if(new Date() - new Date(listContests[i].time_begin) < 0 && new Date(listContests[i].time_begin) - new Date(listContests[time_tmp].time_begin) <= 0 ){
            time_tmp = i;
          }
        }
      }
      var idContest = listContests[time_tmp].contest_id;

      sql = "SELECT contest.contest_id, contest.time_begin, contest.time_end, " +
      " contest.contest_name, student_account.name, student_account.rollnumber, " +
      " contest_detail.problem_id, contest_detail.path_problem,contest_detail.times, " +
      " contest.language FROM student_account INNER JOIN contest_student ON " +
      " student_account.id=contest_student.student_id AND contest_student.contest_id= ? AND contest_student.status=1" +
      " INNER JOIN contest_detail ON contest_student.contest_id=contest_detail.contest_id " +
      " INNER JOIN contest ON contest_detail.contest_id=contest.contest_id AND contest.status=1 WHERE student_account.id= " +
      " (SELECT student_account.id FROM student_account WHERE student_account.userId = ?)";
      listsql = [idContest, userId];
    } catch(error) {
      logger.error(error); res.redirect("/error"); return;
    }
    
  } else {
    sql = "SELECT contest.time_begin, contest.time_end, contest.contest_name, " +
      " employee_account.name, employee_account.rollnumber, contest_detail.problem_id, " +
      " contest_detail.path_problem,contest_detail.times,contest.language FROM employee_account " +
      "INNER JOIN contest ON contest.teacher_id=employee_account.userId " +
      "INNER JOIN contest_detail ON contest.contest_id=contest_detail.contest_id " +
      "WHERE contest.contest_id=? AND contest.status = 1"
    listsql = [req.query.contest_id]
  }
  try {
    var results = await queryPromise(sql, listsql);
    if(results.length == 0 ){
      error = "Your contest does not have any problem. Please wait until this contest was added problems"
      res.render('submit.ejs', { error: error, role: req.session.role, user: req.session.user, teacher_role: req.session.teacher_role })
      return;
    }
    var contest_name = results[0].contest_name.replace(/ /g, '-')
    var time_begin = results[0].time_begin
    var time_end = results[0].time_end
    req.session.time_begin = time_begin
    req.session.time_end = time_end
    req.session.contest_name = contest_name
    req.session.rollnumber = results[0].rollnumber
    req.session.times = req.session.times ? req.session.times : {}
    req.session.maxtimes = {}
    req.session.debai = []
    req.session.problem_id = []
    var clonetimes = {}
    var configContent = fs.readFileSync(storage.TESTCASE + contest_name + '/config.txt', 'utf8')

    for (let i = 0; i < results.length; ++i) {
      clonetimes[results[i].problem_id] = configContent.split('\n')[11]
      // clonetimes[results[i].problem_id] = results[i].times
      // req.session.maxtimes[results[i].problem_id] = results[i].times
      req.session.maxtimes[results[i].problem_id] = configContent.split('\n')[11]
      req.session.debai.push(path.basename(results[i].path_problem))
      req.session.problem_id.push(results[i].problem_id)
    }

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
    try {
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
    } catch (err) {}

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
        if (clonetimes[tmp] > 0) {
          clonetimes[tmp]--
        }
        if (files[i].includes(req.session.rollnumber)) {
          log_files.push(files[i])
        }
        if (Object.keys(req.session.times).length !== 0) {
          req.session.times[tmp] = Math.min(clonetimes[tmp], req.session.times[tmp])
        }
      }
      var logs = []
      for (let i = 0; i < bailam.length; ++i) {
        for (let j = 0; j < log_files.length; ++j) {
          if (bailam[i].includes(log_files[j].substring(0, log_files[j].length - 4))) {
            logs.push(log_files[j])
            var tmp = log_files[j].split('][')[log_files[j].split('][').length - 1].split('].')[0]
            testcase_size.push(getFolders(storage.TESTCASE + contest_name + '/' + tmp).length)
            break
          }
        }
      }
      if (Object.keys(req.session.times).length === 0) {
        req.session.times = JSON.parse(JSON.stringify(clonetimes))
      }
      res.render('submit.ejs', 
        { 
          error: "",
          contest_id: req.query.contest_id, 
          language: results[0].language, 
          name: results[0].name, 
          rollnumber: results[0].rollnumber, 
          contest_name: contest_name, 
          time_begin: time_begin, 
          time_end: time_end, 
          debai: debai, 
          bailam: bailam, 
          log_files: logs, 
          testcase_size: testcase_size, 
          clonetimes: req.session.times, 
          maxtimes: req.session.maxtimes, 
          message: message, 
          role: req.session.role, 
          user: req.session.user, 
          teacher_role: req.session.teacher_role 
      })
    })
  } catch(error) {
    logger.error(error); res.redirect("/error"); return;
  }
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
  // declare variables for config file
  var configContent = fs.readFileSync(storage.TESTCASE + contest_name + '/config.txt', 'utf8')
  var minusPoint = 0
  var minusPercent = 0
  var checkFormat = configContent.split('\n')[2].split('=')[1]
  var minusFormat = configContent.split('\n')[3]
  var checkCmt = configContent.split('\n')[4].split('=')[1]
  var checkCmtMode = configContent.split('\n')[5].split('=')[1]
  var percentCmtAcp = configContent.split('\n')[6]
  var minusPoint = configContent.split('\n')[7]
  var minusPercent = configContent.split('\n')[7]
  var checkPlagiarism = configContent.split('\n')[8].split('=')[1]
  var plagiarismAcp = configContent.split('\n')[9]
  var penaltyMode = configContent.split('\n')[10].split('=')[1]
  var penaltyLimited = configContent.split('\n')[11]

  // declare variables for logs file
  var format = ''
  var comment = ''
  var plagiarism = ''

  // get all judged Logs in folder './public/nopbai/Logs/' + contest_name
  fs.readdir(storage.NOPBAI + 'Logs/' + contest_name, function (err, log_files) {
    if (err) { res.redirect("/error"); return }
    try {
      log_files = log_files.map(function (fileName) {
        return {
          name: fileName,
          time: fs.statSync(storage.NOPBAI + 'Logs/' + contest_name + '/' + fileName).mtime.getTime()
        }
      }).sort(function (a, b) {
        return b.time - a.time;
      }).map(function (v) {
        return v.name;
      })
    } catch (err) { }
    var check = {}
    var result = {}
    var rescnt = {}
    var reserr = {}
    var score = {}
    var testcase_size = 0
    var total = 0
    var penalty = {}
    for (let i = 0, l = log_files.length; i < l; ++i) {
      var tmp = log_files[i].split('][')[log_files[i].split('][').length - 1].split('].')[0]
      if (log_files[i].includes(rollnumber) && !check[tmp]) {
        testcase_size = getFolders(storage.TESTCASE + contest_name + '/' + tmp).length
        var logcontent = fs.existsSync(storage.NOPBAI + 'Logs/' + contest_name + '/' + log_files[i]) ?
          fs.readFileSync(storage.NOPBAI + 'Logs/' + contest_name + '/' + log_files[i], 'utf8') : "";


        if (logcontent) {
          if (!logcontent.split('\n')[0].includes('Error')) {

            // assign value for logs file
            format = logcontent.split('\n')[3].split(': ')[1]
            comment = logcontent.split('\n')[4].split(': ')[1]
            plagiarism = logcontent.split('\n')[5].split(': ')[1]

            score[tmp] = parseFloat(logcontent.split('\n')[0])

            // check the file log is not include the python file
            if (!log_files[i].includes('py')) {
              // check penalty mode is easy 

              if (penaltyMode == 'Hard' && score[tmp] < 10) {
                score[tmp] = 0
              }
              if (checkPlagiarism == 'true') {
                if (parseFloat(plagiarism) >= parseFloat(plagiarismAcp)) {
                  score[tmp] = 0
                }
              }
              // var comment = parseFloat(logcontent.split('\n')[4].split(': ')[1])
              // var format = logcontent.split('\n')[3].split(': ')[1]

              if (checkCmt == 'true') {
                if (parseFloat(comment) < parseFloat(percentCmtAcp)) {
                  if (checkCmtMode == 'Fixed') {
                    score[tmp] = score[tmp] - minusPoint
                  } else {
                    score[tmp] = score[tmp] - (score[tmp] * minusPoint * 0.01)
                  }
                }
              }

              if (checkFormat == 'true') {
                if (format == 'false') {
                  score[tmp] = score[tmp] - minusFormat
                }
              }
            }


            if (score[tmp] < 0) {
              score[tmp] = 0;
            }

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
            score[tmp] = 0
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
      tb.push(tmp, "<a href='/problem/" + contest_name + "/" + req.session.debai[i] + "' target='_blank'>"
        + req.session.debai[i].split('.')[0] + "</a>")
      if (fs.readdirSync(storage.NOPBAI).some(v => v.includes('[' + contest_name + '][' + req.session.rollnumber + '][' + tmp + ']'))) {
        data += "<i class='fa fa-hourglass fa-spin'></i> In queue"
        tb.push(data + "</div>")
        tb.push("<div>NaN</div>")
        tb.push("<div class='text-right'>NaN</div>")
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
      if (reserr[tmp] == undefined) {
        tb.push("<div class='font-weight-bold text-default'>None</div>")
      } else {
        tb.push("<div class='font-weight-bold text-danger'>" + reserr[tmp] + "</div>")
      }
      // Calculate penalty: for more than 1 submit
      // var pen = req.session.times[tmp]
      var pen = req.session.times[tmp]

      // check mode of penalty 
      if (penaltyMode == 'Easy') {

        // tb.push("<div class='text-right'>" + RoundAndFix(score[tmp] * (pen + 1) / req.session.maxtimes[tmp], 1).toFixed(1) + "</div>")
        tb.push("<div class='text-right'>" + RoundAndFix(score[tmp] * (pen + 1) / penaltyLimited, 1).toFixed(1) + "</div>")
      } else {
        tb.push("<div class='text-right'>" + RoundAndFix(score[tmp], 1).toFixed(1) + "</div>")
      }

      if (!score[tmp]) score[tmp] = 0

      // total += RoundAndFix(score[tmp] * (pen + 1) / req.session.maxtimes[tmp], 1)
      // check mode of penalty 
      if (penaltyMode == 'Easy') {
        total += RoundAndFix(score[tmp] * (pen + 1) / penaltyLimited, 1)
      } else {
        total += RoundAndFix(score[tmp], 1)
      }
      obj.data.push(tb)
    }
    tb = new Array()
    tb.push("", "", "", "<div class='font-weight-bold'>Total</div>", "<div class='text-right'>" + total.toFixed(1) + "</div>")
    obj.data.push(tb)
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
        if (err || typeof files.filetoupload === "undefined" || files.filetoupload.name == "" || !/^\w+\.(c|cpp|py|sql|java)$/.test(files.filetoupload.name)) {
          req.session.submit_error = true
          res.redirect("/submission")
          return
        }
        upload = true
      }
      if (err || !req.session.problem_id.includes(fields.tenbai) || req.session.times[fields.tenbai] <= 0) {
        req.session.submit_error = true
        res.redirect("/submission")
        return
      }
      // Decrease req.session.times 1 after submit success
      req.session.times[fields.tenbai]--
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
        } else if (fields.language == 'MySQL') {
          type = 'sql'
        } else if (fields.language == 'Java') {
          type = 'java';
        } else {
          req.session.submit_error = true
          res.redirect("/submission")
          return
        }
      }
      var ip = req.session.ipaddress
      var newfile = '[' + ip + '][' + (new Date().getTime() - new Date(req.session.time_begin)) + '][' + req.session.contest_name.replace(/ /g, '-') + '][' + req.session.rollnumber + '][' + fields.tenbai + '].' + type
      var newpath = storage.NOPBAI + newfile
      var backuppath = storage.NOPBAI + 'Backup/' + newfile
      if (upload) {
        var oldpath = files.filetoupload.path
        fs.readFile(oldpath, function (err, data) {
          if (err) { logger.error(err); res.redirect("/error"); return }
          // Write the file
          fs.writeFile(newpath, data, function (err) {
            if (err) { logger.error(err); res.redirect("/error"); return }
            // Write the file to backup path
            fs.writeFile(backuppath, data, function (err) {
              if (err) { logger.error(err); res.redirect("/error"); return }
              // Delete the file
              fs.unlink(oldpath, function (err) {
                if (err) { logger.error(err); res.redirect("/error"); return }
                req.session.submit_success = true
                logger.info("Sumit code file " + newfile + " of contest " + req.session.contest_name + " problem " + fields.tenbai + " by " + userId)
                if (req.session.role != "Student") {
                  res.redirect("/submission?contest_id=" + fields.contest_id)
                } else {
                  res.redirect("/submission")
                }
              })
            })
          })
        })
      } else {
        // Write the file
        fs.writeFile(newpath, fields.content, function (err) {
          if (err) { logger.error(err); res.redirect("/error"); return }
          fs.writeFile(backuppath, fields.content, function (err) {
            if (err) { logger.error(err); res.redirect("/error"); return }
            req.session.submit_success = true
            logger.info("Sumit code content field " + newfile + " of contest " + req.session.contest_name + " problem " + fields.tenbai + " by " + userId)
            if (req.session.role != "Student") {
              res.redirect("/submission?contest_id=" + fields.contest_id)
            } else {
              res.redirect("/submission")
            }
          })
        })
      }
    })
  } else {
    res.redirect("/error")
    return
  }
}
// traverse Directory
function traverseDir(dir) {
  var results = []
  try {
    var list = fs.readdirSync(dir)
    list.forEach(function (file) {
      file = dir + '/' + file
      var stat = fs.statSync(file)
      if (stat && stat.isDirectory()) {
        /* Recurse into a subdirectory */
        results = results.concat(traverseDir(file))
      } else {
        /* Is a file */
        if (/^(c|cpp|py|sql|java)$/.test(file.split('.').pop())) {
          results.push(file)
        }
      }
    })
  } catch (error) { }
  return results
}