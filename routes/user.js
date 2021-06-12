//TIME OUT
const minutes = 15
//-----------------------------------------------login page call------------------------------------------------------
/**
 * Check login
 * If role is student => GET submission page
 * Else role is teacher => GET contest page
 * When login fail => GET login page
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.login = function (req, res) {
  var message = ''

  if (req.method == "POST") {
    var post = req.body
    var user = post.user_name
    var pass = post.password
    req.session.user = post.user_name
    if (!/^[a-z0-9]+$/.test(user) || !/^[A-Za-z0-9\d=!\-@._*]*$/.test(pass)) { // check user or pass is valid
      message = 'Incorrect username or password'
      res.render('index.ejs', { message: message, username: req.session.user })
      return;
    }
    var role = (post.role == "Student") ? "student_account" : "teacher_account" // select type account
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
      var sql = "SELECT userId, rollnumber FROM " + role + " WHERE (username=? and password = MD5(?) and ip=?) or (username=? and password=MD5(?) and " + new Date().getTime() + " >= ROUND(UNIX_TIMESTAMP(timeout) * 1000) and islogin=0)"
      db.query(sql, [user, pass, ipaddress, user, pass],function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        if (results.length) {
          req.session.userId = results[0].userId
          req.session.role = post.role
          req.session.user = results[0].rollnumber
          req.session.ipaddress = ipaddress
          // record ip and timeout
          sql = "UPDATE student_account SET ip=?,timeout='" + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + minutes * 60000).toISOString().substring(0, 19) + "', islogin=1 WHERE userId=?"
          db.query(sql, [ipaddress, results[0].userId])
          logger.info(req.session.role + " " + req.session.user + " has connected")
          res.redirect('/submission')
        } else {
          message = 'Incorrect username or password'
          res.render('index.ejs', { message: message, username: req.session.user })
        }
      })

    } else { // teacher
      sql = "SELECT userId, username, rollnumber, role FROM " + role + " WHERE username=? and password=MD5(?)"
      db.query(sql, [user, pass], function (err, results) {
        if (err) { logger.error(err); res.redirect("/error"); return }
        if (results.length) {
          req.session.userId = results[0].userId
          req.session.role = post.role
          req.session.user = results[0].rollnumber
          req.session.teacher_role = results[0].role
          req.session.ipaddress = ipaddress
          logger.info(req.session.role + " " + req.session.user + " has connected")
          res.redirect('/contest')
        } else {
          message = 'Incorrect username or password'
          res.render('index.ejs', { message: message, username: req.session.user })
        }

      })
    }
  } else {
    res.render('index.ejs', { message: message, username: req.session.user })
  }

}
//-----------------------------------------------dashboard page functionality----------------------------------------------
/**
 * If exist any session => GET home page
 * Else => GET login page
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.dashboard = function (req, res, next) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  res.render('dashboard.ejs', { role: req.session.role, user: req.session.user })
}
//------------------------------------logout functionality----------------------------------------------
/**
 * When logout => update ip address and timeout
 * Then destroy this session
 * => GET login page
 * @param {*} req 
 * @param {*} res 
 */
exports.logout = function (req, res) {
  if (req.session.role == "Student") { // update record ip address and time out
    var sql = "UPDATE student_account SET ip=?,timeout='" + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + minutes * 60000).toISOString().substring(0, 19) + "', islogin=0 WHERE userId=?"
    db.query(sql, [req.session.ipaddress, req.session.userId])
  }
  logger.info(req.session.role + " " + req.session.user + " has disconnected")
  req.session.destroy(function (err) {
    res.redirect("/login")
  })
}
//--------------------------------render user details after login--------------------------------
/**
 * Check role => GET the corresponding profile page
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.profile = function (req, res) {
  var userId = req.session.userId,
    role = (req.session.role == "Student") ? "student_account" : "teacher_account"
  if (userId == null) {
    res.redirect("/login")
    return
  }
  var sql = "SELECT name, rollnumber FROM " + role + " WHERE userId=?"
  db.query(sql, [userId], function (err, result) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    res.render('profile.ejs', { data: result, role: req.session.role, user: req.session.user })
  })
}
//---------------------------------Destroy session when closing tab or browser----------------------------------
exports.session_destroy = function (req, res) {
  if (req.session.role == "Student") {
    var sql = "UPDATE student_account SET ip=?,timeout='" + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + minutes * 60000).toISOString().substring(0, 19) + "', islogin=0 WHERE userId=?"
    db.query(sql, [req.session.ipaddress, req.session.userId])
  }
  logger.info(req.session.role + " " + req.session.user + " has disconnected")
  req.session.destroy()
}