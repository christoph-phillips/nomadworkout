var request = require("request");
var Q = require("q");

var id = process.env.FOURSQUARE_ID;
var secret = process.env.FOURSQUARE_SECRET;

var idString = "client_id=" + id + "&";

var secretString = "client_secret=" + secret + "&";
var restaurantObjects = [];

module.exports = function(lat, long) {
  restaurantObjects = [];
  var deferred = Q.defer();
  //GET LIST OF RESTARAUNT DATA
  getRestaurants(lat, long).then(function(data) {
    //BUILD API CALLS
    var apiCalls = buildApiCalls(data);

    //SEND API CALLS THEN RETURN ALL RESTAURANT OBJECTS
    Q.all(apiCalls)
      .then(function() {
        deferred.resolve(restaurantObjects);
      })
      .catch(function(err) {
        deferred.reject(err);
      });
  });

  return deferred.promise;
};

//GETS MULTIPLE RESTAURANT BASIC DATA
function getRestaurants(lat, long) {
  var deferred = Q.defer();

  //CREATE URL
  var url =
    "https://api.foursquare.com/v2/venues/explore?" +
    idString +
    secretString +
    "v=20130815&limit=10&ll=" +
    lat +
    "," +
    long +
    "&query=healthy&limit=10";

  //SEND OFF REQUEST FOR RESTAURANTS
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      var restaurants = body.response.groups[0].items;
      deferred.resolve(restaurants);
    } else {
      deferred.reject(error);
    }
  });

  return deferred.promise;
}

//BUILDS ARRAY OF API CALL FUNCTIONS
function buildApiCalls(restaurants) {
  var functions = [];

  restaurants.map(function(restaurant) {
    //create URL to get photos
    var url =
      "https://api.foursquare.com/v2/venues/" +
      restaurant.venue.id +
      "/photos?" +
      idString +
      secretString +
      "v=20140130";
    var restaurantObject = {
      id: restaurant.venue.id,
      url: restaurant.venue.url,
      name: restaurant.venue.name
    };

    functions.push(getRestaurant(url, restaurantObject));
  }); //end of MAP

  return functions;
}

//FUNCTION TO GET SINGLE RESTAURANT DETAILS
function getRestaurant(url, restaurantObj) {
  var deferred = Q.defer();

  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      restaurantObj.photo = body.response.photos.items;
      restaurantObjects.push(restaurantObj);
      deferred.resolve(body.response.photos.items);
    } else {
      deferred.reject(error);
    }
  });

  return deferred.promise;
}
