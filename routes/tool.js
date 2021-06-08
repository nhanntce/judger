//---------------------------------Validate Datetime DD-MM-YYYY HH:ii----------------------------------
exports.ValidateDate = function(dt) {
  try {
    var isValidDate = false
    var arr1 = dt.split('-')
    var year = 0; var month = 0; var day = 0; var hour = 0; var minute = 0; var sec = 0;
    if (arr1.length == 3) {
      var arr2 = arr1[2].split(' ')
      if (arr2.length == 2) {
        var arr3 = arr2[1].split(':')
        try {
          year = parseInt(arr2[0], 10)
          month = parseInt(arr1[1], 10)
          day = parseInt(arr1[0], 10)
          hour = parseInt(arr3[0], 10)
          minute = parseInt(arr3[1], 10)
          //sec = parseInt(arr3[0],10)
          sec = 0
          var isValidTime = false
          if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && sec >= 0 && sec <= 59) isValidTime = true
          else if (hour == 24 && minute == 0 && sec == 0) isValidTime = true
          if (isValidTime) {
            var isLeapYear = false
            if (year % 4 == 0) isLeapYear = true
            if ((month == 4 || month == 6 || month == 9 || month == 11) && (day >= 0 && day <= 30)) isValidDate = true
            else if ((month != 2) && (day >= 0 && day <= 31)) isValidDate = true
            if (!isValidDate) {
              if (isLeapYear) {
                if (month == 2 && (day >= 0 && day <= 29))
                  isValidDate = true
              }
              else {
                if (month == 2 && (day >= 0 && day <= 28))
                  isValidDate = true
              }
            }
          }
        }
        catch (er) { isValidDate = false }
      }
    }
    return isValidDate
  }
  catch (err) { alert('ValidateDate: ' + err) }
}
// format Time yyyy-mm-ddTh:i:s+00:00
exports.formatTime = function(s) {
  d = s.split('-')[0]
  m = s.split('-')[1]
  y = s.split('-')[2].split(' ')[0]
  return y + '-' + m + '-' + d + s.substring(10) + '+00:00'
}
// get folder in Directories
exports.getFolders = function(srcpath) {
  try {
    return fs.readdirSync(srcpath)
      .map(file => path.join(srcpath, file))
      .filter(path => fs.statSync(path).isDirectory())
  } catch (error) {
    return []
  }
}
// Round n decimal place float number
exports.RoundAndFix = function(n, d) {
  var m = Math.pow(10, d);
  return Math.round(n * m) / m;
}