/**
 * TuPTA
 * If session of user is null will redirect login page
 * Else render admin.ejs
 * When query statement error => GET error page
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
  var sql = "SELECT * FROM student_account"
  db.query(sql, function (err, result) {
    if (err) {  // query statement error
      res.redirect("/error"); return }
    res.render('admin.ejs', { data: result });
  })

}
/**
 * TuPTA
 * If session of user == null will GET login page
 * Else render admin-student.ejs
 * Show message or error if available
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.admin_student = function (req, res) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  var error = ""
  var message = ""
  // req.session.sql_err = true it means 
  if (req.session.sql_err) {
    req.session.sql_err = false
    error = "Student acocunt has exist!"
  }
  if (req.session.added) {
    req.session.added = false
    message = "Succesfully! Students have been added."
  }
  res.render('admin-student.ejs', { message: message, error: error, teacher_role: req.session.teacher_role})
}

/**
 * TuPTA
 * If session of user == null will GET login page
 * Else render admin-teacher.ejs, 
 * Show message or error if available
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.admin_teacher = function (req, res) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  var error = ""
  var message = ""
  if (req.session.sql_err) {
    req.session.sql_err = false
    error = "Teacher acocunt has exist!"
  }
  if (req.session.added) {
    req.session.added = false
    message = "Succesfully! Teacher have been added."
  }
  res.render('admin-teacher.ejs', { message: message, error: error, teacher_role: req.session.teacher_role });
}
//-----------------------------------------------Load data student account------------------------------------------------------
/**
 * Edit by DangVTH
 * Send list student to admin-student.ejs page
 * @param {*} req 
 * @param {*} res 
 */
exports.admin_student_data = function (req, res) {
  const requestQuery = req.query;
  let columnsMap = [
    { db: "null", dt: 0 }, { db: "userId", dt: 1 }, { db: "rollnumber", dt: 2 }, { db: "email", dt: 3 }, { db: "name", dt: 4 }, { db: "class_name", dt: 5 }, { db: "contest_id", dt: 6 }, { db: "ip", dt: 7 }, { db: "timeout", dt: 8 }, { db: "islogin", dt: 9 }
  ];
  const query = "SELECT userId, rollnumber, email, name, class_name, contest_id, ip, DATE_FORMAT(timeout, '%d-%m-%Y %H:%i:%s') AS timeout, islogin " + 
  				"FROM student_account, class_student, class " +
  				"WHERE student_account.id = class_student.student_id AND class_student.class_id = class.id"
  const primaryKey = "userId"
  const nodeTable = new NodeTable(requestQuery, db, query, primaryKey, columnsMap);
  nodeTable.output((err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    res.send(data)
  })
}
//-----------------------------------------------Create a student account------------------------------------------------------
/**
 * Edit by DangVTH
 * Create a new student 
 * Then, redirect to admin/student 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.create_student = function (req, res) {
  if (req.method == "POST") {
    var post = req.body
    var rollnumber = post.rollnumber
    var name = post.name
    var classID = post.class
    // var username = post.username
    // var password = post.password
    
    var email = post.email
    var sql = "INSERT INTO student_account(rollnumber, email, name) VALUES (?, ?, ?) "
    db.query(sql, [rollnumber, email, name], function (err, result) {
      if (err) { // if error => set req.session.sql_err = true
        req.session.sql_err = true
        res.redirect("/admin/student")
      } else {
        logger.info("Create student_account rollnumber=" + rollnumber + " name=" + name + " classId=" + classID)
        var sql = "INSERT INTO class_student(student_id, class_id) VALUES (?, ?)"
        db.query(sql, [result.insertId, classID], function (err) {
        	if (err) { // if error => set req.session.sql_err = true
		        req.session.sql_err = true
		        res.redirect("/admin/student")
		    } else { // if added => set req.session.added = true
		    	req.session.added = true
        		res.redirect('/admin/student')
		    }
        })
      }
    })

  } else {
    res.redirect("/error")
    return
  }
}
//-----------------------------------------------Edit a student account------------------------------------------------------
exports.edit_student = function (req, res) {
  if (req.method == "POST") {
    var post = req.body
    var id = post.edit_id
    var rollnumber = post.edit_rollnumber
    var name = post.edit_name
    var classname = post.edit_class
    var email = post.edit_email
    // var username = post.edit_username
    // var password = post.edit_password
    var contest_id = post.edit_contestid
    var ip = post.edit_ip
    var timeout = post.edit_timeout
    var islogin = post.edit_islogin == "on" ? "1" : "0"
    // if (!/^[A-Za-z0-9\d=!\-@._*]*$/.test(password)) {
    //   res.redirect("/admin/student")
    //   return
    // }
    // var hash = crypto.createHash('md5').update(password).digest("hex")
    var sql = "UPDATE student_account SET rollnumber=?,email=?,name=?,class=?,contest_id=?,ip=?,timeout='" + formatTime(timeout) + "',islogin=? WHERE userId=?"
    db.query(sql, [rollnumber, email, name, classname, contest_id, ip, islogin, id], function (err) {
      if (err) {
        res.redirect("/admin/student")
      } else {
        logger.info(sql)
        res.redirect('/admin/student')
      }
    })

  } else {
    res.redirect("/error")
    return
  }
}
//-----------------------------------------------reset student ip, timeout------------------------------------------------------
/**
 * Reset student ip, timeout
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.reset_student = function (req, res) {
  if (req.method == "POST") {
    var post = req.body
    var list_id = post.list_id.split(",")
    var sql = ""
    // if (post.contest_id == "on") {
    //   sql = "UPDATE student_account SET contest_id='0',ip='1',timeout='" + new Date().toJSON().slice(0, 10) + "',islogin='0' WHERE "
    // } else {
    sql = "UPDATE student_account SET ip='1',timeout='" + new Date().toJSON().slice(0, 10) + "',islogin='0' WHERE "
    // }
    for (let i = 0; i < list_id.length; ++i) {
      sql += "userId='" + list_id[i] + "' OR "
    }
    // -4 means 4 characters of ' OR '
    sql = sql.slice(0, -4)
    db.query(sql, function (err) {
      if (err) {
        req.session.sql_err = true
        res.redirect("/admin/student")
      } else {
        logger.info("Reset student ip, timeout userId=" + list_id)
        req.session.added = true
        res.redirect('/admin/student')
      }
    })

  } else {
    res.redirect("/error")
    return
  }
}
//-----------------------------------------------Load data teacher account------------------------------------------------------
/**
 * Send list teacher to admin-teacher.ejs page
 * @param {*} req 
 * @param {*} res 
 */
