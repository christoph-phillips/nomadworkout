var request = require("request");
var Q = require("q");
var os = require("os");

module.exports = function(req) {
  var deferred = Q.defer();

  var ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  var networkInterfaces = os.networkInterfaces();
  ip = networkInterfaces["Teredo Tunneling Pseudo-Interface"][0].address;
  console.log(ip);
  //ip = "49.229.183.111";

  var url = "http://freegeoip.net/json/" + ip;
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      deferred.resolve(body);
    } else {
      deferred.reject(error);
    }
  });

  return deferred.promise;
};
