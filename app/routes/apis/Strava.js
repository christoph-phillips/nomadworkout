var Q = require("q");
var request = require("request");
var fs = require("fs");

function Strava(lat, lon) {
  (this.lat = lat),
    (this.lon = lon),
    (this.token = "00a1c0f94967c1bc466773c42fbdfd9844c7597a"),
    (this.singleCity = function() {
      var self = this;

      return self.populateSegments().then(function(data) {
        return self.populateAll();
      });
    }),
    (this.boundary = function() {
      var x1 = this.lat - 0.08;
      var x2 = this.lat + 0.08;
      var y1 = this.lon - 0.08;
      var y2 = this.lon + 0.08;

      var boundary =
        x1.toFixed(3).toString() +
        "," +
        y1.toFixed(3).toString() +
        "," +
        x2.toFixed(3).toString() +
        "," +
        y2.toFixed(3).toString();

      return boundary;
    }),
    (this.populateSegments = function() {
      var deferred = Q.defer();
      var self = this;

      var functions = [];

      functions.push(self.getSegments("running"));
      functions.push(self.getSegments("riding"));

      Q.all(functions)
        .then(function(data) {
          self.running = {
            segments: data[0][0],
            elevation: +data[0][1]
          };

          self.riding = {
            segments: data[1][0],
            elevation: +data[1][1]
          };

          deferred.resolve("success");
        })
        .catch(function(err) {
          console.log(err);
          defer.reject("error");
        });

      return deferred.promise;
    }),
    (this.getSegments = function(activityType) {
      var self = this;
      var deferred = Q.defer();

      request.get(
        {
          headers: {
            Authorization: "Bearer " + self.token
          },
          url:
            "https://www.strava.com/api/v3/segments/explore" +
            "?bounds=" +
            self.boundary() +
            "&activity_type=" +
            activityType
        },
        function(error, response, body) {
          if (error) {
            deferred.reject(err);
          } else {
            body = JSON.parse(body);
            var segments = [];
            var totalEl = 0;

            body.segments.forEach(function(segment) {
              totalEl += segment.elev_difference;
              console.log(segment.elev_difference);
              var segmentObj = {
                id: segment.id,
                name: segment.name,
                points: segment.points
              };
              segments.push(segmentObj);
            });

            deferred.resolve([segments, totalEl.toFixed(0)]);
          }
        }.bind(this)
      );
      return deferred.promise;
    }),
    (this.getSingle = function(id) {
      var self = this;

      var deferred = Q.defer();
      request.get(
        {
          headers: {
            Authorization: "Bearer " + self.token
          },
          url:
            "https://www.strava.com/api/v3/segments/" +
            id +
            "/leaderboard?per_page=100"
        },
        function(error, response, body) {
          if (error) {
            deferred.reject(err);
          } else {
            body = JSON.parse(body);

            if (!body.entries) {
              deferred.reject("TOO MANY API CALLS");
            } else {
              var count = body.entry_count;
              var athletes = [];

              if (body.entries.length > 0) {
                for (var i = 0; i < 5; i++) {
                  var athlete =
                    body.entries[self.random(body.entries.length - 1)];
                  var obj = {
                    id: athlete.athlete_id,
                    name: athlete.athlete_name,
                    pic: athlete.athlete_profile
                  };

                  athletes.push(obj);
                }
              }
            }

            athletes = self.trimAthletes(athletes);

            deferred.resolve({ count: count, athletes: athletes });
          }
        }
      );
      return deferred.promise;
    }),
    (this.getFive = function(activityType) {
      var deferred = Q.defer();
      var self = this;

      var functions = [];

      for (var i = 0; i < 5; i++) {
        if (!this[activityType].segments[i]) {
          continue;
        }
        functions.push(this.getSingle(this[activityType].segments[i].id));
      }

      Q.all(functions).then(function(data) {
        deferred.resolve(data);
      });

      return deferred.promise;
    }),
    (this.populateAll = function() {
      var self = this;
      var deferred = Q.defer();

      var functions = [];

      functions.push(this.getFive("running"));
      functions.push(this.getFive("riding"));

      Q.all(functions)
        .then(function(data) {
          var runnerCount = 0;
          var runners = [];

          data[0].forEach(function(seg) {
            runnerCount += seg.count;
            seg.athletes.forEach(function(athlete) {
              runners.push(athlete);
            });
            delete seg.count;
          });

          self.runnerCount = runnerCount;
          self.runners = runners;

          var riderCount = 0;
          var riders = [];

          data[1].forEach(function(seg) {
            riderCount += seg.count;
            seg.athletes.forEach(function(athlete) {
              riders.push(athlete);
            });
            delete seg.count;
          });

          self.riderCount = riderCount;
          self.riders = riders;

          var running = {
            runnerCount: self.runnerCount,
            runners: self.trimAthletes(self.runners),
            tips: [],
            segments: self.running.segments,
            elevation: self.running.elevation
          };

          var riding = {
            riderCount: self.riderCount,
            riders: self.trimAthletes(self.riders),
            tips: [],
            segments: self.riding.segments,
            elevation: self.riding.elevation
          };

          deferred.resolve([running, riding]);
        })
        .catch(function(err) {
          deferred.reject("fail");
        });

      return deferred.promise;
    }),
    (this.random = function(limit) {
      return Math.floor(Math.random() * limit);
    }),
    (this.trimAthletes = function(athletes) {
      var newArr = [];
      var ids = [];
      athletes.forEach(function(athlete) {
        if (ids.indexOf(athlete.id) < 0) {
          ids.push(athlete.id);
          newArr.push(athlete);
        }
      });

      return newArr;
    });
}

module.exports = Strava;
