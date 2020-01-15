"use strict";

var path = process.cwd();
var Q = require("q");
var fs = require("fs");
var passport = require("passport");
var sm = require("sitemap");
var https = require("https");

var DAO = require("../controllers/DAO.js");

//API FUNCTIONS

var fbook = require("./apis/fbookgroups.js");
var flickr = require("./apis/flickr.js");
var fourSquare = require("./apis/foursquare.js");
var locate = require("./apis/ipLocate.js");
var skyscan = require("./apis/skyscanner.js");
var geo = require("./apis/geo.js");
var Strava = require("./apis/Strava.js");
var Weather = require("./apis/Weather.js");

var NodeMailer = require("./apis/NodeMailer.js");

//REACT
var React = require("react");
var ReactDOM = require("react-dom");
var ReactDOMServer = require("react-dom/server");
var ReactBootstrap = require("react-bootstrap");

//USER SCHEMA
var Users = require("../models/users.js");

//CITIES SCHEMA
var Cities = require("../models/cities.js");

//DATA ACCESS OBJECT
var DAO = new DAO();

module.exports = function(app, passport) {
  // route middleware to make sure a user is logged in
  function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    res.send("You must be logged in to access this part of the application.");
  }

  function userExists(req, res, next) {
    if (req.user) {
      next();
    } else {
      res.send("You must be logged in to access this part of the application.");
    }
  }

  var fbookScope = ["public_profile", "email"];

  //FBOOK LOGIN
  app.get(
    "/auth/facebook",
    function(req, res, next) {
      req.session.redirect = req.query.redirect;
      next();
    },
    passport.authenticate("facebook", { scope: fbookScope })
  );

  // handle the callback after facebook has authenticated the user
  app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/signinfailure" }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect(req.session.redirect || "/");
    }
  );

  //STRAVA

  app.get(
    "/auth/strava",
    function(req, res, next) {
      req.session.redirect = req.query.redirect;
      next();
    },
    passport.authenticate("strava" /*, { scope: ['write'] }*/)
  );

  app.get(
    "/auth/strava/callback",
    passport.authenticate("strava", { failureRedirect: "/signinfailure" }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect(req.session.redirect || "/");
    }
  );

  //LOCAL

  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/", // redirect to the secure profile section
      failureRedirect: "/failure"
    })
  );

  // process the login form
  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/", // redirect to the secure profile section
      failureRedirect: "/signinfailure"
    })
  );

  //SIGN IN FAILURES

  app.route("/failure").get(function(req, res) {
    res.send({
      message:
        "There was an error when trying to add you as a user, perhaps you left a field blank?",
      failure: true
    });
  });
  app.route("/signinfailure").get(function(req, res) {
    res.send({
      message:
        "There was an error logging you in, please check your email and password or your social login information.",
      failure: true
    });
  });

  //LOGOUT

  app.route("/logout").get(function(req, res) {
    var url = req.query.redirect;
    req.logout();
    res.redirect(url || "/");
  });

  //ROUTES AND API

  app.route("/").get(function(req, res) {
    console.log(req.user);
    console.log(req.session);

    //CREATE MARKUP
    //RENDER PAGE WITH MARKUP AND PROP

    var query = {};
    query.query = {};
    query.projection = {
      "running.segments": 0,
      "riding.segments": 0,
      "running.runners": 0,
      "riding.riders": 0
    };
    query.sort = { "running.runnerCount": "desc" };
    query.limit = +req.query.limit || 20;

    DAO.getAllCities(query)
      .then(function(data) {
        //WORK WITH DATA

        data = JSON.stringify(data);
        data = JSON.parse(data);

        //CREATE FACTORIES

        var Main = React.createFactory(require("../components/Main.js"));
        var Sidebar = React.createFactory(require("../components/Sidebar.js"));
        var Header = React.createFactory(require("../components/Header.js"));

        //IF HERE IS USER - USE USER HEADER
        var user = "none";
        if (req.user) {
          Header = React.createFactory(require("../components/UserHeader.js"));
          user = true;
        }

        var main = ReactDOMServer.renderToString(Main({ data: data }));
        var sidebar = ReactDOMServer.renderToString(Sidebar({ data: data }));
        var header = ReactDOMServer.renderToString(
          Header({ data: data, type: "front" })
        );

        var pageTitle = "NomadWorkout";
        var pageDescription =
          "Find the best places in the world to run, bike, and workout. Contact country guides and read informative tips. Ranked and detailed for your pleasure.";

        res.render("index", {
          main: main,
          sidebar: sidebar,
          header: header,
          pageType: "front",
          similarCities: null,
          data: safeStringify(data),
          user: safeStringify(user),
          pageTitle: pageTitle,
          pageDescription: pageDescription
        });
      })
      .catch(function(err) {
        console.log("got an error server side rendering components " + err);
      });
  });

  app.route("/city/:slug").get(function(req, res) {
    //CREATE MARKUP
    //RENDER PAGE WITH MARKUP AND PROP
    var slug = req.params.slug;

    var query = {};
    query.query = { "info.city.slug": slug };
    query.projection = {};
    query.sort = {};
    query.limit = {};

    DAO.getSingleCity(query)
      .then(function(data) {
        data = JSON.stringify(data);
        data = JSON.parse(data);

        var similarQuery = {};
        similarQuery.query = {};

        if (data.weather) {
          var elevMax = data.weather.elevation + 700;
          var elevMin = data.weather.elevation - 700;

          var date = new Date();
          var month = date.getMonth();

          var tempMin = data.weather.data[month].avgTemp - 8;
          var tempMax = data.weather.data[month].avgTemp + 8;
          var tempQueryString = "weather.data." + month + ".avgTemp";

          similarQuery.query = {
            "weather.elevation": { $gt: elevMin, $lt: elevMax }
          };
          similarQuery.query[tempQueryString] = { $gt: tempMin, $lt: tempMax };
        }

        var runners = data.running.runnerCount;
        var runnerMax = runners + 20000;
        var runnerMin = runners - 20000;

        similarQuery.query["running.runnerCount"] = {
          $gt: runnerMin,
          $lt: runnerMax
        };
        similarQuery.projection = { info: 1 };
        similarQuery.sort = {};
        similarQuery.limit = 5;

        console.log(JSON.stringify(similarQuery));

        DAO.getAllCities(similarQuery)
          .then(function(similarCities) {
            var Single = React.createFactory(
              require("../components/Single.js")
            );
            var Sidebar = React.createFactory(
              require("../components/Sidebar.js")
            );
            var Header = React.createFactory(
              require("../components/Header.js")
            );

            //IF HERE IS USER - USE USER HEADER
            var user = "none";
            if (req.user) {
              Header = React.createFactory(
                require("../components/UserHeader.js")
              );
              user = true;
            }

            var single = ReactDOMServer.renderToString(
              Single({ data: data, weatherContainer: "chart" })
            );
            var sidebar = ReactDOMServer.renderToString(
              Sidebar({ data: data, similarCities: similarCities })
            );
            var header = ReactDOMServer.renderToString(
              Header({ data: data, type: "single" })
            );

            var pageTitle = "Run, cycle, and workout in " + data.info.city.name;
            var pageDescription =
              "Find the best places in " +
              data.info.city.name +
              " to run, bike, and workout. Contact country guides and read informative tips.";

            res.render("single", {
              main: single,
              sidebar: sidebar,
              header: header,
              pageType: "single",
              similarCities: safeStringify(similarCities),
              data: safeStringify(data),
              user: safeStringify(user),
              pageTitle: pageTitle,
              pageDescription: pageDescription
            });
          })
          .catch(function(err) {
            console.log("got an error server side rendering components " + err);
          });
      })
      .catch(function(err) {
        console.log("got an error server side rendering components " + err);
      });
  });

  //DATA ROUTES

  app.get("/api/cities", function(req, res) {
    console.log(req.query);
    //DECLARE QUERY
    var query = {};

    //QUERY

    query.query = {};

    //HOTEL COST
    var minHotelCost = req.query.minHotelCost;
    var maxHotelCost = req.query.maxHotelCost;
    query.query["cost.hotel.USD"] = { $gt: +minHotelCost, $lt: +maxHotelCost };

    //TEMP
    if (req.query.temp) {
      var month = req.query.month;
      var tempQueryString = "weather.data." + month + ".avgTemp";
      query.query[tempQueryString] = {
        $gt: +req.query.temp.min,
        $lt: +req.query.temp.max
      };
    }

    //RAIN
    if (req.query.rain) {
      var month = req.query.month;
      var rainQueryString = "weather.data." + month + ".wetDays";
      query.query[rainQueryString] = { $lte: +req.query.rain };
    }

    //TERRAIN
    if (req.query.terrain) {
      var terrainQuery = req.query.terrain;
      var elevationSeparator = 500;

      query.query["riding.elevation"] = { $lt: elevationSeparator };
      if (terrainQuery === "hilly") {
        query.query["riding.elevation"] = { $gt: elevationSeparator };
      }
    }

    //ALTITUDE
    if (req.query.alt) {
      var altQuery = req.query.alt;
      var altString = "weather.elevation";

      query.query[altString] = { $gt: +altQuery.min, $lt: +altQuery.max };
    }

    //CONTINENT

    if (req.query.continent) {
      var continent = req.query.continent;
      query.query["info.region.slug"] = continent;
    }

    //PROJECTION
    query.projection = {
      "running.segments": 0,
      "riding.segments": 0,
      "running.runners": 0,
      "riding.riders": 0
    };

    //SORT
    if (req.query.sortBy) {
      var sortField = req.query.sortBy;
      query.sort = {};
      query.sort[sortField] = -1;
    } else {
      query.sort = { "running.runnerCount": "desc" };
    }

    //LIMIT

    query.limit = +req.query.limit || 20;

    console.log(query);

    DAO.getAllCities(query)
      .then(function(data) {
        res.send(data);
      })
      .catch(function(err) {
        console.log("got an error server side api/cities " + err);
      });
  });

  app.get("/api/hotelcost", function(req, res) {
    DAO.getHotelValues()
      .then(function(data) {
        res.send(data);
      })
      .catch(function(err) {
        console.log(err);
      });
  });

  app.get("/api/totals", function(req, res) {
    DAO.getTotals()
      .then(function(data) {
        console.log(data);
        var dataObj = {
          running: data[0],
          riding: data[1],
          elevation: data[2],
          cost: data[3]
        };

        res.send(dataObj);
      })
      .catch(function(err) {
        res.send(err);
        console.log(err);
      });
  });

  app.get("/api/citynames", function(req, res) {
    DAO.getCityNames()
      .then(function(data) {
        res.send(data);
      })
      .catch(function(err) {
        res.send(err);
        console.log(err);
      });
  });

  app.get("/api/city", function(req, res) {
    var slug = req.query.slug;
    var query = {};
    query.query = { "info.city.slug": slug };
    query.projection = {};
    query.sort = {};
    query.limit = {};

    DAO.getSingleCity(query).then(function(data) {
      res.send(data);
    });
  });

  //GUIDES

  app.get("/api/user", userExists, DAO.getUserProfile);

  app
    .route("/api/guides")
    .get(function(req, res) {
      var slug = req.query.slug;
    })
    .post(userExists, function(req, res) {
      if (!req.user) {
        res.send("No user logged in.");
      } else {
        var slug = req.body.slug;
        var user = req.user;
        var cityName = req.body.cityName;
        var bio = req.body.bio;

        DAO.addGuide(user, slug, cityName, bio);

        res.send(req.body);
      }
    })
    .delete(userExists, function(req, res) {
      DAO.removeGuide(req.user, req.body.slug);
      res.send(req.body);
    });

  //CONTACT GUIDES

  app.route("/api/contactguide").post(function(req, res) {
    console.log("trying to do route");
    console.log(req.body);
    DAO.getUserById(req.body.guideId)
      .then(function(data) {
        console.log(data);

        verifyRecaptcha(req.body["googleVerify"], function(success) {
          if (success) {
            //EMAILS
            var recipEmail =
              data.strava.email || data.facebook.email || data.local.email;
            var userEmail =
              req.user.strava.email ||
              req.user.facebook.email ||
              req.user.local.email;

            console.log("tying to get data");
            NodeMailer(
              userEmail,
              recipEmail,
              req.body.subject,
              req.body.info + "<br><br> From " + req.body.name
            )
              .then(function(data) {
                console.log(data);
                res.send({ msg: data, success: true });
              })
              .catch(function(err) {
                console.log(err);
                res.send({ msg: err, success: false });
              });

            // TODO: do registration using params in req.body
          } else {
            res.send({
              msg: "Captcha failed, please try again.",
              success: false
            });
            // TODO: take them back to the previous page
            // and for the love of everyone, restore their inputs
          }
        });
      })
      .catch(function(err) {
        console.log(err);
      });
  });

  //TIPS
  app
    .route("/api/tips")
    .get(function(req, res) {
      var slug = req.query.slug;

      DAO.getTips(slug)
        .then(function(data) {
          res.send(data);
        })
        .catch(function(error) {
          res.send([]);
          console.log(error);
        });
    })
    .post(userExists, function(req, res) {
      console.log(req.body);

      verifyRecaptcha(req.body["googleVerify"], function(success) {
        if (success) {
          var slug = req.body.slug;
          var tip = req.body.tip;
          var activity = req.body.activity;
          var user = req.user;
          DAO.addTip(user, activity, slug, tip)
            .then(function(data) {
              res.send({ msg: data, success: true });
            })
            .catch(function(err) {
              res.send({ msg: err, success: false });
            });

          // TODO: do registration using params in req.body
        } else {
          res.send({
            msg: "Captcha failed, please try again.",
            success: false
          });
          // TODO: take them back to the previous page
          // and for the love of everyone, restore their inputs
        }
      });
    })
    .put(userExists, function(req, res) {
      DAO.editTip(
        req.user,
        req.body.oldTip.activity,
        req.body.oldTip.slug,
        req.body.oldTip.tip,
        req.body.updatedTip
      )
        .then(function(data) {
          res.send("success");
        })
        .catch(function(err) {
          res.send("error");
        });
    })
    .delete(userExists, function(req, res) {
      DAO.deleteTip(req.user, req.body.slug, req.body.tip)
        .then(function(data) {
          res.send(data);
        })
        .catch(function(err) {
          console.log(err);
          res.send(err);
        });
    });

  app
    .route("/api/description")
    .get(function(req, res) {
      var slug = req.query.slug;

      DAO.getDescription(slug).then(function(data) {
        res.send(data);
      });
    })
    .post(function(req, res) {
      var description = req.body.description;
      var slug = req.body.slug;
      var user = "development user";

      DAO.addDescription(slug, description, user);

      res.send("Description updated!");
    });

  //API ROUTES

  //IP LOCATE
  app.get("/api/locateuser", function(req, res) {
    locate(req).then(function(data) {
      res.send(data);
    });
  });

  //FBOOK
  app.get("/api/fbookgroups", function(req, res) {
    //IF USER IS LOGGED IN WITH FBOOK - use their token
    var token;

    if (req.user) {
      if (req.user.facebook) {
        token = req.user.facebook.token;
      }
    }

    fbook(req.query.query, token)
      .then(function(data) {
        res.send(data);
      })
      .catch(function(err) {
        res.send(err);
      });
  });

  //FLICKR
  app.get("/api/flickr", function(req, res) {
    //CHECK IF I HAVE LOCAL PHOTO
    var file =
      process.cwd() + "/public/images/cities/" + req.query.slug + ".jpg";
    fs.stat(file, function(err, stat) {
      if (err == null) {
        res.send({
          img: "/public/images/cities/" + req.query.slug + ".jpg",
          attr: "#"
        });
      } else if (err.code == "ENOENT") {
        flickr(req.query.lat, req.query.long, req.query.city, req.query.country)
          .then(function(img) {
            res.send(img);
          })
          .catch(function(error) {
            console.log(error);
            res.send(error);
          });
      } else {
        console.log("Some other error: ", err.code);
      }
    });
  });

  //4SQ
  app.get("/api/foursquare", function(req, res) {
    fourSquare(req.query.lat, req.query.long)
      .then(function(data) {
        res.send(data);
      })
      .catch(function(err) {
        console.log(err);
        res.send(err);
      });
  });

  //SKYSCAN
  app.get("/api/skyscan", function(req, res) {
    var destination = req.query.destination;
    skyscan("Manchester", destination, "TH", "GBP", "en_US", "2016-05-11").then(
      function(data) {
        console.log(data);
        res.send(data);
      }
    );
  });

  //GOOGLE GEOCODE
  app.get("/api/geocode", function(req, res) {
    geo(req.query.city)
      .then(function(data) {
        res.send(data);
      })
      .catch(function(err) {
        res.send(err);
      });
  });

  //WEATHER
  app.post("/api/weather", function(req, res) {
    var city = req.body;

    var weather = new Weather(
      +city.info.location.latitude,
      +city.info.location.longitude,
      process.env.NCDC_TOKEN
    );

    weather
      .monthlyAverages()
      .then(function(data) {
        console.log(data);
        var weatherObj = {
          station: weather.station,
          elevation: weather.elevation,
          data: weather.fullData
        };

        city.weather = weatherObj;
        city.datasets.weather = true;

        res.json(city);
      })
      .catch(function(err) {
        console.log(err);
        res.send("error");
      });
  });

  //STRAVA SEGMENTS

  app.post("/api/getsegs", function(req, res) {
    var city = {};

    city.info = {};
    city.info.country = {};
    city.info.city = {};
    city.info.location = {};

    city.info.city.name = req.body.city;
    city.info.country.name = req.body.country;
    city.info.location.latitude = +req.body.lat;
    city.info.location.longitude = +req.body.long;

    city.datasets = {};

    var strava = new Strava(
      city.info.location.latitude,
      city.info.location.longitude
    );

    strava
      .singleCity()
      .then(function(data) {
        console.log(data);
        city.running = data[0];
        city.riding = data[1];

        city.datasets.strava = true;
        res.send(city);
      })
      .catch(function(err) {
        console.log(err);
      });

    /*
    	var buildCity = [];

    	buildCity.push(weather.monthlyAverages())
    	buildCity.push(strava.singleCity())

    	Q.all(buildCity).then(function(data) {

    		var weatherData = data[0];
    		var stravaData = data[1];

    		city.running = stravaData[0];
			city.riding = stravaData[1];
			city.datasets.strava = true;

			var weatherObj = {
			station: weather.station,
			elevation: weather.elevation,
			data: weather.fullData
			}

			city.weather = weatherObj;
			city.datasets.weather = true;
			console.log(city)
    		res.send(city)
    	}).catch(function(err) {
    		console.log(err)
    		res.send("error")
    	})
		*/
    /*
    	weather.monthlyAverages().then(function(data) {
	
		var weatherObj = {
			station: weather.station,
			elevation: weather.elevation,
			data: weather.fullData
		}

		city.weather = weatherObj;
		city.datasets.weather = true;

		
		}).catch(function(err) {
			console.log(err)
		})

		
		*/
  });

  //LOGIN / SIGNUP

  //CHECK LIST OF CURRENT USERS
  app.route("/checkuser/:user").get(DAO.getUsers);

  //SITEMAP

  app.get("/sitemap.xml", function(req, res) {
    var query = {};
    query.query = {};
    query.projection = { "info.city": 1 };

    DAO.getAllCities(query).then(function(data) {
      var urls = [];

      data.forEach(function(city) {
        var urlObj = {
          url: "/city/" + city.info.city.slug,
          changefreq: "monthly",
          priority: 0.5
        };

        urls.push(urlObj);
      });

      urls.push({
        url: "/",
        changefreq: "monthly",
        priority: 0.5
      });

      console.log(urls);

      var sitemap = sm.createSitemap({
        hostname: "http://www.nomadworkout.com",
        cacheTime: 600000, // 600 sec - cache purge period
        urls: urls
      });

      sitemap.toXML(function(err, xml) {
        if (err) {
          return res.status(500).end();
        }
        res.header("Content-Type", "application/xml");
        res.send(xml);
      });
    });
  });
};

function safeStringify(obj) {
  return JSON.stringify(obj)
    .replace(/<\/script/g, "<\\/script")
    .replace(/<!--/g, "<\\!--");
}

function verifyRecaptcha(key, callback) {
  https.get(
    "https://www.google.com/recaptcha/api/siteverify?secret=" +
      process.env.CAPTCHA_SECRET_KEY +
      "&response=" +
      key,
    function(res) {
      var data = "";
      res.on("data", function(chunk) {
        data += chunk.toString();
      });
      res.on("end", function() {
        try {
          var parsedData = JSON.parse(data);
          callback(parsedData.success);
        } catch (e) {
          callback(false);
        }
      });
    }
  );
}
