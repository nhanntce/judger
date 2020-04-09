const lignator = require('lignator');
const formidable = require('formidable');
const extract = require("extract-zip");
//---------------------------------------------signup page call------------------------------------------------------
exports.signup = function (req, res) {
   message = '';
   if (req.method == "POST") {
      var post = req.body;
      var name = post.user_name;
      var pass = post.password;
      var fname = post.first_name;
      var lname = post.last_name;
      var mob = post.mob_no;
      var crypto = require('crypto');
      var hash = crypto.createHash('md5').update(pass).digest("hex");

      var sql = "INSERT INTO `users`(`first_name`,`last_name`,`mob_no`,`user_name`, `password`) VALUES ('" + fname + "','" + lname + "','" + mob + "','" + name + "','" + hash + "')";

      var query = db.query(sql, function (err, result) {

         message = "Succesfully! Your account has been created.";
         res.render('signup.ejs', { message: message });
      });

   } else {
      res.render('signup');
   }
};

//-----------------------------------------------login page call------------------------------------------------------
exports.login = function (req, res) {
   var message = '';
   var sess = req.session;

   if (req.method == "POST") {
      var post = req.body;
      var user = post.user_name;
      var pass = post.password;
      var role = (post.role == "Student") ? "student_account" : "teacher_account";
      var crypto = require('crypto');
      var hash = crypto.createHash('md5').update(pass).digest("hex");

      var sql = "SELECT * FROM `" + role + "` WHERE `username`='" + user + "' and password = '" + hash + "'";
      db.query(sql, function (err, results) {
         if (results.length) {
            req.session.userId = results[0].id;
            req.session.role = post.role;
            req.session.user = results[0];
            req.session.teacher_rollnumber = results[0].rollnumber;
            console.log(results[0].id);
            res.redirect('/home/dashboard');
         }
         else {
            message = 'Wrong Credentials.';
            res.render('index.ejs', { message: message });
         }

      });
   } else {
      res.render('index.ejs', { message: message });
   }

};
//-----------------------------------------------dashboard page functionality----------------------------------------------

exports.dashboard = function (req, res, next) {

   var user = req.session.user,
      userId = req.session.userId,
      role = (req.session.role == "Student") ? "student_account" : "teacher_account";
   console.log('ddd=' + userId + ' ' + role);
   if (userId == null) {
      res.redirect("/login");
      return;
   }

   var sql = "SELECT * FROM `" + role + "` WHERE `id`='" + userId + "'";

   db.query(sql, function (err, results) {
      res.render('dashboard.ejs', { user: user });
   });
};
//------------------------------------logout functionality----------------------------------------------
exports.logout = function (req, res) {
   req.session.destroy(function (err) {
      res.redirect("/login");
   })
};
//--------------------------------render user details after login--------------------------------
exports.profile = function (req, res) {

   var userId = req.session.userId,
      role = (req.session.role == "Student") ? "student_account" : "teacher_account";
   if (userId == null) {
      res.redirect("/login");
      return;
   }

   var sql = "SELECT * FROM `" + role + "` WHERE `id`='" + userId + "'";
   db.query(sql, function (err, result) {
      res.render('profile.ejs', { data: result });
   });
};

