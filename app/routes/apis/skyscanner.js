var fs = require("fs");
var request = require("request");
var Q = require("q");

//BASE URL AND KEY
var url = "http://partners.api.skyscanner.net/apiservices/pricing/v1.0";
var key = process.env.SKYSCANNER_KEY;

//VARS DEFAULTS
var country = "GB";
var origin = "Bangkok";
var currency = "USD";
var locale = "en_GB";
var destination = "Chiang Mai";
var date = "2016-05-16";

module.exports = function(
  originName,
  destinationName,
  countryCode,
  currencyName,
  localeCode,
  dateYYYYMMDD
) {
  var deferred = Q.defer();

  origin = originName;
  destination = destinationName;
  country = countryCode;
  currency = currencyName;
  locale = localeCode;
  date = dateYYYYMMDD;
  //ADD FUNCTIONS TO GET CODES FOR PLACES
  var functions = [];
  functions.push(getCode(origin));
  functions.push(getCode(destination));

  Q.all(functions)
    .then(function(data) {
      //overwrite original values
      origin = data[0];
      destination = data[1];
    })
    .then(function(data) {
      //GET SESSION

      return getSession();
    })
    .then(function(url) {
      //POLL FLIGHT DATA
      return pollData(url);
    })
    .then(function(priceObj) {
      //LOG OUT PRICE OBJ WITH PRICE AND URL
      deferred.resolve(priceObj);
    })
    .catch(function(error) {
      console.log(error);
      deferred.reject(error);
    });

  return deferred.promise;
};

function getCode(query) {
  var deferred = Q.defer();

  var url =
    "http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/" +
    country +
    "/" +
    currency +
    "/" +
    locale +
    "?query=" +
    query +
    "&apiKey=" +
    key;

  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body)
      body = JSON.parse(body);
      if (body.Places[0]) {
        deferred.resolve(body.Places[0].PlaceId);
      } else {
        deferred.resolve("no id");
      }
    } else {
      console.log(error);
      deferred.reject(error);
    }
  });
  return deferred.promise;
}

function getSession() {
  var deferred = Q.defer();

  var query =
    "apiKey=" +
    key +
    "&country=" +
    country +
    "&currency=" +
    currency +
    "&locale=" +
    locale +
    "&originplace=" +
    origin +
    "&destinationplace=" +
    destination +
    "&outbounddate=" +
    date +
    "&adults=1" +
    "&locationschema=Sky";

  request.post(
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json"
      },
      url: url,
      body: query
    },
    function(error, response, body) {
      if (error) {
        deferred.reject(error);
      } else {
        deferred.resolve(response.headers.location);
      }
    }
  );

  return deferred.promise;
}

function pollData(url) {
  url = url + "?apiKey=" + key;

  var deferred = Q.defer();
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body)
      body = JSON.parse(body);
      if (body.Itineraries[0]) {
        var flight = {
          price: body.Itineraries[0].PricingOptions[0].Price,
          url: body.Itineraries[0].PricingOptions[0].DeeplinkUrl
        };
        deferred.resolve(flight);
      } else {
        var flight = {
          price: 0,
          url: "http://www.skyscanner.net"
        };
        deferred.resolve(flight);
      }
    } else {
      deferred.reject(error);
    }
  });
  return deferred.promise;
}

function prettyString(json) {
  return JSON.stringify(json, null, 4);
}
