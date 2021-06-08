var Logger = (exports.Logger = {});

var infoStream = fs.createWriteStream("logs/info/" + dayjs(new Date()).format('DDMMYYYY') + "_info.txt", {flags: 'a'});
var errorStream = fs.createWriteStream("logs/error/" + dayjs(new Date()).format('DDMMYYYY') + "_error.txt", {flags: 'a'});
var debugStream = fs.createWriteStream("logs/debug.txt", {flags: 'a'});

Logger.info = function(msg) {
  var message = dayjs(new Date()).format('DD-MM-YYYY HH:mm:ss') + " : " + msg;
  console.log(message)
  infoStream.write(message + "\n");
};

Logger.debug = function(msg) {
  var message = dayjs(new Date()).format('DD-MM-YYYY HH:mm:ss') + " : " + msg;
  console.log(message)
  debugStream.write(message + "\n");
};

Logger.error = function(msg) {
  var message = dayjs(new Date()).format('DD-MM-YYYY HH:mm:ss') + " : " + msg;
  console.log(message)
  errorStream.write(message + "\n");
};