//---------------------------------contest----------------------------------
exports.contest = function (req, res) {
   var userId = req.session.userId;
   var teacher_rollnumber = req.session.teacher_rollnumber;
   if (userId == null) {
      res.redirect("/login");
      return;
   }

   var sql = "SELECT * FROM `contest` WHERE `teacher_rollnumber`='" + teacher_rollnumber + "'";
   db.query(sql, function (err, results) {
      res.render('contest.ejs', { data: results });
   });
};
//---------------------------------Add a new contest----------------------------------
exports.add_contest = function (req, res) {
   var userId = req.session.userId;
   var teacher_rollnumber = req.session.teacher_rollnumber;
   if (userId == null) {
      res.redirect("/login");
      return;
   }

   if (req.method == "POST") {
      var post = req.body;
      var contest_name = post.contest_name;
      var datetime = post.datetime;

      var sql = "INSERT INTO `contest`(`contest_name`, `teacher_rollnumber`, `time`) VALUES ('" + contest_name + "', '" + teacher_rollnumber + "', '" + datetime + "')";
      console.log(sql);
      db.query(sql, function (err, results) {
         res.redirect("/contest");
      });
   }
};
//---------------------------------contest-detail-get----------------------------------
exports.contest_detail = function (req, res) {
   var userId = req.session.userId;
   var contest_id = req.query.contest_id;
   if (userId == null) {
      res.redirect("/login");
      return;
   }
   if (contest_id == null) {
      res.redirect("/contest");
      return;
   }

   var message = "";
   if (req.session.deleted_user) {
      message = "Succesfully! Student has been deleted.";
      req.session.deleted_user = false;
   }

   var sql = "SELECT student_account.id, contest_student.student_rollnumber, student_account.name, student_account.class, contest.contest_id, contest.contest_name, contest.time_begin, contest.time_end FROM contest_student " +
      "INNER JOIN student_account ON contest_student.student_rollnumber=student_account.rollnumber " +
      "INNER JOIN contest ON contest_student.contest_id=contest.contest_id " +
      "WHERE contest.contest_id=" + contest_id;
   db.query(sql, function (err, results) {
      if (results.length == 0) {
         sql = "SELECT contest_name  FROM contest WHERE contest_id=" + contest_id;
         db.query(sql, function (err, results) {
            res.render('contest-detail.ejs', { data: [], contest_name: results[0].contest_name, contest_id: contest_id, message: message });
         });
      } else {
         res.render('contest-detail.ejs', { data: results, contest_name: results[0].contest_name, contest_id: contest_id, message: message });
      }

   });

};
//---------------------------------delete selected user----------------------------------
exports.delete_user = function (req, res) {
   var userId = req.session.userId;

   if (userId == null) {
      res.redirect("/login");
      return;
   }
   if (req.method == "POST") {
      var post = req.body;
      var list_rollnumber = post.list_rollnumber;
      var contest_id = post.contest_id;

      var list = list_rollnumber.split(",")
      for (let i = 0; i < list.length; ++i) {
         var sql = "DELETE FROM `contest_student` WHERE student_rollnumber='" + list[i] + "'";
         db.query(sql);
         sql = "UPDATE `student_account` SET `in_contest`=0 WHERE rollnumber='" + list[i] + "'";
         db.query(sql);
      }
      req.session.deleted_user = true;
      res.redirect("/contest/detail?contest_id=" + contest_id);
   }
};
//---------------------------------load user----------------------------------
exports.load_user = function (req, res) {
   var userId = req.session.userId;

   if (userId == null) {
      res.redirect("/login");
      return;
   }
   var message = "";
   if (req.session.added_user) {
      message = "Succesfully! Student has been added.";
      req.session.added_user = false;
   }
   var class_name = req.query.class_name;
   var contest_id = req.query.contest_id;
   var sql = "SELECT rollnumber, name, class FROM student_account WHERE class='" + class_name + "' and in_contest=0";
   db.query(sql, function (err, results) {
      res.render('add-user.ejs', { data: results, contest_id: contest_id, message: message });
   });

};
//---------------------------------add user----------------------------------
exports.add_user = function (req, res) {
   var userId = req.session.userId;

   if (userId == null) {
      res.redirect("/login");
      return;
   }
   if (req.method == "POST") {
      var post = req.body;
      var list_rollnumber = post.list_rollnumber;
      var contest_id = post.contest_id;
      var list = list_rollnumber.split(",")

      var sql = "";
      for (let i = 0; i < list.length; ++i) {
         sql = "INSERT INTO `contest_student`(`student_rollnumber`, `contest_id`) VALUES ('" + list[i] + "'," + contest_id + ")";
         db.query(sql);
         sql = "UPDATE `student_account` SET `in_contest`=1 WHERE rollnumber='" + list[i] + "'";
         db.query(sql);
      }
      sql = "SELECT class FROM student_account WHERE rollnumber='" + list[0] + "'";
      db.query(sql, function (err, results) {
         req.session.added_user = true;
         res.redirect("/contest/load-user?class_name=" + results[0].class + "&contest_id=" + contest_id + "");
         return;
      });

   }
};
// get folder in Directories
function getDirectories(srcpath) {
   try {
      return fs.readdirSync(srcpath)
      .map(file => path.join(srcpath, file))
      .filter(path => fs.statSync(path).isDirectory());
   } catch (error) {
   } 
}
//---------------------------------add problem----------------------------------
exports.add_problem = function (req, res) {
   var userId = req.session.userId;

   if (userId == null) {
      res.redirect("/login");
      return;
   }
   var contest_id = req.query.contest_id;
   var sql = "SELECT contest_name FROM contest WHERE contest_id=" + contest_id;
   db.query(sql, function (err, results) {
      var contest_name = results[0].contest_name;
      if (!fs.existsSync('./public/debai/' + contest_name)) {
         fs.mkdirSync('./public/debai/' + contest_name);
      }
      if (!fs.existsSync('./public/thumuctest/' + contest_name)) {
         fs.mkdirSync('./public/thumuctest/' + contest_name);
      }
      var problem_files = [];
      fs.readdir('./public/debai/' + contest_name, function (err, files) {
         problem_files = files;
         var testcase = [];
         var testcase_size = [];
         var testcase_path = [];
         getDirectories('./public/thumuctest/' + contest_name).forEach(element => {
            var tmp = element.split('\\');
            testcase.push(tmp[tmp.length - 1]);
            testcase_size.push(getDirectories(element).length);
            testcase_path.push(element);
         });
         res.render('add-problem.ejs', { problem_files: problem_files, testcase: testcase, testcase_size: testcase_size, testcase_path: testcase_path, contest_id: contest_id, contest_name: contest_name, message: "" });
      });

   });
};
//---------------------------------upload problem----------------------------------
exports.upload_problem = function (req, res) {
   if (req.method == "POST") {
      var contest_id = req.query.contest_id;

      var sql = "SELECT contest_name FROM contest WHERE contest_id=" + contest_id;
      db.query(sql, function (err, results) {
         var contest_name = results[0].contest_name;
         var form = new formidable.IncomingForm();

         form.parse(req);

         form.on('fileBegin', function (name, file) {
            if (file.name == "") {
               return;
            }
            file.path = './public/debai/' + contest_name + '/' + file.name;
         });

         form.on('file', function (name, file) {
            res.redirect("/contest/add-problem?contest_id=" + contest_id);
            return;
         });
      });
   }
};
//---------------------------------upload testcase----------------------------------
exports.upload_testcase = function (req, res) {
   if (req.method == "POST") {
      var contest_id = req.query.contest_id;

      var sql = "SELECT contest_name FROM contest WHERE contest_id=" + contest_id;
      db.query(sql, function (err, results) {
         var contest_name = results[0].contest_name;
         var form = new formidable.IncomingForm();

         form.parse(req);

         form.on('fileBegin', function (name, file) {
            if (file.name == "") {
               return;
            }
            file.path = './public/thumuctest/' + contest_name + '/' + file.name;
         });

         form.on('file', function (name, file) {
            console.log(fs.existsSync(file.path))
            try {
               extract(file.path, { dir: public_dir + '/thumuctest/' + contest_name })
               console.log('Extraction complete')
            } catch (err) {
               console.log(err)
            }

         });
         res.redirect("/contest/add-problem?contest_id=" + contest_id);
      });
   }
};
//---------------------------------delete problem----------------------------------
exports.delete_problem = function (req, res) {
   if (req.method == "POST") {
      var post = req.body;
      var problem_path = post.problem_path;
      var contest_id = post.contest_id;
      fs.unlink(problem_path, (err) => {
         if (err) {
            console.error(err)
            return
         }
         res.redirect("/contest/add-problem?contest_id=" + contest_id);
      });
   }
};
//---------------------------------delete testcase----------------------------------
exports.delete_testcase = function (req, res) {
   if (req.method == "POST") {
      var post = req.body;
      var testcase_path = post.testcase_path;
      var contest_id = post.contest_id;
      lignator.remove(testcase_path);
      res.redirect("/contest/add-problem?contest_id=" + contest_id);
   }
};