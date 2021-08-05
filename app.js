/**
* Module dependencies.
*/
const express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , contest = require('./routes/contest')
  , rank = require('./routes/rank')
  , submit = require('./routes/submit')
  , admin = require('./routes/admin')
  , auth = require('./routes/auth')
  , http = require('http')
  , session = require('express-session')
  , mysql = require('mysql')
  , bodyParser = require('body-parser')
  , compression = require('compression')
  , https = require('https')
  , cors = require('cors')
  , passport = require('passport')
  , cookieSession = require('cookie-session')
  require('./passport-setup');
// set maximum sockets
http.globalAgent.maxSockets = Infinity
https.globalAgent.maxSockets = Infinity
// Config database mysql
const dbConfig = require("./routes/db.config.js")
var connection = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
})
// set global variable
global.db = connection
global.fs = require('fs')
global.path = require('path')
global.dayjs = require('dayjs')
global.public_dir = __dirname + '/public'
global.NodeTable = require("nodetable")
global.crypto = require('crypto')
global.logger = require("./routes/logger").Logger
global.storage = require('./routes/storage')

function userIsAllowed(callback) {
  // this function would contain your logic, presumably asynchronous,
  // about whether or not the user is allowed to see files in the
  // protected directory here, we'll use a default value of "false"
  callback(false)
}
// This function returns a middleware function
var protectPath = function (regex) {
  return function (req, res, next) {
    if (!regex.test(req.url)) { return next() }
    userIsAllowed(function (allowed) {
      if (allowed) {
        next() // send the request to the next handler, which is express.static
      } else {
        res.redirect("/error")
        return
      }
    })
  }
}
var app = express()
// all environments
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.use(compression())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(protectPath(/^\/thumucbailam|thumuctest|nopbai|excel\/.*$/))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())
// For an actual app you should configure this with an experation time, better keys, proxy and secure
app.use(cookieSession({
  name: 'tuto-session',
  keys: ['key1', 'key2']
}))

// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.user) {
      next();
  } else {
      res.sendStatus(401);
  }
}

// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

// Example protected and unprotected routes
// app.get('/', (req, res) => res.send('Example Home page!'))
// app.get('/failed', (req, res) => res.send('You Failed to log in!'))


// In this route you can see that if the user is logged in u can acess his info in: req.user
app.get('/success', auth.success);

// Auth Routes
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/error' }), auth.googleCallback);

