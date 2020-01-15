var Q = require("q");

module.exports = function(loc) {
  var deferred = Q.defer();

  //GEOCODING
  var geocoderProvider = "google";
  var httpAdapter = "http";
  var httpsAdapter = "https";
  var key = process.env.GOOGLE_KEY;
  // optionnal
  var extra = {
    apiKey: key, // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
  };

  var geocoder = require("node-geocoder")(
    geocoderProvider,
    httpsAdapter,
    extra
  );

  geocoder.geocode(loc, function(err, response) {
    if (err) {
      deferred.reject(err);
    } else {
      console.log(response);

      var cities = [];

      var limit = 6;

      if (response.length < 6) {
        limit = response.length;
      }

      for (var i = 0; i < limit; i++) {
        var city = response[i];
        var formattedCity = {
          address: city.formattedAddress,
          lat: city.latitude,
          long: city.longitude,
          city: city.city,
          country: city.country,
          id: i
        };

        cities.push(formattedCity);
      }
      console.log(cities);

      deferred.resolve(cities);
    }
  });

  return deferred.promise;
};
