/*
* GET home page.
*/
exports.index = function (req, res) {
  if (req.session.userId != null) {
    res.redirect("/home/dashboard");
    return;
  }
  var message = '';
  res.render('index', { message: message, username: req.session.user });
};
