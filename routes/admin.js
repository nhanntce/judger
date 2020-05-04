exports.dashboard = function (req, res, next) {
    // var userId = req.session.userId
    // if (userId == null) {
    //     res.redirect("/login")
    //     return
    // }
    var sql = "SELECT * FROM student_account"
    db.query(sql, function (err, result) {
        if (err) { res.redirect("/error"); return }
        res.render('admin.ejs', { data: result});
    })
    
}
exports.admin_student = function (req, res, next) {
    // var userId = req.session.userId
    // if (userId == null) {
    //     res.redirect("/login")
    //     return
    // }
    var sql = "SELECT * FROM student_account"
    db.query(sql, function (err, result) {
        if (err) { res.redirect("/error"); return }
        res.render('admin-student.ejs', { data: result});
    })
    
}
exports.admin_teacher = function (req, res, next) {
    // var userId = req.session.userId
    // if (userId == null) {
    //     res.redirect("/login")
    //     return
    // }
    var sql = "SELECT * FROM teacher_account"
    db.query(sql, function (err, result) {
        if (err) { res.redirect("/error"); return }
        res.render('admin-teacher.ejs', { data: result});
    })
    
}