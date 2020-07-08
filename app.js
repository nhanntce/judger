/**
* Module dependencies.
*/
var express     = require('express')
  , routes      = require('./routes')
  , user        = require('./routes/user')
  , admin       = require('./routes/admin')
  , http        = require('http')
  , session     = require('express-session')
  , mysql       = require('mysql')
  , bodyParser  = require('body-parser')
  , compression = require('compression')
  , https       = require('https');
// set maximum sockets
http.globalAgent.maxSockets  = Infinity;
https.globalAgent.maxSockets = Infinity;
// Config database mysql
const dbConfig   = require("./routes/db.config.js");
var   connection = mysql.createPool({
  host    : dbConfig.HOST,
  user    : dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});
// set global variable
global.db         = connection;
global.fs         = require('fs');
global.path       = require('path');
global.moment     = require('moment');
global.public_dir = __dirname + '/public';
global.NodeTable  = require("nodetable");
global.crypto     = require('crypto')
global.logger     = require("./routes/logger").Logger;

function userIsAllowed(callback) {
  // this function would contain your logic, presumably asynchronous,
  // about whether or not the user is allowed to see files in the
  // protected directory; here, we'll use a default value of "false"
  callback(false);
};
// This function returns a middleware function
var protectPath = function (regex) {
  return function (req, res, next) {
    if (!regex.test(req.url)) { return next(); }
    userIsAllowed(function (allowed) {
      if (allowed) {
        next(); // send the request to the next handler, which is express.static
      } else {
        res.redirect("/error");
        return;
      }
    });
  };
};
var app = express();
// all environments
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(protectPath(/^\/thumucbailam|thumuctest|nopbai|download|excel\/.*$/));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret           : 'keyboard cat',
  resave           : false,
  saveUninitialized: true,
  // cookie: { maxAge: 60000*15 }
}))
// development only
app.get('*', (req, res, next) => {
  var url = req.url.split('?')[0]
  if (['/', '/login', '/home/dashboard', '/home/tutorial', '/home/logout', '/home/profile', '/submission', '/session/destroy', '/error'].indexOf(url) !== -1) {
    return next();
  }
  if (req.session.role === "Student") {
    res.redirect("/error");
    return;
  } else {
    return next();
  }
});
app.get('/', routes.index);//call for main index page
app.get('/login', routes.index);//call for login page
app.post('/login', user.login);//call for login post
app.get('/home/dashboard', user.dashboard);//call for dashboard page after login
app.get('/home/tutorial',  (req, res) => {
  var userId = req.session.userId;
  if (userId == null) {
    res.redirect("/login");
    return;
  }
  res.render('tutorial.ejs',  { role: req.session.role, user: req.session.user });
});
app.get('/home/logout', user.logout);//call for logout
app.get('/home/profile', user.profile);//to render users profile
// show contest
app.get('/contest', user.contest);
// Add contest
app.post('/contest/add-contest', user.add_contest);
// Delete contest
app.post('/contest/delete-contest', user.delete_contest);
// Edit contest
app.post('/contest/edit-contest', user.edit_contest);
// Contest detail
app.get('/contest/detail', user.contest_detail);
// Contest download
app.get('/contest/download', user.download);
// Delete student in contest
app.post('/contest/delete-user', user.delete_user);
// Load student from class
app.get('/contest/load-user', user.load_user);
// Add student to contest
app.post('/contest/add-user', user.add_user);
// Add student to contest
app.get('/contest/add-user', (req, res) => {
  var userId = req.session.userId;
  if (userId == null) {
    res.redirect("/login");
    return;
  }
  var contest_id = req.query.contest_id;
  res.render('add-user.ejs', { data: [], contest_id: contest_id, message: "", error: "", warning: "", role: req.session.role, user: req.session.user });
});
// Load class
app.get('/contest/load-class', user.load_class);
// Add class
app.post('/contest/add-class', user.add_class);
// Add class
app.get('/contest/add-class', (req, res) => {
  var userId = req.session.userId;
  if (userId == null) {
    res.redirect("/login");
    return;
  }
  var message = ""
  if (req.session.added) {
    req.session.added = false
    message           = "Add successfully!"
  }
  res.render('add-class.ejs', { data: [], xlData: "", message: message, error: "", class_name: "", role: req.session.role, user: req.session.user });
});
// Add class
app.post('/contest/add-class/create', user.create_class);
// add problem
app.get('/contest/add-problem', user.add_problem);
// upload the problem and testcase
app.post('/contest/add-problem/add', user.add_problem_testcase);
// upload the problem and testcase
app.post('/contest/add-problem/edit', user.edit_problem_testcase);
// delete problem and testcase
app.post('/contest/add-problem/delete', user.delete_problem_testcase);
// rank
app.get('/rank', (req, res) => {
  var userId = req.session.userId;
  if (userId == null) {
    res.redirect("/login");
    return;
  }
  res.render('rank.ejs', { role: req.session.role, user: req.session.user });
});
// rank
app.get('/rank-time', user.rank_time);
// data rank
app.get('/data-rank', user.data_rank);
// load rank -> json
app.post('/load-rank', user.load_rank);
// rank detail by rollnumber
app.get('/detail-rank', user.detail_rank);
// submission page
app.get('/submission', user.submission);
app.post('/submission-realtime', user.submission_realtime);
// Submit submissions file
app.post('/submission/submit', user.submit);
// Destroy session when closing tab or browse
app.get('/session/destroy', user.session_destroy);
// Admin page
app.get('/admin', admin.dashboard);
app.get('/admin/student', admin.admin_student);
app.get('/admin/student-data', admin.admin_student_data);
app.post('/admin/add-student', admin.create_student);
app.post('/admin/edit-student', admin.edit_student);
app.post('/admin/reset-student', admin.reset_student);
app.get('/admin/teacher', admin.admin_teacher);
app.get('/admin/teacher-data', admin.admin_teacher_data);
app.post('/admin/add-teacher', admin.create_teacher);
app.get('/error', (req, res) => {
  res.render('404.ejs');
});
app.post('/searching', function(req, res){
  var userId = req.session.userId
  var sql    = "SELECT contest_id, contest_name FROM contest WHERE teacher_id='" + userId + "' AND deleted=0"
  db.query(sql, function (err, results) {
      if (err) { res.redirect("/error"); return }
      res.send(results);
  })
});

// Listen at port 8080
app.listen(process.env.PORT || 8080, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});