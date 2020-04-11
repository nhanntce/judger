const lignator = require('lignator');
const formidable = require('formidable');
const extract = require("extract-zip");
const zipper = require('zip-local');
//TIME OUT
const minutes = 15;

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

    if (req.method == "POST") {
        var post = req.body;
        var user = post.user_name;
        var pass = post.password;
        var role = (post.role == "Student") ? "student_account" : "teacher_account";
        var crypto = require('crypto');
        var hash = crypto.createHash('md5').update(pass).digest("hex");
        var ipaddress = (req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress).split(",")[0];
        var sql = "";
        if (role == "student_account") {
            var sql = "SELECT * FROM `" + role + "` WHERE (`username`='" + user + "' and password = '" + hash + "' and ip='" + ipaddress + "') or (`username`='" + user + "' and password = '" + hash + "' and " + new Date().getTime() + " >= ROUND(UNIX_TIMESTAMP(timeout) * 1000) and islogin=0)";
            db.query(sql, function (err, results) {
                if (results.length) {
                    req.session.userId = results[0].id;
                    req.session.role = post.role;
                    req.session.user = results[0].username;
                    req.session.ipaddress = ipaddress;
                    // record ip and timeout
                    sql = "UPDATE student_account SET `ip`='" + ipaddress + "',`timeout`='" + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + minutes * 60000).toISOString().substring(0, 19) + "', `islogin`=1 WHERE `id`=" + results[0].id;
                    db.query(sql);
                    res.redirect('/home/dashboard');
                } else {
                    message = 'Wrong Credentials.';
                    res.render('index.ejs', { message: message });
                }
            });

        } else {
            sql = "SELECT * FROM `" + role + "` WHERE `username`='" + user + "' and password = '" + hash + "'";
            db.query(sql, function (err, results) {
                if (results.length) {
                    req.session.userId = results[0].id;
                    req.session.role = post.role;
                    req.session.user = results[0].username;
                    req.session.teacher_rollnumber = results[0].rollnumber;
                    req.session.ipaddress = ipaddress;

                    res.redirect('/home/dashboard');
                } else {
                    message = 'Wrong Credentials.';
                    res.render('index.ejs', { message: message });
                }

            });
        }
    } else {
        res.render('index.ejs', { message: message });
    }

};
//-----------------------------------------------dashboard page functionality----------------------------------------------

