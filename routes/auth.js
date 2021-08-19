//TIME OUT
const minutes = 15

exports.googleCallback = function(req, res) {
    res.redirect('/success')
    
}

exports.success = function(req, res) {
  var message = ''
  var email = req.user.emails[0].value
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

    var sql = "SELECT userId, rollnumber FROM student_account WHERE " +
     " (email=? and ip=?) or (email=? and " + new Date().getTime() +
    " >= ROUND(UNIX_TIMESTAMP(timeout) * 1000) and islogin=0 AND status=1)"
    db.query(sql, [email, ipaddress, email],function (err, results) {
      if (err) { logger.error(err); res.redirect("/error"); return }
      if (results.length) {
        req.session.userId = results[0].userId
        req.session.role = "Student"
        req.session.user = results[0].rollnumber
        req.session.ipaddress = ipaddress
        // record ip and timeout
        sql = "UPDATE student_account SET ip=?,timeout='" + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + minutes * 60000).toISOString().substring(0, 19) + "', islogin=1 WHERE userId=?"
        db.query(sql, [ipaddress, results[0].userId])
        logger.info(req.session.role + " " + req.session.user + " has connected")
        res.redirect('/submission')
      } else {
        sql = "SELECT userId, rollnumber, role_id FROM employee_account WHERE email=? AND employee_account.status = 1"
        db.query(sql, [email], function (error, data) {
          if (error) { logger.error(error); res.redirect("/error"); return }
          if (data.length) {
            req.session.userId = data[0].userId
            req.session.role = "Teacher"
            req.session.user = data[0].rollnumber
            req.session.teacher_role = data[0].role_id
            req.session.ipaddress = ipaddress
            logger.info(req.session.role + " " + req.session.user + " has connected")
            res.redirect('/contest')
          } else {
            message = 'Your email is not exist or unavailable'
            res.render('index.ejs', { message: message, username: req.session.user })
          }

        })
        
      }

    })
}