app.get('/logout', user.LogOutGG);

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // cookie: { maxAge: 60000*15 }
}))
// development only
app.get('*', (req, res, next) => {
  var url = req.url.split('?')[0]
  if (['/', '/login', '/home/dashboard', '/home/tutorial', '/home/logout', '/home/profile', '/submission', '/session/destroy', '/error', '/google', '/good', '/logout', '/success'].indexOf(url) !== -1) {
    return next()
  }
  if (req.session.role === "Student") {
    res.redirect("/error")
    return
  } else {
    return next()
  }
})
app.get('/', routes.index)//call for main index page
app.get('/login', routes.index)//call for login page
app.post('/login', user.login)//call for login post
app.get('/home/dashboard', user.dashboard)//call for dashboard page after login
app.get('/home/tutorial', (req, res) => {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  res.render('tutorial.ejs', { role: req.session.role, user: req.session.user, teacher_role: req.session.teacher_role })
})
app.get('/home/logout', user.logout)//call for logout
app.get('/home/profile', user.profile)//to render users profile
// show contest
app.get('/contest', contest.contest)
// Add contest
app.post('/contest/add-contest', contest.add_contest)
// Delete contest
app.post('/contest/delete-contest', contest.delete_contest)
// Edit contest
app.post('/contest/edit-contest', contest.edit_contest)
// Contest detail
app.get('/contest/detail', contest.contest_detail)
// Contest download
app.get('/contest/download', contest.download)
// Delete student in contest
app.post('/contest/delete-student', contest.delete_student)
// Load student from class
app.get('/contest/load-student', contest.load_student)
// Add student to contest
app.get('/contest/add-student', (req, res) => {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  var contest_id = req.query.contest_id;
  var time_begin = req.query.time_begin;
  var time_end = req.query.time_end;
  // List all class
  var sql = "SELECT `id`, `class_name` FROM `class`"
  var listClass = [];
  db.query(sql, function (err, results) {
    if (err) { logger.error(err); res.redirect("/error"); return; }
     for(var i = 0, len = results.length; i < len; i++) {
      listClass.push({
        class_name: results[i].class_name,
        class_id: results[i].id 
      });
     }
     res.render('add-student.ejs', 
      { 
        list_class: listClass, 
        data: [], 
        contest_id: contest_id, 
        message: "", 
        error: "", 
        warning: "", 
        role: req.session.role, 
        user: req.session.user, 
        teacher_role: req.session.teacher_role,
        time_begin: time_begin,
        time_end: time_end
      }
    )
  })
})
app.post('/contest/add-student', contest.add_student)
// Load class
app.get('/contest/load-class', contest.load_class)
// Add class
app.post('/contest/add-class', contest.add_class)
// Add class
app.get('/contest/add-class', (req, res) => {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  var message = ""
  if (req.session.added) {
    req.session.added = false
    message = "Add successfully!"
  }
  res.render('add-class.ejs', { data: [], xlData: "", message: message, error: "", class_name: "", role: req.session.role, user: req.session.user, teacher_role: req.session.teacher_role, detail: true})
})
// Add class
app.post('/contest/add-class/create', contest.create_class)
// add problem
app.get('/contest/add-problem', contest.add_problem)
// upload the problem and testcase
app.post('/contest/add-problem/add', contest.add_problem_testcase)
// upload the problem and testcase
app.post('/contest/add-problem/edit', contest.edit_problem_testcase)
// delete problem and testcase
app.post('/contest/add-problem/delete', contest.delete_problem_testcase)
//get All contest
app.get('/contest/contest-all', contest.contestAll)
// rank
app.get('/rank', (req, res) => {
  var userId = req.session.userId
  if (userId == null) {
    res.redirect("/login")
    return
  }
  res.render('rank.ejs', { role: req.session.role, user: req.session.user, teacher_role: req.session.teacher_role })
})
// rank
app.get('/rank-time', rank.rank_time)
// data rank
app.get('/data-rank', rank.data_rank)
// load rank -> json
app.post('/load-rank', rank.load_rank)
// rank detail by rollnumber
app.get('/detail-rank', rank.detail_rank)
// submission page
app.get('/submission', submit.submission)
app.post('/submission-realtime', submit.submission_realtime)
// Submit submissions file
app.post('/submission/submit', submit.submit)
// Destroy session when closing tab or browse
app.get('/session/destroy', user.session_destroy)
// Admin page
app.use('/admin/*', auth_admin);
app.get('/admin', admin.dashboard)
app.get('/admin/student', admin.admin_student)
app.get('/admin/student-data', admin.admin_student_data)
app.post('/admin/add-student', admin.create_student)
app.post('/admin/edit-student', admin.edit_student)
app.post('/admin/reset-student', admin.reset_student)
app.get('/admin/teacher', admin.admin_teacher)
app.get('/admin/teacher-data', admin.admin_teacher_data)
app.post('/admin/add-teacher', admin.create_teacher)
app.post('/admin/edit-teacher', admin.edit_teacher)
app.get('/admin/class', admin.admin_class)
app.get('/admin/class-data', admin.admin_class_data)
app.post('/admin/add-class', admin.create_class)
app.post('/admin/edit-class', admin.edit_class)
app.post('/admin/delete-class', admin.delete_class)
app.get('/error', (req, res) => {
  res.render('404.ejs')
})

function auth_admin(req, res, next) {
  if(req.session.user == null) {
    res.redirect("/login");
    return;
  }
  if(req.session.teacher_role > 1) {
    res.redirect("/error"); 
    return;
  }
  next();
}
app.post('/searching', function (req, res) {
  var userId = req.session.userId
  var sql = ""
  if (req.session.teacher_role <= 1) {
    sql = "SELECT contest_id, contest_name FROM contest WHERE deleted=0"
  } else {
    sql = "SELECT contest.contest_id, contest.contest_name FROM contest WHERE contest.teacher_id='" + userId + "' AND deleted=0"
  }
  db.query(sql, function (err, results) {
    if (err) { return res.redirect("/error") }
    res.send(results)
  })
})

// Listen at port 8000
app.listen(process.env.PORT || 8000, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env)
})
