var request = require("request");
var fs = require("fs");
var Q = require("q");

function Weather(lat, long, token) {
  (this.lat = lat),
    (this.long = long),
    (this.token = token),
    (this.lookup = {
      DP01: "lowWetDays", //WET DAYS
      DP05: "wetDays", //VERY WET DAYS
      DT32: "Number days with minimum temperature less than or equal to 32.0 F", //COLD DAYS lt 0
      DT90: "hotDays", //HOT DAYS = over 32C
      MNTM: "avgTemp", //avg temp
      TPCP: "totalPrec" //total rain
    }),
    (this.monthlyAverages = function() {
      var deferred = Q.defer();

      var self = this;
      this.getStationId(this.lat, this.long)
        .then(function(data) {
          return self.getYears(data);
        })
        .then(function(data) {
          self.fullData = self.averageYears(data);
          deferred.resolve("success");
        })
        .catch(function(err) {
          console.log(err);
          deferred.reject("error");
        });

      return deferred.promise;
    }),
    (this.getYears = function() {
      var deferred = Q.defer();

      var startDates = [];
      var endDates = [];

      this.years.forEach(function(year) {
        startDates.push(year.toString() + "-01-01");
        endDates.push(year.toString() + "-12-01");
      });

      var id = this.station;

      var getYears = [];

      for (var i = 0; i < 3; i++) {
        getYears.push(
          this.getStationWeather(
            id,
            "GHCNDMS",
            ["DP05", "DT90", "MNTM", "TPCP"],
            startDates[i],
            endDates[i],
            50
          )
        );
      }

      Q.all(getYears)
        .then(function(data) {
          deferred.resolve(data);
          console.log("being called as success");
        })
        .catch(function(err) {
          deferred.reject(err);
          console.log(err);
        });

      return deferred.promise;
    }),
    (this.averageYears = function(data) {
      var year = [];

      for (var i = 0; i < 12; i++) {
        getMonthAverages([data[0][i], data[1][i], data[2][i]]);
      }

      function getMonthAverages(monthsData) {
        var counts = {
          wetCount: 0,
          hotCount: 0,
          precCount: 0,
          tempCount: 0
        };

        var totals = {
          wetCount: 0,
          hotCount: 0,
          precCount: 0,
          tempCount: 0
        };

        monthsData.forEach(function(year) {
          if (year) {
            if (year.hasOwnProperty("wetDays")) {
              counts.wetCount += 1;
              totals.wetCount += year.wetDays;
            }

            if (year.hasOwnProperty("hotDays")) {
              counts.hotCount += 1;
              totals.hotCount += year.hotDays;
            }

            if (year.hasOwnProperty("avgTemp")) {
              counts.tempCount += 1;
              totals.tempCount += year.avgTemp;
            }

            if (year.hasOwnProperty("totalPrec")) {
              counts.precCount += 1;
              totals.precCount += year.totalPrec;
            }
          }
        });

        var month = {
          wetDays: Math.round(totals.wetCount / counts.wetCount),
          hotDays: Math.round(totals.hotCount / counts.hotCount),
          avgTemp: +(totals.tempCount / counts.tempCount).toFixed(1),
          totalPrec: +(totals.precCount / counts.precCount).toFixed(1)
        };

        year.push(month);
      }

      this.fullData = year;
      return year;
    }),
    (this.getStationWeather = function(
      stationId,
      dataset,
      dataTypes,
      startDate,
      endDate,
      limit
    ) {
      var self = this;
      var deferred = Q.defer();

      var url =
        "http://www.ncdc.noaa.gov/cdo-web/api/v2/data?" +
        "datasetid=" +
        dataset +
        "&stationid=" +
        stationId +
        createDataTypes(dataTypes) +
        "&startdate=" +
        startDate +
        "&enddate=" +
        endDate +
        "&limit=" +
        limit +
        "&units=metric";

      request.get(
        {
          url: url,
          headers: { token: token }
        },
        function(error, response, body) {
          if (error) {
            deferred.reject(error);
          } else if (!IsJsonString(body)) {
            console.log("returned xml... unknown error");
            deferred.reject("returned xml... unknown error");
          } else {
            console.log("weather data returned: SUCCESS");
            body = JSON.parse(body);

            if (body.metadata.resultset.count < 48) {
              console.log("incomplete");
              console.log(body.metadata.resultset.count);
            }

            var convertedData = self.convertData(body.results);
            deferred.resolve(convertedData);
          }
        }
      );

      return deferred.promise;
    }),
    (this.getStationId = function(lat, long) {
      var self = this;
      var deferred = Q.defer();

      var url =
        "http://www.ncdc.noaa.gov/cdo-web/api/v2/stations/?sortfield=mindate&datasetid=GHCNDMS&extent=" +
        createBoundary(this.lat, this.long);

      request.get(
        {
          url: url,
          headers: { token: self.token }
        },
        function(error, response, body) {
          if (error) {
            deferred.reject(error);
          }

          body = JSON.parse(body);

          if (body === undefined || isEmpty(body || !body.results)) {
            deferred.reject("no stations returned");
          } else {
            var dataObj = self.returnYears(body);

            if (!dataObj) {
              console.log("KEY IS OUT!");
              deferred.reject("API KEY IS OUT OF LIMITS");
            } else {
              var years = dataObj.years;
              var station = dataObj.station;

              self.station = station.id;
              self.elevation = station.elevation;
              self.years = years;

              deferred.resolve([station, years]);
            }
          }
        }
      );

      return deferred.promise;
    }),
    (this.returnYears = function(data) {
      var stations = data.results;

      if (!stations) {
        return false;
      }

      stations = stations.sort(function(a, b) {
        return new Date(b.maxdate) - new Date(a.maxdate);
      });

      var station = stations[0];

      console.log("chosen station");
      console.log(station);

      var minDate = station.mindate;
      var maxDate = station.maxdate;

      //GET MIN AND MAX YEAR THEN GET THE FULLEST YEAR EITHER SIDE

      var minYear = +minDate.split("-")[0] + 1;
      var maxYear = +maxDate.split("-")[0] - 1;

      var years = [];

      if (maxYear - minYear < 2) {
        console.log("smallrange");
      }

      var year2 = +maxDate.split("-")[0] - 2;
      var year3 = +maxDate.split("-")[0] - 3;

      var years = [maxYear, year2, year3];

      console.log("years chosen");
      console.log(years);

      var dataObj = {
        years: years,
        station: station
      };

      return dataObj;
    }),
    (this.convertData = function(data) {
      var newData = [];

      data.forEach(
        function(singleData) {
          var date = new Date(singleData.date);

          if (!newData[date.getMonth()]) {
            newData[date.getMonth()] = {};
          }

          var type = this.lookup[singleData.datatype];

          newData[date.getMonth()][type] = singleData.value;
        }.bind(this)
      );

      return newData;
    });
}

module.exports = Weather;

//DATA CHECKS

function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) return false;
  }

  return true;
}

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

//DATA FORMATTING
function createDataTypes(dataTypes) {
  var string = "";
  dataTypes.forEach(function(type) {
    string += "&datatypeid=" + type;
  });
  return string;
}

function createBoundary(lat, long) {
  var x1 = lat - 0.5;
  var x2 = lat + 0.5;
  var y1 = long - 0.5;
  var y2 = long + 0.5;

  var boundary =
    x1.toFixed(3).toString() +
    "," +
    y1.toFixed(3).toString() +
    "," +
    x2.toFixed(3).toString() +
    "," +
    y2.toFixed(3).toString();
  return boundary;
}