exports.admin_teacher_data = function (req, res) {
  const requestQuery = req.query;
  let columnsMap = [
    { db: "null", dt: 0 }, { db: "userId", dt: 1 }, { db: "rollnumber", dt: 2 }, { db: "name", dt: 3 }, { db: "email", dt: 4 }, { db: "status", dt: 5 }, { db: "role_name", dt: 6 }
  ];
  const query = "SELECT employee_account.userId, employee_account.rollnumber, employee_account.name, employee_account.email, employee_account.status, role.role_name FROM employee_account, role WHERE role.role_id = employee_account.role_id"
  const primaryKey = "userId"
  const nodeTable = new NodeTable(requestQuery, db, query, primaryKey, columnsMap);
  nodeTable.output((err, data) => {
    //  
    if (err) {
      console.log(err);
      return;
    }
    for (var i = 0 ; i < data.data.length  ; i++){  
      if(data.data[i][5]){
          data.data[i][5] = '<i class="far fa-check-circle" style="color:green ; font-size: 120%"></i>'
      } else {
        data.data[i][5] = '<i class="far fa-times-circle" style="color:red ; font-size: 120%"></i>'
      }
    }
    res.send(data)
  })
}
//-----------------------------------------------Create a teacher account------------------------------------------------------
exports.create_teacher = function (req, res) {
  if (req.method == "POST") {
    var post = req.body
    var rollnumber = post.rollnumber
    var name = post.name;
    var email = post.email
    var role = post.role
    //  if(role == "0"){
    //   name = "IT"
    // }
    //  if(role == "1"){
    //   name = "Giáo Vụ"
    // }
    //  if(role == "2"){
    //   name = "Giảng Viên"
    // }
    var sql = "INSERT INTO employee_account(rollnumber, email, name, role_id, status) VALUES (?,?,?,?,?)"
    db.query(sql, [rollnumber, email, name, role, 1], function (err) {
      if (err) {
        req.session.sql_err = true
        res.redirect("/admin/teacher")
      } else {
        req.session.added = true
        logger.info("Create employee_account rollnumber=" + rollnumber + " name=" + name)
        res.redirect('/admin/teacher')
      }
    })

  } else {
    res.redirect("/error")
    return
  }
}
function formatTime(s) {
  d = s.split('-')[0]
  m = s.split('-')[1]
  y = s.split('-')[2].split(' ')[0]
  return y + '-' + m + '-' + d + s.substring(10) + '+00:00'
}
exports.edit_teacher = function (req, res) {
  if (req.method == "POST") {
    var post = req.body
    var id = post.edit_id
    var rollnumber = post.edit_rollnumber
    var name = post.edit_name
    var email = post.edit_email
    var isDisable = post.edit_disable == "on" ? "1" : "0"
    var role = post.editrole
    // if(role == "0"){
    //   name = "Admin"
    // }
    //  if(role == "1"){
    //   name = "Academic"
    // }
    //  if(role == "2"){
    //   name = "Teacher"
    // }
    var sql = "UPDATE employee_account SET rollnumber=?,email=?,name=?,role_id=?,status=? WHERE userId=?"
    db.query(sql, [rollnumber, email, name, role, isDisable, id], function (err) {
      if (err) {
        res.redirect("/admin/teacher")
      } else {
        logger.info(sql)
        res.redirect('/admin/teacher')
      }
    })

  } else {
    res.redirect("/error")
    return
  }
}