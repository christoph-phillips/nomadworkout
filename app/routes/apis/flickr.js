var request = require("request");
var Q = require("q");

module.exports = function(lat, long, city, country) {
  var deferred = Q.defer();

  var key = process.env.FLICKR_KEY;
  var secret = process.env.FLICKR_SECRET;
  var tags = city;
  var perPage = 10;
  var license = "license=1,2,3,4,5,6,7";
  var url =
    "https://api.flickr.com/services/rest/?method=flickr.photos.search&tags=" +
    tags +
    "&api_key=" +
    key +
    "&lat=" +
    lat +
    "&lon=" +
    long +
    "&format=json&tagmode=any&iscommons=true&per_page=" +
    perPage +
    "&json" +
    "&nojsoncallback=1";

  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      if (body.photos.photo[0]) {
        var photo = body.photos.photo[0];
        var id = body.photos.photo[0].owner;
      }

      var img;
      var attribution;
      var photoObj = {};
      if (photo) {
        img =
          "https://farm" +
          photo.farm +
          ".staticflickr.com/" +
          photo.server +
          "/" +
          photo.id +
          "_" +
          photo.secret +
          ".jpg";
        attribution = "http://www.flickr.com/" + photo.owner + "/" + photo.id;
        photoObj.img = img;
        photoObj.attr = attribution;
      } else {
        img = "/public/images/city-placeholder.jpg";
        photoObj.img = img;
      }

      deferred.resolve(photoObj);
    } else {
      deferred.reject("Error found or no data.");
    }
  });

  return deferred.promise;
};
