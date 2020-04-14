/**
* Module dependencies.
*/
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , session = require('express-session')
  , mysql = require('mysql')
  , bodyParser = require("body-parser")
  , compression = require('compression')
  , https = require('https');

http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;
global.fs = require('fs');
global.path = require('path')
global.public_dir = __dirname + '/public';

var app = express();
const dbConfig = require("./routes/db.config.js");
var connection = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

global.db = connection;

// all environments
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000*5 }
}))

// development only
app.get('*', (req, res, next) => {
  if (['/', '/login', '/home/dashboard', '/home/logout', '/home/profile', '/submission', '/submission?success=1', '/submission?error=1', '/session/destroy', '/error'].indexOf(req.url) !== -1) {
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
  res.render('add-class.ejs', { data: [], xlData: "", message: "", error: "", class_name: "", role: req.session.role, user: req.session.user });
});
// Add class
app.post('/contest/add-class/create', user.create_class);
// add problem
app.get('/contest/add-problem', user.add_problem);
// upload the problem
app.post('/contest/add-problem/upload-problem', user.upload_problem);
// upload testcase
app.post('/contest/add-problem/upload-testcase', user.upload_testcase);
// delete problem
app.post('/contest/add-problem/delete-problem', user.delete_problem);
// delete testcase
app.post('/contest/add-problem/delete-testcase', user.delete_testcase);
// rank
app.get('/contest/rank', user.rank);
// data rank
app.get('/contest/data-rank', user.data_rank);
// load rank -> json
app.get('/contest/load-rank', user.load_rank);
// rank detail by rollnumber
app.get('/contest/detail-rank', user.detail_rank);
// submission page
app.get('/submission', user.submission);
// Submit submissions file
app.post('/submission/submit', user.submit);
// Destroy session when closing tab or browse
app.get('/session/destroy', user.session_destroy);
// Admin page
app.get('/admin', (req, res) => {
  // var userId = req.session.userId;
  // if (userId == null) {
  //   res.redirect("/login");
  //   return;
  // }
  var contest_id = req.query.contest_id;
  res.render('admin.ejs', { data: [], contest_id: contest_id, message: "", error: "", role: req.session.role, user: req.session.user });
});
app.get('/error', (req, res) => {
  res.render('404.ejs');
});


// Listen at port 8080
app.listen(process.env.PORT || 8080, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});