exports.dashboard = function (req, res, next) {

    var userId = req.session.userId,
        role = (req.session.role == "Student") ? "student_account" : "teacher_account";
    console.log('ddd=' + userId + ' ' + role);
    if (userId == null) {
        res.redirect("/login");
        return;
    }
    var sql = "SELECT * FROM `" + role + "` WHERE `id`='" + userId + "'";

    db.query(sql, function (err, results) {
        res.render('dashboard.ejs', { role: req.session.role, user: req.session.user });
    });

};
//------------------------------------logout functionality----------------------------------------------
exports.logout = function (req, res) {
    if (req.session.role == "Student") {
        var sql = "UPDATE student_account SET `ip`='" + req.session.ipaddress + "',`timeout`='" + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + minutes * 60000).toISOString().substring(0, 19) + "', `islogin`=0 WHERE `id`=" + req.session.userId;
        db.query(sql);
    }
    console.log(req.session.user + " has disconected");
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
        res.render('profile.ejs', { data: result, role: req.session.role, user: req.session.user });
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

    var sql = "SELECT * FROM `contest` WHERE `teacher_rollnumber`='" + teacher_rollnumber + "' AND `deleted`=0";
    db.query(sql, function (err, results) {
        res.render('contest.ejs', { data: results, role: req.session.role, user: req.session.user });
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
        var starttime = post.starttime;
        var endtime = post.endtime;
        if (!fs.existsSync('./public/thumucbailam/' + contest_name)) {
            fs.mkdirSync('./public/thumucbailam/' + contest_name);
        }
        if (!fs.existsSync('./public/debai/' + contest_name)) {
            fs.mkdirSync('./public/debai/' + contest_name);
        }
        if (!fs.existsSync('./public/thumuctest/' + contest_name)) {
            fs.mkdirSync('./public/thumuctest/' + contest_name);
        }
        if (!fs.existsSync('./public/nopbai/Logs/' + contest_name)) {
            fs.mkdirSync('./public/nopbai/Logs/' + contest_name);
        }
        var sql = "INSERT INTO `contest`(`contest_name`, `teacher_rollnumber`, `time_begin`, `time_end`) VALUES ('" + contest_name + "', '" + teacher_rollnumber + "', '" + starttime + "', '" + endtime + "')";
        db.query(sql, function (err, results) {
            res.redirect("/contest");
        });
    }
};
//---------------------------------Delete a contest----------------------------------
exports.delete_contest = function (req, res) {
    var userId = req.session.userId;

    if (userId == null) {
        res.redirect("/login");
        return;
    }

    if (req.method == "POST") {
        var post = req.body;
        var contest_id = post.contest_id;

        var sql = "UPDATE `contest` SET `deleted`=1 WHERE `contest_id`=" + contest_id;
        db.query(sql, function (err, results) {
            res.redirect("/contest");
        });
    }
};
//---------------------------------Edit a contest----------------------------------
exports.edit_contest = function (req, res) {
    var userId = req.session.userId;

    if (userId == null) {
        res.redirect("/login");
        return;
    }

    if (req.method == "POST") {
        var post = req.body;
        var contest_id = post.contest_id;
        var contest_name = post.contest_name;
        var time_begin = post.time_begin;
        var time_end = post.time_end;
        var sql = "UPDATE `contest` SET `contest_name`='" + contest_name + "',`time_begin`='" + time_begin + "',`time_end`='" + time_end + "' WHERE `contest_id`=" + contest_id;
        db.query(sql, function (err, results) {
            res.redirect("/contest/detail?contest_id=" + contest_id);
        });
    }
};
//---------------------------------Download a contest----------------------------------
exports.download = function (req, res) {
    var userId = req.session.userId;

    if (userId == null) {
        res.redirect("/login");
        return;
    }
    var contest_id = req.query.contest_id;
    var sql = "SELECT contest_name from contest WHERE `contest_id`=" + contest_id;
    db.query(sql, function (err, results) {
        var contest_name = results[0].contest_name;
        zipper.sync.zip("./public/thumucbailam/" + contest_name).compress().save(contest_name + ".zip");
        var file = contest_name + ".zip";
        res.download(file) 
    });

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
    if (req.query.success == 1) {
        message = "Succesfully! Student has been deleted.";
    }

    var sql = "SELECT student_account.id, contest_student.student_rollnumber, student_account.name, student_account.class, contest.contest_id, contest.contest_name, contest.time_begin, contest.time_end FROM contest_student " +
        "INNER JOIN student_account ON contest_student.student_rollnumber=student_account.rollnumber " +
        "INNER JOIN contest ON contest_student.contest_id=contest.contest_id " +
        "WHERE contest.contest_id=" + contest_id;
    db.query(sql, function (err, results) {
        if (results.length == 0) {
            sql = "SELECT contest_name, time_begin, time_end  FROM contest WHERE contest_id=" + contest_id;
            db.query(sql, function (err, results) {
                res.render('contest-detail.ejs', { data: [], contest_name: results[0].contest_name, contest_id: contest_id, message: message, time_begin: results[0].time_begin, time_end: results[0].time_end, role: req.session.role, user: req.session.user });
            });
        } else {
            res.render('contest-detail.ejs', { data: results, contest_name: results[0].contest_name, contest_id: contest_id, message: message, time_begin: results[0].time_begin, time_end: results[0].time_end, role: req.session.role, user: req.session.user });
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
        if (list_rollnumber != "") {
            var list = list_rollnumber.split(",");
            var sql = "";
            for (let i = 0, l = list.length; i < l; ++i) {
                sql = "DELETE FROM `contest_student` WHERE student_rollnumber='" + list[i] + "'";
                db.query(sql);
                sql = "UPDATE `student_account` SET `in_contest`=0 WHERE rollnumber='" + list[i] + "'";
                db.query(sql);
            }
        }
        res.redirect("/contest/detail?contest_id=" + contest_id + "&success=1");
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
    if (req.query.success == 1) {
        message = "Succesfully! Student has been added.";
    }
    var class_name = req.query.class_name;
    var contest_id = req.query.contest_id;
    var sql = "SELECT rollnumber, name, class FROM student_account WHERE class='" + class_name + "' and in_contest=0";
    db.query(sql, function (err, results) {
        res.render('add-user.ejs', { data: results, contest_id: contest_id, message: message, class_name: class_name, role: req.session.role, user: req.session.user });
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
        var class_name = post.class_name;

        if (list_rollnumber != "") {
            var sql = "SELECT contest_name FROM contest WHERE contest_id=" + contest_id;
            db.query(sql, function (err, results) {
                var contest_name = results[0].contest_name;
                var list = list_rollnumber.split(",")
                var sql = "";
                for (let i = 0, l = list.length; i < l; ++i) {
                    if (!fs.existsSync('./public/thumucbailam/' + contest_name + '/' + list[i])) {
                        fs.mkdirSync('./public/thumucbailam/' + contest_name + '/' + list[i]);
                    }
                    sql = "INSERT INTO `contest_student`(`student_rollnumber`, `contest_id`) VALUES ('" + list[i] + "'," + contest_id + ")";
                    db.query(sql);
                    sql = "UPDATE `student_account` SET `in_contest`=1 WHERE rollnumber='" + list[i] + "'";
                    db.query(sql);
                }
            });
        }
        res.redirect("/contest/load-user?class_name=" + class_name + "&contest_id=" + contest_id + "&success=1");


    }
};
// get folder in Directories
function getFolders(srcpath) {
    try {
        return fs.readdirSync(srcpath)
            .map(file => path.join(srcpath, file))
            .filter(path => fs.statSync(path).isDirectory());
    } catch (error) { }
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
        var problem_files = [];
        fs.readdir('./public/debai/' + contest_name, function (err, files) {
            problem_files = files;
            var testcase = [];
            var testcase_size = [];
            var testcase_path = [];
            var folders = getFolders('./public/thumuctest/' + contest_name);
            for (let i = 0, l = folders.length; i < l; i++) {
                var tmp = folders[i].split('\\');
                testcase.push(tmp[tmp.length - 1]);
                testcase_size.push(getFolders(folders[i]).length);
                testcase_path.push(folders[i]);
            }
            res.render('add-problem.ejs', { problem_files: problem_files, testcase: testcase, testcase_size: testcase_size, testcase_path: testcase_path, contest_id: contest_id, contest_name: contest_name, message: "", role: req.session.role, user: req.session.user });
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
//---------------------------------rank----------------------------------
exports.rank = function (req, res) {
    var userId = req.session.userId;
    if (userId == null) {
        res.redirect("/login");
        return;
    }
    var teacher_rollnumber = req.session.teacher_rollnumber;
    var sql = "SELECT * FROM `contest` WHERE `teacher_rollnumber`='" + teacher_rollnumber + "'";
    db.query(sql, function (err, results) {
        res.render('rank.ejs', { data: results, role: req.session.role, user: req.session.user });
    });
};
//---------------------------------data rank----------------------------------
exports.data_rank = function (req, res) {
    var userId = req.session.userId;
    if (userId == null) {
        res.redirect("/login");
        return;
    }
    var message = "";

    var contest_id = req.query.contest_id;
    var sql = "SELECT * FROM `contest_student` WHERE `contest_id`=" + contest_id;
    db.query(sql, function (err, results) {
        if (results.length == 0) {
            message = "No student in contest";
            res.render('data-rank.ejs', { data: [], problem_files: [], message: message, role: req.session.role, user: req.session.user });
        } else {
            sql = "SELECT * FROM `contest` WHERE `contest_id`=" + contest_id;
            db.query(sql, function (err, results) {

                var contest_name = results[0].contest_name;
                var problem_files = [];
                fs.readdir('./public/debai/' + contest_name, function (err, files) {
                    problem_files = files;
                    res.render('data-rank.ejs', { data: results, problem_files: problem_files, message: message, role: req.session.role, user: req.session.user });
                });
            });
        }
    });
};
//---------------------------------load rank -> json----------------------------------
exports.load_rank = function (req, res) {
    var contest_id = req.query.contest_id;
    var sql = "SELECT student_account.id, contest_student.student_rollnumber, student_account.name, student_account.class, contest.contest_id, contest.contest_name, contest.time_begin, contest.time_end FROM contest_student " +
        "INNER JOIN student_account ON contest_student.student_rollnumber=student_account.rollnumber " +
        "INNER JOIN contest ON contest_student.contest_id=contest.contest_id " +
        "WHERE contest.contest_id=" + contest_id;
    db.query(sql, function (err, results) {
        var contest_name = results[0].contest_name;
        var problem_files = [];
        fs.readdir('./public/debai/' + contest_name, function (err, files) {
            problem_files = files;
            var log_files = [];
            fs.readdir('./public/nopbai/Logs/' + contest_name, function (err, files) {
                log_files = files;
                res.render('load-rank.ejs', { data: results, problem_files: problem_files, log_files: log_files, message: "", role: req.session.role, user: req.session.user });
            });
        });
    });
};
//---------------------------------rank detail----------------------------------
exports.detail_rank = function (req, res) {
    var userId = req.session.userId;
    if (userId == null) {
        res.redirect("/login");
        return;
    }
    var rollnumber = req.query.rollnumber;
    var sql = "SELECT contest.contest_name, contest.contest_id FROM `contest_student` INNER JOIN contest ON contest_student.contest_id=contest.contest_id WHERE student_rollnumber='" + rollnumber + "'";
    db.query(sql, function (err, results) {
        var contest_name = results[0].contest_name;
        var contest_id = results[0].contest_id;
        fs.readdir('./public/nopbai/Logs/' + contest_name, function (err, files) {
            var log_files = []
            for (let i = 0, l = files.length; i < l; i++) {
                if (files[i].includes(rollnumber)) {
                    log_files.push(files[i])
                }
            }
            var bailam = traverseDir('./public/thumucbailam/' + contest_name + '/' + rollnumber);
            res.render('rank-detail.ejs', { bailam: bailam, contest_name: contest_name, contest_id: contest_id, rollnumber: rollnumber, log_files: log_files, message: "", role: req.session.role, user: req.session.user });
        });
    });

};

// traverse Directory
function traverseDir(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(traverseDir(file));
        } else {
            /* Is a file */
            results.push(file);
        }
    });
    return results;
}
//---------------------------------submissions page----------------------------------
exports.submission = function (req, res) {
    var userId = req.session.userId;
    if (userId == null) {
        res.redirect("/login");
        return;
    }
    var message = "";
    if (req.query.success) {
        message = "Submit successfully!"
    }
    if (req.query.error) {
        message = "Submit error!"
    }
    var sql = "SELECT * FROM `contest_student` " +
        "INNER JOIN contest ON contest_student.contest_id=contest.contest_id " +
        "INNER JOIN student_account ON contest_student.student_rollnumber=student_account.rollnumber " +
        "WHERE student_account.id=" + userId;
    db.query(sql, function (err, results) {
        if (results.length == 0) {
            error = "You have no contests";
            res.render('submit.ejs', { error: error, role: req.session.role, user: req.session.user });
        } else {
            var contest_name = results[0].contest_name;
            fs.readdir('./public/debai/' + contest_name, function (err, files) {
                var problem_files = files;
                var bailam = traverseDir('./public/thumucbailam/' + contest_name + '/' + results[0].rollnumber);
                res.render('submit.ejs', { error: "", data: results, problem_files: problem_files, bailam: bailam, message: message, role: req.session.role, user: req.session.user });
            });
        }
    });
};
//---------------------------------Submit submissions file----------------------------------
exports.submit = function (req, res) {
    if (req.method == "POST") {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (files.filetoupload.name == "") {
                res.redirect("/submission?error=1");
                return;
            }
            var type = files.filetoupload.name.split('.');
            var ip = "";
            if (req.session.ipaddress.includes(':')) {
                ip = req.session.ipaddress.replace(/:/g, '');
            } else if (req.session.ipaddress.includes('.')) {
                ip = req.session.ipaddress.replace(/./g, '_');
            }
            var newfile = '[' + ip + '][' + fields.time + '][' + fields.contest_name + '][' + fields.rollnumber + '][' + fields.tenbai + '].' + type[type.length - 1];
            var oldpath = files.filetoupload.path;
            var newpath = './public/nopbai/' + newfile;
            fs.readFile(oldpath, function (err, data) {
                if (err) throw err;
                // Write the file
                fs.writeFile(newpath, data, function (err) {
                    if (err) throw err;
                });
                // Delete the file
                fs.unlink(oldpath, function (err) {
                    if (err) throw err;
                });
                res.redirect("/submission?success=1");
            });

        });

    }
};
//---------------------------------Destroy session when closing tab or browser----------------------------------
exports.session_destroy = function (req, res) {
    if (req.session.role == "Student") {
        var sql = "UPDATE student_account SET `ip`='" + req.session.ipaddress + "',`timeout`='" + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + minutes * 60000).toISOString().substring(0, 19) + "', `islogin`=0 WHERE `id`=" + req.session.userId;
        db.query(sql);
    }
    console.log(req.session.user + " has disconected");
    req.session.destroy();
};