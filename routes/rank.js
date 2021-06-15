const getFolders = require('./tool').getFolders
const RoundAndFix = require('./tool').RoundAndFix
//---------------------------------rank-time----------------------------------
/**
 * Load time
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.rank_time = function (req, res) {
  var userId = req.session.userId
  if (req.session.role == "Student") {
    res.redirect("/error")
    return
  }
  var sql = ""
  if (req.session.teacher_role <= 1) {
    sql = "SELECT contest_id, contest_name, time_begin, time_end FROM contest WHERE deleted=0"
  } else {
    sql = "SELECT contest.contest_id, contest.contest_name, contest.time_begin, contest.time_end FROM contest INNER JOIN contest_owner ON contest.contest_id=contest_owner.contest_id WHERE contest_owner.teacher_id='" + userId + "' AND deleted=0"
  }
  db.query(sql, function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    if (results.length == 0) res.render('rank-time.ejs', { data: '', role: req.session.role, user: req.session.user })
    else res.render('rank-time.ejs', { data: results, role: req.session.role, user: req.session.user })
  })
}
//---------------------------------data rank----------------------------------
/**
 * load data to divide problems in <th> tag
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.data_rank = function (req, res) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  var message = ""
  var contest_id = req.query.contest_id
  var sql = "SELECT rollnumber FROM student_account WHERE contest_id=? LIMIT 1"
  db.query(sql, [contest_id], function (err, results) {
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
        if (results.length == 0) { // if contest donnt have any problem
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
/**
 * Load data into body of table
 * @param {*} req 
 * @param {*} res 
 */
exports.load_rank = function (req, res) {
  var contest_id = req.query.contest_id
  var sql = "SELECT student_account.userId, student_account.rollnumber, student_account.name, student_account.class, contest.contest_id, contest.contest_name, contest.time_begin, contest.time_end FROM contest " +
    "INNER JOIN student_account ON student_account.contest_id=contest.contest_id " +
    "WHERE contest.contest_id=?"
  db.query(sql, [contest_id], function (err, results) {
    if (err || results.length == 0) { logger.error(err); res.redirect("/error"); return }
    var contest_name = results[0].contest_name.replace(/ /g, '-')
    var problem_files = []
    var maxtimes = {}
    var sql = "SELECT problem_id, times FROM contest_detail WHERE contest_id=?"
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
          maxtimes[data[i].problem_id] = data[i].times
        }
        // get all judged Logs in folder './public/nopbai/Logs/' + contest_name
        fs.readdir(storage.NOPBAI + 'Logs/' + contest_name, function (err, log_files) {
          if (err) { logger.error(err); res.redirect("/error"); return }
          try {
            log_files = log_files.map(function (fileName) {
              return {
                name: fileName,
                time: fs.statSync(storage.NOPBAI + 'Logs/' + contest_name + '/' + fileName).mtime.getTime()
              }
            }).sort(function (a, b) {
              return b.time - a.time
            }).map(function (v) {
              return v.name
            })
          } catch (err) { }
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
              var contents = fs.existsSync(storage.NOPBAI + 'Logs/' + results[0].contest_name.replace(/ /g, '-') + '/' + log_files[i]) ? fs.readFileSync(storage.NOPBAI + 'Logs/' + results[0].contest_name.replace(/ /g, '-') + '/' + log_files[i], 'utf8') : ""
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
              if (isNaN(point[results[i].rollnumber][problem_files[j]]) == false && point[results[i].rollnumber][problem_files[j]] > 0) {
                // Calculate penalty: for more than 1 submit, subtract 10%
                point[results[i].rollnumber][problem_files[j]] = RoundAndFix(point[results[i].rollnumber][problem_files[j]] * (maxtimes[problem_files[j]] - times[results[i].rollnumber][problem_files[j]] + 1) / maxtimes[problem_files[j]], 1)
                totalpoint[results[i].rollnumber] += point[results[i].rollnumber][problem_files[j]]
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
                tb.push("<center class='solved'>" + point[results[i].rollnumber][problem_files[j]].toFixed(1) + '<br>(' + times[results[i].rollnumber][problem_files[j]] + ')</center>')
              } else if (point[results[i].rollnumber][problem_files[j]] == 0) {
                tb.push("<center class='attempted'>" + point[results[i].rollnumber][problem_files[j]] + '<br>(' + times[results[i].rollnumber][problem_files[j]] + ')</center>')
              } else {
                tb.push("<center>" + point[results[i].rollnumber][problem_files[j]] + '<br>(' + times[results[i].rollnumber][problem_files[j]] + ')</center>')
              }
            }
            if (totaltimes[results[i].rollnumber] == 0) {
              tb.push('<center>Not submit<br>(0)</center>')
            } else {
              tb.push('<center>' + totalpoint[results[i].rollnumber].toFixed(1) + '<br>(' + totaltimes[results[i].rollnumber] + ')</center>')
            }
            tb.push((totalpoint[results[i].rollnumber] / problem_files.length).toFixed(1))
            obj.data.push(tb)
          }
          res.send(obj)
        })
      }
    })
  })

}
//---------------------------------rank detail----------------------------------
/**
 * Get detail data for the table in rank page following to student
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.detail_rank = function (req, res) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  var rollnumber = req.query.rollnumber
  var sql = "SELECT contest.contest_name, contest.contest_id FROM contest INNER JOIN student_account ON student_account.contest_id=contest.contest_id WHERE student_account.rollnumber=?"
  db.query(sql, [rollnumber], function (err, results) {
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
      try {
        bailam = bailam.map(function (fileName) {
          return {
            name: fileName,
            time: fs.statSync(fileName).mtime.getTime()
          }

        }).sort(function (a, b) {
          return b.time - a.time
        }).map(function (v) {
          return v.name
        })
      } catch (err) { }
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
      res.render('rank-detail.ejs', { bailam: bailam, contest_name: contest_name, contest_id: contest_id, rollnumber: rollnumber, log_files: logs, testcase_size: testcase_size, message: "", role: req.session.role, user: req.session.user })
    })
  })
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
        if (/^(c|cpp|py|sql)$/.test(file.split('.').pop())) {
          results.push(file)
        }
      }
    })
  } catch (error) { }
  return results
}