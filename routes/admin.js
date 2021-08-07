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
    res.render('admin.ejs', { data: result, teacher_role: req.session.teacher_role });
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
    error = "Student account has exist!"
  }
  if (req.session.addByExcel) {
    req.session.addByExcel = false
    if (req.session.stuAddClass && req.session.classAdded) {
      var num = req.session.stuAddClass;
      message = "Succesfully! " + num + " Students have been added to '" + req.session.classAdded + "' class.";
    } else {
      error = "All Students have been added already."
    }
  }
  if (req.session.reset_success) {
    req.session.reset_success = false
    message = "Students have been reseted!";
  }
  if(req.session.reset_fail) {
    req.session.reset_success = false
    error = "Reset student fail!";
  }
  if (req.session.added) {
    req.session.added = false
    if (req.session.stuAddClass && req.session.classAdded) 
      message = "Succesfully! " + req.session.stuAddClass + " Students have been added to '" + req.session.classAdded + "' class.";
    else
      message = "Succesfully! Students have been added to class."
  }
  var sql = "SELECT `id`, `semester`, `subject`, `class_name`, `status` FROM `class` WHERE status = 1";
    
  db.query(sql, function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    res.render('admin-student.ejs', { listClass: results, message: message, error: error, teacher_role: req.session.teacher_role})
  })
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
  if (req.session.update) {
    req.session.update = false
    message = "Succesfully! Teacher have been updated."
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
    { db: "null", dt: 0 }, { db: "userId", dt: 1 }, { db: "rollnumber", dt: 2 }, { db: "email", dt: 3 }, { db: "name", dt: 4 }, { db: "class_name", dt: 5 }, { db: "ip", dt: 6 }, { db: "timeout", dt: 7 }, { db: "islogin", dt: 8 }, { db: "id", dt: 9 }
  ];
  const query = "SELECT userId, rollnumber, email, name, c.id as class_name, ip, DATE_FORMAT(timeout, '%d-%m-%Y %H:%i:%s')" + 
  "AS timeout, islogin, a.id FROM student_account a LEFT JOIN class_student b ON  a.id = b.student_id AND b.status=1 " + 
  "LEFT JOIN class c ON b.class_id = c.id AND c.status=1 WHERE a.status=1"
  const primaryKey = "userId"
  const nodeTable = new NodeTable(requestQuery, db, query, primaryKey, columnsMap);
  nodeTable.output(async (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    var selectClaSql = "";
    var selectClass;
    for (var i = 0 ; i < data.data.length  ; i++){ 
      selectClaSql = "SELECT `semester`, `subject`, `class_name` FROM `class` WHERE id=" + data.data[i][5];
      selectClass = await queryPromise(selectClaSql);
      if (selectClass.length != 0) {
        data.data[i][5] = selectClass[0].semester + "_" + selectClass[0].subject + "_" + selectClass[0].class_name;
      } else {
        data.data[i][5] = "<center>-</center>";
      }
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
    var classID = post.class_id
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
/**
 * Edit by DangVTH
 * Edit a student 
 * Then, redirect to admin/student 
 * @param {*} req 
 * @param {*} res 
 * @returns 
*/
exports.edit_student = function (req, res) {
  if (req.method == "POST") {
    var post = req.body
    var id = post.edit_id_student
    var rollnumber = post.edit_rollnumber
    var name = post.edit_name
    var classID = post.edit_class
    var email = post.edit_email    
    var userID = post.edit_id
    var timeout = post.edit_timeout
    var sql = "UPDATE student_account SET rollnumber='"+rollnumber+"',email='"+email+"',name='"+name+"',userId='"+userID+"',timeout='" + formatTime(timeout) + "' WHERE id=" + id;
    db.query(sql, function (err) {
      if (err) {
      	req.session.sql_err = true
        res.redirect("/admin/student")
      } else {
        var sql = "UPDATE class_student SET class_id=? WHERE student_id=?" 
        db.query(sql, [classID, id], function (err) {
        	if (err) {
		      	req.session.added = true
		        res.redirect("/admin/student")
		    } else {
	        	req.session.updated = true
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
        req.session.reset_fail = true;
        res.redirect("/admin/student")
      } else {
        logger.info("Reset student ip, timeout userId=" + list_id)
        req.session.reset_success = true;
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
  const query = "SELECT employee_account.userId, employee_account.rollnumber, " +
  " employee_account.name, employee_account.email, employee_account.status, " +
  " role.role_name FROM employee_account, role WHERE role.role_id = employee_account.role_id " +
  "AND employee_account.userId != '" + req.session.userId + "'";
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
    var sql = "UPDATE employee_account SET rollnumber=?,email=?,name=?,role_id=?,status=? WHERE userId=?"
    db.query(sql, [rollnumber, email, name, role, isDisable, id], function (err) {
      if (err) {
        req.session.sql_err = true
        res.redirect("/admin/teacher")
      } else {
        req.session.update = true
        res.redirect('/admin/teacher')
      }
    })

  } else {
    res.redirect("/error")
    return
  }
}
exports.duplicateRollname = function (req, res) {
  var sql = ""
    sql = "SELECT rollnumber, email FROM `employee_account`"
  db.query(sql, function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    res.send({ data: results })
  })
}
exports.admin_class = function (req, res) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  var error = ""
  var message = ""
  if (req.session.add_class_err) {
    req.session.add_class_err = false
    error = "Class has exist!"
  }
  if (req.session.added_class_success) {
    req.session.added_class_success = false
    message = "Successfully! Class have been added."
  }
   if (req.session.update_class_success) {
     req.session.update_class_success = false
    message = "Successfully! Class have been updated."
   }
   if (req.session.update_class_fail) {
     req.session.update_class_fail = false
    message = "Successfully! Class have been update fail."
   }
   if (req.session.delete_class_success) {
     req.session.delete_class_success = false
    message = "Successfully! Class have been deleted."
   }
   if (req.session.delete_class_fail) {
     req.session.delete_class_fail = false
    message = "Successfully! Class have been delete fail."
   }
  res.render('admin-class.ejs', { message: message, error: error, teacher_role: req.session.teacher_role });
}

exports.admin_class_data = function (req, res) {
  const requestQuery = req.query;
  let columnsMap = [
    { db: "null", dt: 0 }, { db: "semester", dt: 1 }, { db: "subject", dt: 2 }, { db: "class_name", dt: 3 }, { db: "id", dt: 4 }
  ];

  const query = "SELECT id, semester, subject, class_name FROM class where status = 1"
  const primaryKey = "id"
  const nodeTable = new NodeTable(requestQuery, db, query, primaryKey, columnsMap);
  nodeTable.output((err, data) => {  
    if (err) {
      console.log(err);
      return;
    }
    res.send(data)
  })
}

exports.create_class = function (req, res) {
  if (req.method == "POST") {
    var post = req.body
    var semester = post.semester
    var subject = post.subject;
    var class_name = post.class_name
    var status = post.status
    var sql = "SELECT semester, subject, class_name, status FROM `class` WHERE semester = '"+semester+"' and subject = '"+subject+"' and class_name = '"+class_name+"'"
    db.query(sql, function (err, result){
      if(err){
        req.session.add_class_err = true
        res.redirect("/admin/class")
      }
      if(result.length > 0){
        var sql ="UPDATE class SET status = 1 WHERE semester = '"+semester+"' and subject = '"+subject+"' and class_name = '"+class_name+"'"
       db.query(sql, function (err, result){
          if(err){
            req.session.add_class_err = true
            res.redirect("/admin/class")
          } 
          req.session.added_class_success = true
          res.redirect('/admin/class')

       })
      } else {
        var sql = "INSERT INTO class(semester, subject, class_name) VALUES (?,?,?)"
       db.query(sql, [semester, subject, class_name],function (err, result){
          if(err){
            req.session.add_class_err = true
            res.redirect("/admin/class")
          } 
          req.session.added_class_success = true
          res.redirect('/admin/class')

       })
      }
    })
  }
}
exports.edit_class = function (req, res) {
  if (req.method == "POST") {
    var post = req.body
    var id = post.edit_id
    var semester = post.edit_semester
    var subject = post.edit_subject
    var class_name = post.edit_class_name
    var sql = "SELECT semester, subject, class_name, status FROM `class` WHERE semester = '"+semester+"' and subject = '"+subject+"' and class_name = '"+class_name+"'"
    db.query(sql, function (err, result){
      if(err){
        req.session.update_class_fail = true
        res.redirect("/admin/class")
      }
      if(result.length > 0){
        var sql ="UPDATE class SET status = 1 WHERE semester = '"+semester+"' and subject = '"+subject+"' and class_name = '"+class_name+"'"
       db.query(sql, function (err, result){
          if(err){
            req.session.update_class_fail = true
            res.redirect("/admin/class")
          } 
          req.session.update_class_success = true
          res.redirect('/admin/class')

       })
      } else {
        var sql = "UPDATE class SET semester=?,subject=?,class_name=? WHERE id=?"
       db.query(sql, [semester, subject, class_name, id],function (err, result){
          if(err){
            req.session.update_class_fail = true
            res.redirect("/admin/class")
          } 
          req.session.update_class_success = true
          res.redirect('/admin/class')

       })
      }
    })
  }
}

exports.delete_class = function (req, res) {
  if (req.method == "POST") {
    var post = req.body
    var list_id = post.list_id.split(",")
    var sql = ""
    sql = "UPDATE class SET status = 0 WHERE "
    for (let i = 0; i < list_id.length; ++i) {
      sql += "id=" + list_id[i] + " OR "
    }
    sql = sql.slice(0, -4)
    db.query(sql, function (err) {
      if (err) {
        req.session.delete_class_fail = true
        res.redirect("/admin/class")
      } else {
        req.session.delete_class_success = true
        res.redirect('/admin/class')
      }
    })

  } else {
    res.redirect("/error")
    return
  }
}

/**
 * Get student in a class
*/
exports.detail_class = function (req, res) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  var message = ""
  var error = ""
  if (req.session.added) {
    req.session.added = false
    message = "Succesfully! Students have been added."
  }
  if (req.session.deleted) {
    req.session.deleted = false
    message = "Succesfully! Students have been deleted."
  }
  var classId = req.query.classId
  var class_name = req.query.class_name
  var sql = "SELECT class.id, class.semester, class.subject, class.class_name, student_account.rollnumber, student_account.name, student_account.email "+
            "FROM class, class_student, student_account "+
            "WHERE class_student.class_id = ? AND class.id = class_student.class_id AND class_student.student_id = student_account.id AND class_student.status = 1 AND class.status = 1"
  db.query(sql, [classId], function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    res.render('admin-class-detail.ejs', { data: results, class_id: classId, class_name: class_name, totalStudent: results.length, message: message, error: error, teacher_role: req.session.teacher_role, role: req.session.role, user: req.session.user })
  })
}

/**
 * Delete student in a class
*/
exports.class_delete_student = function (req, res) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  if (req.method == "POST") {
    var post = req.body
    var list_rollnumber = post.list_rollnumber
    var class_id = post.class_id
    var class_name = post.class_name
    if (list_rollnumber != "") {
      var list = list_rollnumber.split(",")
      var sql_class_student = "SELECT `id` FROM `student_account` WHERE ";
      for (let i = 0, l = list.length; i < l; ++i) {
        sql_class_student += " rollnumber = ? OR ";
      }
      sql_class_student = sql_class_student.slice(0, -4);

      db.query(sql_class_student, list, (errSelect, resSelect) => {
        if (errSelect) { logger.error(errSelect); res.redirect("/error"); return; }
        sql_class_student = 'UPDATE `class_student` SET `status`= 0 WHERE ';
        for(let i = 0, len = resSelect.length; i < len; i++) {
            sql_class_student += " (student_id = " + resSelect[i].id +
             " AND class_id = " + class_id + ") OR "
        }
        sql_class_student = sql_class_student.slice(0, -4);

        db.query(sql_class_student, (errInsert, resInsert) => {
            if (errInsert) { logger.error(errInsert); res.redirect("/error"); return; }
            req.session.deleted = true
            logger.info(list.length + " students in class " + class_id + " has deleted: " + list)
            res.redirect("/admin/detail-class?classId=" + class_id + "&class_name=" + class_name)
          });
      })
    }
  }
}

/**
 * Add student to a class
*/
exports.class_add_student = async function (req, res) {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  if (req.method == "POST") {
    var post = req.body
    var list_rollnumber = post.list_rollnumber
    var class_id = post.class_id
    var class_name = post.class_name
    if (list_rollnumber != "") {
      var list = list_rollnumber.split(",")
      var sql_student = "SELECT `id` FROM `student_account` WHERE ";
      for (let i = 0, l = list.length; i < l; ++i) {
        sql_student += " rollnumber = '"+ list[i] +"' OR ";
      }
      sql_student = sql_student.slice(0, -4);
      var sql_student_select_insert = "SELECT id FROM (" + sql_student + ") AS a "+
                                      "WHERE a.id NOT IN (SELECT student_id FROM class_student WHERE class_id = "+ class_id +")"
      try {
        var resSelectInsert = await queryPromise(sql_student_select_insert)

        var sql_class_insert = "INSERT INTO `class_student`(`student_id`, `class_id`, `status`) VALUES "
        for(let i = 0, len = resSelectInsert.length; i < len; i++) {
           sql_class_insert +="("+ resSelectInsert[i].id +"," + class_id + ","+ 1 +"), "
        }
        
        if (sql_class_insert.endsWith("VALUES ")) {
          sql_class_insert = ""
        } else {
          sql_class_insert = sql_class_insert.slice(0, -2);
        }

        var sql_student_select_update = "SELECT id FROM (" + sql_student + ") AS a "+
                                      "WHERE a.id NOT IN ("+ sql_student_select_insert +")"

        var sql_class_update = 'UPDATE `class_student` SET `status`= 1 WHERE ';
        
        var resSelectUpdate = await queryPromise(sql_student_select_update)

        for(let i = 0, len = resSelectUpdate.length; i < len; i++) {
             sql_class_update +="(student_id = "+ resSelectUpdate[i].id +" AND class_id = " + class_id + ") OR "
        }

        if (sql_class_update.endsWith("WHERE ")) {
          sql_class_update = ""
        } else {
          sql_class_update = sql_class_update.slice(0, -4);
        }

        if (sql_class_insert != "" && sql_class_update != "") {
          await queryPromise(sql_class_insert)
          await queryPromise(sql_class_update)
          req.session.added = true
          logger.info(list.length + " students in class " + class_id + " has added: " + list)
          res.redirect("/admin/detail-class?classId=" + class_id + "&class_name=" + class_name)
        }
        if (sql_class_insert == "" && sql_class_update != "") {
          await queryPromise(sql_class_update)
          req.session.added = true
          logger.info(list.length + " students in class " + class_id + " has added: " + list)
          res.redirect("/admin/detail-class?classId=" + class_id + "&class_name=" + class_name) 
        }
        if (sql_class_insert != "" && sql_class_update == "") {
          await queryPromise(sql_class_insert)
          req.session.added = true
          logger.info(list.length + " students in class " + class_id + " has added: " + list)
          res.redirect("/admin/detail-class?classId=" + class_id + "&class_name=" + class_name) 
        }
      } catch (error) {
        logger.error(error); res.redirect("/error"); return; 
      }

    }
  }
}
exports.duplicateClass = function (req, res) {
  var sql = ""
    sql = "SELECT semester, subject, class_name, status FROM `class` WHERE status = 1"
  db.query(sql, function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return }
    res.send({ data: results })
  })
}

/**
 * List all student from DB except 
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.list_students = async function(req, res) {
  let userIdStudent = req.query.user_id_student;
  let sql = "SELECT `id`, `userId`, `rollnumber`, `email` FROM `student_account` WHERE status = 1 ";
  if(userIdStudent) {
    sql +=  "AND userId != '" + userIdStudent + "'";
  }
  let listStudents = await queryPromise(sql, []);
  res.send(listStudents);
}

exports.list_classes = async function(req, res) {
  let idStudent = req.query.id_student;
  let idClass = req.query.id_class;
  let sql = "SELECT class.`id`, class.`semester`, class.`subject`, class.`class_name` " +
  " FROM `class`, class_student WHERE class.status = 1 AND class_student.status = 1 " +
  " AND class.id = class_student.class_id AND class_student.student_id = ? AND class.id <> ?";
  let listclass = await queryPromise(sql, [idStudent, idClass]);
  res.send(listclass);
}

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