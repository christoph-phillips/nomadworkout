(function() {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = "MODULE_NOT_FOUND"), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function(r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t
        );
      }
      return n[i].exports;
    }
    for (
      var u = "function" == typeof require && require, i = 0;
      i < t.length;
      i++
    )
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function(require, module, exports) {
        "use strict";

        function CityMap(el, data, width, height, radius, hoverRadius) {
          (this.destroy = function() {
            var self = this;
            var parent = document.querySelector(el);
            var child = parent.querySelector("SVG");
            parent.removeChild(child);
          }),
            (this.removeData = function() {
              var self = this;

              var mapExists = document.querySelector(".holder");

              if (mapExists) {
                var parent = document.querySelector(".holder");
                var children = parent.querySelectorAll("circle");

                for (var i = 0; i < children.length; i++) {
                  parent.removeChild(children[i]);
                }
              }
            }),
            (this.tooltip = d3
              .select(el)
              .append("div")
              .attr("class", "cities-tooltip")
              .style("opacity", 0)),
            (this.projection = d3.geo
              .mercator()
              .center([0, 0]) //LON (left t0 right) + LAT (up and down)
              .scale(135) //DEFAULT Is 150
              .rotate([0, 0, 0])), //longitude, latitude and roll - if roll not specified - uses 0 - rotates the globe
            (this.appendSvg = function() {
              this.SVG = d3
                .select(el)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .classed("SVG", true);
            }),
            (this.createMap = function() {
              var self = this;

              var projection = this.projection;
              //ADD PROJECTION - center and scale
              //PATH GENERATOR USING PROJECTION
              var path = d3.geo.path().projection(projection);

              // zoom and pan
              var zoom = d3.behavior.zoom().on("zoom", function() {
                self.g.attr(
                  "transform",
                  "translate(" +
                    d3.event.translate.join(",") +
                    ")scale(" +
                    d3.event.scale +
                    ")"
                );
                self.g.selectAll("path").attr("d", path.projection(projection));
              });

              this.SVG.call(zoom);

              //G AS APPENDED SVG
              this.g = this.SVG.append("g").classed("holder", true);

              d3.json(
                "https://cdn.jsdelivr.net/npm/world-atlas@1.1.4/world/110m.json",
                function(json) {
                  self.g
                    .selectAll("path") //act on all path elements
                    .data(
                      topojson.feature(json, json.objects.countries).features
                    ) //get data
                    .enter() //add to dom
                    .append("path")
                    .attr("fill", "#95E1D3")
                    .attr("stroke", "#266D98")
                    .attr("d", path)
                    .classed("map-path", true);

                  self.addData(data);
                  self.addEvents();
                }
              );
            }),
            (this.addData = function(data) {
              var self = this;
              this.circles = this.g
                .selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                  return self.projection([
                    d.info.location.longitude,
                    d.info.location.latitude
                  ])[0];
                })
                .attr("cy", function(d) {
                  return 0;
                })
                .classed("circle", true)
                .attr("r", function(d) {
                  return radius;
                })
                .style("fill", function(d) {
                  return "rgb(58, 193, 98)";
                })
                .style("opacity", "1");

              this.circles
                .transition()
                .duration(1000)
                .attr("cx", function(d) {
                  return self.projection([
                    d.info.location.longitude,
                    d.info.location.latitude
                  ])[0];
                })
                .attr("cy", function(d) {
                  return self.projection([
                    d.info.location.longitude,
                    d.info.location.latitude
                  ])[1];
                });
            }),
            (this.addEvents = function() {
              var self = this;

              //MOUSEOVER
              this.circles.on("mouseover", function(d) {
                d3.select(this)
                  .transition()
                  .duration(600)
                  .attr("r", function(d) {
                    return hoverRadius;
                  });

                self.addLabel(d);
              });

              //MOUSEOUT

              this.circles.on("mouseout", function(d) {
                d3.select(this)
                  .transition()
                  .duration(600)
                  .attr("r", function(d) {
                    return radius;
                  })
                  .style("fill", function(d) {
                    return "rgb(58, 193, 98)";
                  })
                  .style("opacity", "0.8");
              });
            }),
            (this.addLabel = function(d) {
              var mouseCoords = d3.mouse(
                d3.select("circle").node().parentElement
              );

              this.tooltip
                .transition()
                .duration(600)
                .style("opacity", 0.95)
                .style("left", function() {
                  return mouseCoords[0] - 150 + "px";
                })
                .style("top", function() {
                  return mouseCoords[1] + 50 + "px";
                });

              this.tooltip.html(
                "<a href=" +
                  "'/city/" +
                  d.info.city.slug +
                  "'" +
                  "><h4>" +
                  d.info.city.name +
                  ", " +
                  d.info.country.name +
                  "</h4><h4>Runners: " +
                  d.running.runnerCount +
                  "</h4><h4>Riders: " +
                  d.riding.riderCount +
                  "</h4></a>"
              );
            });
        }

        module.exports = CityMap;
      },
      {}
    ],
    2: [
      function(require, module, exports) {
        "use strict";

        var fs = require("fs");

        //var city = JSON.parse(fs.readFileSync("../../data/final/cities.json"))[0]

        //var header = city.info.city.name + ", " + city.info.country.name;
        var cityDetails; //SIZE, POPULATION, WORK DETAILSe.t.c

        //TO ADD -

        module.exports = function cityData(city) {
          (this.city = city),
            (this.monthLookup = [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December"
            ]),
            (this.createDescription = function() {
              var city = this.city;
              var returnString =
                createActivities(city) +
                createTerrain(+city.running.elevation + +city.riding.elevation);
              if (city.weather) {
                returnString += createElevation(city.weather.elevation);
              }

              return returnString;

              function createTerrain(elevationTotal) {
                var string =
                  "The top 10 segments have an elevation gain of " +
                  elevationTotal +
                  "m";
                string +=
                  elevationTotal > 500
                    ? " which means you should get your legs ready for the hills."
                    : " so if you prefer flatter ground you're in!";
                return string;
              }

              function createElevation(elevation) {
                if (elevation) {
                  var string =
                    elevation > 1000
                      ? "The city sits at " +
                        elevation +
                        "m" +
                        " which makes the city great for altitude training."
                      : "";
                  return string;
                } else {
                  return "";
                }
              }

              function createActivities(city) {
                var string =
                  "The city has over " +
                  Math.floor(city.running.runnerCount / 10) * 10 +
                  " runners";
                string +=
                  " and " +
                  Math.floor(city.riding.riderCount / 10) * 10 +
                  " riders.";
                return string;
              }
            }),
            (this.createWeather = function() {
              if (!this.city.weather) {
                return "";
              }

              var wetMonths = false;
              var hotMonths = false;
              var bestMonths = false;

              var weatherStrings = {};

              var data = this.city.weather.data;

              var date = new Date();
              var currentMonth = date.getMonth();

              //CURRENT MONTH DATA
              var current = "";
              data[currentMonth].avgTemp
                ? (current =
                    "This month has an average temperature of " +
                    data[currentMonth].avgTemp +
                    " deg C.")
                : "";

              data[currentMonth].totalPrec
                ? (current +=
                    " Average rainfall is " +
                    data[currentMonth].totalPrec +
                    "mm.")
                : "";
              data[currentMonth].hotDays && data[currentMonth].wetDays
                ? (current +=
                    " On average there are " +
                    data[currentMonth].hotDays +
                    " days when the temperature rises above 32 deg C and " +
                    data[currentMonth].wetDays +
                    " days when it rains heavily.")
                : "";

              //BEST MONTHS, MONTHS TO AVOID
              var rainStatement =
                " You should avoid visiting in " +
                this.convertMonthArray(getWetTimes(data)) +
                " when the rainfall is high. ";
              var tempStatement =
                this.convertMonthPeriod(getWetTimes(data)) +
                " are really hot months.";
              var bestMonths = getBestMonths(data);
              var bestStatement;

              if (bestMonths.length > 9) {
                bestStatement =
                  "The weather is great year round with perfect temperatures and few wet days.";
              } else if (bestMonths.length < 2) {
                bestStatement = "";
              } else {
                bestStatement =
                  " The best months to visit are " +
                  this.convertMonthArray(bestMonths) +
                  " when the temperature is perfect and there are few wet days.";
              }

              var bestMonths;

              weatherStrings.general = "";

              weatherStrings.general += bestMonths ? bestStatement : "";
              //weatherStrings.general += wetMonths ? rainStatement : "";
              //weatherStrings.general += hotMonths ? tempStatement: "";

              weatherStrings.current = current;

              return weatherStrings;

              function getWetTimes(data) {
                var months = [];
                for (var i = 0; i < 12; i++) {
                  if (data[i].totalPrec > 100) {
                    months.push(i);
                    wetMonths = true;
                  }
                }
                return [months[0], months[months.length - 1]];
              }

              function getHotTimes(data) {
                var months = [];
                for (var i = 0; i < 12; i++) {
                  if (data[i].avgTemp > 25) {
                    months.push(i);
                    hotMonths = true;
                  }
                }

                return [months[0], months[months.length - 1]];
              }

              function getBestMonths(data) {
                var months = [];
                for (var i = 0; i < 12; i++) {
                  if (
                    data[i].avgTemp < 25 &&
                    data[i].avgTemp > 10 &&
                    data[i].wetDays < 5
                  ) {
                    months.push(i);
                    bestMonths = true;
                  }
                }

                return months;
              }
            }),
            (this.convertMonthArray = function(monthsArray) {
              var component = this;
              if (!monthsArray) {
                return "";
              }
              var string = "";

              monthsArray.forEach(function(month) {
                string += component.monthLookup[month] + ", ";
              });

              return string;
            }),
            (this.convertMonthPeriod = function(monthsArray) {
              var component = this;
              if (!monthsArray) {
                return "";
              }
              var string =
                component.monthLookup[monthsArray[0]] +
                " to " +
                component.monthLookup[monthsArray[1]];
              return string;
            });
        };

        var bk = {
          info: {
            city: {
              name: "Bangkok",
              url: "/bangkok-thailand",
              slug: "bangkok-thailand"
            },
            country: {
              name: "Thailand",
              url: "/country/thailand",
              slug: "thailand"
            },
            region: {
              name: "Asia",
              url: "/region/asia",
              slug: "asia"
            },
            internet: {
              speed: {
                download: 40
              }
            },
            location: {
              latitude: 13.7278956,
              longitude: 100.5241235
            },
            monthsToVisit: [1, 2, 11, 12],
            wiki: {
              added: true,
              data: {
                name: "Bangkok",
                population_total: "8280925",
                population_as_of: "2010 census",
                elevation: "1.5",
                area: "1568.737"
              }
            }
          },
          scores: {
            nomadScore: 0.54,
            nomad_score: 0.54,
            life_score: 0.96,
            free_wifi_available: 1,
            nightlife: 1,
            leisure: 1,
            places_to_work: 1,
            aircon: 1,
            safety: 0.8,
            friendly_to_foreigners: 1,
            racism: 0.4,
            lgbt_friendly: 0.8,
            female_friendly: 0.8
          },
          cost: {
            local: {
              USD: 703,
              THB: 24908
            },
            nomad: {
              USD: 1417,
              THB: 50226
            },
            expat: {
              USD: 1046,
              THB: 37073
            },
            longTerm: {
              USD: 1046,
              THB: 37073
            },
            shortTerm: {
              USD: 1417,
              THB: 50226
            },
            hotel: {
              THB: 1000,
              USD: 28
            },
            airbnb_median: {
              USD: 26,
              THB: 26
            },
            airbnb_vs_apartment_price_ratio: 1.41804,
            non_alcoholic_drink_in_cafe: {
              THB: 25,
              USD: 0.71
            },
            beer_in_cafe: {
              THB: 75,
              USD: 2.12
            },
            coffee_in_cafe: {
              THB: 75,
              USD: 2.12
            },
            coworking: {
              monthly: {
                THB: 4650,
                USD: 131.17
              }
            },
            exchange_rate: {
              USD: 0.028207949000028
            }
          },
          datasets: {
            weather: true,
            strava: {
              running: true,
              riding: true
            }
          },
          running: {
            runnerCount: 16142,
            segments: [
              {
                id: 4313850,
                name: "Lumpini Park Round",
                points:
                  "cayrAmotdRNh@@TNj@FJD^R`APh@RXBf@CVMTSV?PLv@MNSDy@KI?OEy@DOL[La@Hc@PQP_@N_@h@a@\\STSp@MVEp@F\\GV@JEN@NFZN^\\j@~@`Ab@JTR\\LJPNHn@H\\@r@Ir@QNQLALEPQj@MT@VEfACT?RFr@HLERWp@gARU`@Yh@SPKFSd@q@`@s@Vu@N_AZu@NyAAEJg@RUPKTATKD?j@Hb@SN]RSLU@KRS?SBKAGDMFKS[@QDMLMP{@O_AIKECYEMEKK]KKACCAGHc@MMS@_@Is@GI@UGQ@_A]S@MCACOKM?UNOBaA?YMIKWGe@BKE]Ym@?SCUFi@GKBG?QQGCE@KOq@XOJEHa@BIN]HQAQHS@EB?DT?BCDI@H",
                elevation: 7.4
              },
              {
                id: 876192,
                name: "Lumpini Park",
                points:
                  "qkxrAa}sdRD?BETs@BuANOb@SfAYZMR]j@_Bh@yBDoAIS{@mAk@SaCg@w@KoBAc@IgAIsBGuDe@U?GFYHwARMLUJET?XHp@\\vA^pBb@|AJj@?f@Sj@CVDz@KNWFu@MkA@m@L{@ZaAl@]Za@d@]h@]rA?f@@n@L`AN`@R`@\\\\b@j@n@\\`AZ|AD~@If@Kh@Wn@QtAEp@@`AHZQ`@g@LWd@o@LMxA_AV[Ta@JMd@gAXw@DUNk@",
                elevation: 7.6
              },
              {
                id: 5407996,
                name: "Benjakiti Park loop",
                points:
                  "yxwrAekwdR@e@GUAUD[AQEYGE]Gk@DWFS?a@GYM}@Qw@Ce@M[@kAFyANQAg@LW@w@JkABWBs@VUNMBYO]IkBEMGGAuCRQ@SC}@FSAQB_@PGPElA@VCz@@VCD?JBPBDh@b@TXLH`@CT?jAEtAIZ@ZCjA?HALI`@Gt@@XCj@Hp@?^DTEnAB\\CZM^GP?LH\\@RK\\BZMVFb@?\\BRGb@DVCr@@XATKXBTAFIVQJY@OCgA",
                elevation: 8.9
              },
              {
                id: 1160176,
                name: "สวนเบญจ Track วิ่ง",
                points:
                  "mdyrAylwdRIr@F`CPR^VRVVJXD|@KdACv@If@?d@Gh@?dAQrAIXEj@VJBl@@nDMj@BdAIN@TTN?JCNGjAI^?tAO\\AXFJA\\OPQ@MGeBBc@E}@@_@GYGGYIyADQ@SNOBSWSQu@QiAKgA@i@De@Jg@?e@HMAiAFo@J_AAYJSBy@Oc@Ca@F_@@YJM@}AIcBBm@H}@A[FILIPCR?b@",
                elevation: 8.6
              },
              {
                id: 9796758,
                name: "Run half loop",
                points:
                  "qnxrAiewdR\\?VEh@@r@CTE\\@VCjB?f@Ef@@rCOdA@PCNMFKFUBSAWBOC[BUAw@BWAi@EKAKCEDBMEYCs@AW@g@CKIy@[AEBETEXKQ@SVa@Jm@ES?YKWCY?a@Ha@ASHUBg@Bo@?wDXi@NKCG?OK[CoBL",
                elevation: 8.9
              },
              {
                id: 7375175,
                name: "Thephasadin Track 400m",
                points:
                  "iq{rAwiqdREGWGuAIcAK]@UJSVEHCP?j@HJ^Lh@Ht@Fd@Nh@FJAZIb@gA@IG[OO",
                elevation: 6.6
              },
              {
                id: 2513869,
                name: "Rama III Park",
                points:
                  "g`prAypodR^TPRJTBd@APMZQTQ@K?o@SK@QFKNUd@[f@ET@HHLFFVJLR@LKn@?PJTVTVFZEXWHQDYHURYP_@b@i@JYFg@W_ABSPk@AWAI_Ay@O[UWG?[XCJFL",
                elevation: 11.4
              },
              {
                id: 2780695,
                name: "Sanamluang BKK CCW",
                points:
                  "e|}rAixjdRkARYRQXYv@?^XbAZd@bAJfAn@j@JXNlABlA^`@^j@Tn@HTNv@FZC\\@jAZv@\\\\B^@\\KXC^UTWNWNs@F}@E_@o@kAQWIIw@Si@AaBe@yAMeBa@_@AgAYmAQ{@IqAWq@Gc@L",
                elevation: 13
              },
              {
                id: 6547018,
                name: "Santiphap Park Lap",
                points:
                  "{p~rAcusdRYBOHMCg@]a@O_@[OUKISGkAWe@U_A[gAo@_@IOGIUIq@@WLKB?FHf@XT\\RDBATFVAJJRFb@TFHRLNRXPTH|@CZJPT\\RCL@TDHf@PFFANIT",
                elevation: 3.4
              },
              {
                id: 7420057,
                name: "Sathon Road",
                points:
                  "wnvrAaxodRCe@YqBMc@Eg@?i@Ic@D[?g@Ui@q@gAg@sCEg@s@qCKe@Eg@s@sCc@uCO_@KmAo@yCGg@Ag@Ge@c@gA_@gAGe@c@}AIe@Mc@Ig@DeAKI?k@QK@e@ESKqAf@}@@g@Qa@a@Og@]EQFc@Oc@Gi@Qc@Qa@Me@Sa@m@oBCc@Bm@i@kB[]Oc@cAkGaAyDOmAWc@s@yDGg@IQIg@Bk@Cg@Oc@Ua@Qe@Oe@Ig@Gc@XsAQa@Wa@Ee@Bg@Oc@Sa@Mc@a@eAMO]iAQkAU]Oa@_@a@",
                elevation: 28.7
              }
            ],
            runners: [
              {
                id: 2899102,
                name: "Ivan Vlasenko",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/2899102/925869/2/large.jpg"
              },
              {
                id: 254600,
                name: "Durianrider VEGAN POWER! เจ",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/254600/72046/2/large.jpg"
              },
              {
                id: 5481546,
                name: "Jaume Bartés Creus",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/5481546/1738725/2/large.jpg"
              },
              {
                id: 5188947,
                name: "Marc Lozano",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/5188947/2153224/4/large.jpg"
              },
              {
                id: 8394478,
                name: "Joao Luppi",
                pic: "avatar/athlete/large.png"
              },
              {
                id: 3569951,
                name: "野永 健宏",
                pic: "avatar/athlete/large.png"
              },
              {
                id: 7947760,
                name: "Henrik Nøkleby",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/7947760/2423031/2/large.jpg"
              },
              {
                id: 13414377,
                name: "Craig Sauers",
                pic:
                  "https://graph.facebook.com/v2.1/10100105653880792/picture?height=256&width=256"
              },
              {
                id: 5738458,
                name: "Randy Travis",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/5738458/1841731/1/large.jpg"
              },
              {
                id: 1692029,
                name: "Anthony Arrowsmith",
                pic:
                  "https://graph.facebook.com/v2.1/701239313/picture?height=256&width=256"
              },
              {
                id: 352686,
                name: "C M Beilby",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/352686/71456/4/large.jpg"
              },
              {
                id: 3645994,
                name: "landry dunand",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/3645994/1243584/2/large.jpg"
              },
              {
                id: 12582183,
                name: "Mikkel Bjergsø",
                pic:
                  "https://graph.facebook.com/v2.1/10152356479698433/picture?height=256&width=256"
              },
              {
                id: 4034273,
                name: "Harry Jones  Ⓥ เจ ",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/4034273/1320235/2/large.jpg"
              },
              {
                id: 1936851,
                name: "vegard høiseth Ⓥ เจ",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/1936851/1880343/2/large.jpg"
              },
              {
                id: 3322143,
                name: "Peter Donahoe",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/3322143/1140732/1/large.jpg"
              },
              {
                id: 9446840,
                name: "Patrick Carey",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/9446840/2937948/2/large.jpg"
              },
              {
                id: 4675823,
                name: "Christophe Nocher",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/4675823/1480913/2/large.jpg"
              },
              {
                id: 8010101,
                name: "Jeremy Verstraete",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/8010101/2984036/1/large.jpg"
              }
            ],
            tips: [],
            elevation: "105"
          },
          riding: {
            riderCount: 11315,
            segments: [
              {
                id: 893495,
                name: "Benjakiti Park 1 Lap",
                points:
                  "kdyrAymwdRU?{@JJVFDNBFIAU@QJQHCPAtAk@vA]b@Aj@FdANBBXMFGhACb@Jn@JVQf@Kp@B~BIh@Cx@MfAIhCYp@?L@`@ZVHh@JrALTDLFDJ@RLpCA`AC^KVSLmAL]BgATaAFy@Hs@B{@Cg@DcA@UCoBP[?SSc@Ya@Ae@D}@Zm@PU?]Gc@CgABUBuA@yALk@ISUESEaA@a@Ee@AiAFK@]BQ",
                elevation: 8.3
              },
              {
                id: 10683347,
                name: "Klongtom Sprint",
                points: "}`{rAofmdRm@h@gAn@_B`Bq@jAoAtCAH",
                elevation: 3
              },
              {
                id: 8679800,
                name: "ลานพระรูปสปรินท์1",
                points: "{|}rAcbmdRwIaDqC}@",
                elevation: 4.2
              },
              {
                id: 6573415,
                name: "Pinklao Bridge Climb",
                points:
                  "aa~rAexjdRgA~@QXk@Zu@l@uAtAo@b@oAdAMFkCjBg@X_@\\eBlAs@l@a@Vq@j@wA|@e@b@qBtA",
                elevation: 16.2
              },
              {
                id: 10134442,
                name: "Embassy Sprint!!",
                points: "qovrAy{odRyAeHgFkX",
                elevation: 2.4
              },
              {
                id: 8762351,
                name: "ฺBangkok Bridge Climb : West to East",
                points: "wisrAqwidRRUx@wA~CsGvDkH",
                elevation: 8.8
              },
              {
                id: 10152861,
                name: "พระที่นั่งอนันตสมาคม-พระบรมรูป",
                points:
                  "q|`sAeundR?G`@eARW^[\\M^EJAl@FhA\\jBp@`@XPXPh@B\\Ez@i@bBCTBPTXRNjAf@`@LVLVFb@T",
                elevation: 5.8
              },
              {
                id: 3545797,
                name: "ThaiBelgium - Sarasin",
                points:
                  "kaxrA{rtdRg@Ki@AuAKo@O}K_Ao@Im@OwAMo@Co@Km@CkGq@y@@c@Ec@A",
                elevation: 7.8
              },
              {
                id: 10683226,
                name: "Hua Chang Inbound",
                points: "{q|rAiardR`D`@|Cd@tEd@",
                elevation: 4.2
              },
              {
                id: 8444731,
                name: "Klong Toey to Lumpini",
                points: "evvrAwlwdRANiApEiAbDiH|U]hABBWz@Ov@oGjRcKn\\",
                elevation: 3
              }
            ],
            riders: [
              {
                id: 412646,
                name: "Bryce Benat",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/412646/298649/1/large.jpg"
              },
              {
                id: 461004,
                name: "Joakim Persson",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/461004/99242/2/large.jpg"
              },
              {
                id: 9870969,
                name: "Eric F",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/9870969/2978679/3/large.jpg"
              },
              {
                id: 3652941,
                name: "Rafał Mołda",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/3652941/1718726/6/large.jpg"
              },
              {
                id: 1792679,
                name: "TheDoctor Pittayakorn",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/1792679/513756/1/large.jpg"
              },
              {
                id: 258002,
                name: "Hamish Keith",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/258002/51630/1/large.jpg"
              },
              {
                id: 3639271,
                name: "Retdech Chaimanee",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/3639271/1174518/3/large.jpg"
              },
              {
                id: 3514524,
                name: "Chiratas Jim",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/3514524/1258800/8/large.jpg"
              },
              {
                id: 3198302,
                name: "Philippe Roquiny",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/3198302/1086250/1/large.jpg"
              },
              {
                id: 1355381,
                name: "Noo Pongdech Namjunluck",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/1355381/767735/1/large.jpg"
              },
              {
                id: 4942500,
                name: "Sathon Sunthanakul",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/4942500/1806449/1/large.jpg"
              },
              {
                id: 7441488,
                name: "Taddy Nunok",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/7441488/2829146/1/large.jpg"
              },
              {
                id: 2103201,
                name: "Aoh Thisaphak",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/2103201/634642/1/large.jpg"
              },
              {
                id: 4141412,
                name: "Stanant Krutbhichet",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/4141412/1354430/4/large.jpg"
              },
              {
                id: 3022526,
                name: "NOng Supanich",
                pic:
                  "https://graph.facebook.com/v2.1/639546867/picture?height=256&width=256"
              },
              {
                id: 7605399,
                name: "[FFM] Sitthipyhum Naruephankulchai",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/7605399/2300488/3/large.jpg"
              },
              {
                id: 4574365,
                name: "FFM Arithats",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/4574365/1449548/3/large.jpg"
              },
              {
                id: 3408008,
                name: "keaw buachan",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/3408008/1096392/2/large.jpg"
              },
              {
                id: 3399429,
                name: "Tle Tossavorn",
                pic:
                  "https://dgalywyr863hv.cloudfront.net/pictures/athletes/3399429/1108442/1/large.jpg"
              }
            ],
            tips: [],
            elevation: "64"
          },
          weather: {
            station: "GHCND:TH000048456",
            elevation: 12,
            data: [
              {
                wetDays: 2,
                hotDays: 8,
                avgTemp: 26.2,
                totalPrec: 53.3
              },
              {
                wetDays: 0,
                hotDays: 11,
                avgTemp: 28.7,
                totalPrec: 5.1
              },
              {
                wetDays: 1,
                hotDays: 15,
                avgTemp: 30.4,
                totalPrec: 70.5
              },
              {
                wetDays: 2,
                hotDays: 17,
                avgTemp: 31.3,
                totalPrec: 71.7
              },
              {
                wetDays: 3,
                hotDays: 16,
                avgTemp: 31.8,
                totalPrec: 105.5
              },
              {
                wetDays: 6,
                hotDays: 11,
                avgTemp: 30.7,
                totalPrec: 224.8
              },
              {
                wetDays: 3,
                hotDays: 13,
                avgTemp: 30.5,
                totalPrec: 105.1
              },
              {
                wetDays: 4,
                hotDays: 13,
                avgTemp: 29.5,
                totalPrec: 163.5
              },
              {
                wetDays: 8,
                hotDays: 9,
                avgTemp: 29.4,
                totalPrec: 328.1
              },
              {
                wetDays: 5,
                hotDays: 12,
                avgTemp: 28.8,
                totalPrec: 203.7
              },
              {
                wetDays: 2,
                hotDays: 10,
                avgTemp: 29.4,
                totalPrec: 49
              },
              {
                wetDays: 0,
                hotDays: 6,
                avgTemp: 26.5,
                totalPrec: 6.3
              }
            ]
          }
        };
      },
      { fs: 57 }
    ],
    3: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var City = require("./City.js");

          var Cities = React.createClass({
            displayName: "Cities",

            render: function render() {
              return React.createElement(
                "div",
                { style: this.props.show, id: "cities-holder" },
                React.createElement(
                  "div",
                  { className: "row" },
                  this.props.cities.length === 0
                    ? React.createElement(
                        "h3",
                        null,
                        " No Cities Found, Try A Different Search "
                      )
                    : null,
                  this.props.cities.map(function(city) {
                    return React.createElement(City, {
                      key: city._id,
                      data: city
                    });
                  })
                )
              );
            }
          });

          module.exports = Cities;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./City.js": 4 }
    ],
    4: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var CityImage = require("./CityImage.js");

          var Main = React.createClass({
            displayName: "Main",

            getInitialState: function getInitialState() {
              return {
                img: "",
                style: {}
              };
            },

            componentDidMount: function componentDidMount() {
              //SET SOME STATE

              var state = {
                city: this.props.data.info.city.name,
                country: this.props.data.info.country.name,
                runners: this.props.data.running.runnerCount,
                riders: this.props.data.riding.riderCount,
                hovered: false,
                class: "city-image"
              };

              this.setState(state);

              //GET IMAGE
              var component = this;
              var url = "/api/flickr";
              var query = {};
              query.lat = this.props.data.info.location.latitude;
              query.long = this.props.data.info.location.longitude;
              query.city = this.props.data.info.city.name;
              query.country = this.props.data.info.country.name;

              $.get(url, query, function(data) {
                component.setState({ img: data.img, attr: data.attr });

                //SET ORIGINAL STYLE
                var src = component.state.img;
                var style = {
                  backgroundImage: "url(" + src + ")",
                  backgroundPosition: "center center",
                  opacity: 1
                };

                component.setState({ style: style });
              });
            },

            onEnter: function onEnter() {
              var component = this;
              var src = component.state.img;

              var style = {
                backgroundImage: "url(" + src + ")",
                backgroundPosition: "",
                opacity: 1
              };

              this.setState({ hovered: true, style: style });

              var runnerInterval;
              var riderInterval;

              //RUNNER STATS
              var runners = this.state.runners;
              var runnerCount = 0;
              //var runnerSpeed = (1 / runners) * 100000;
              runnerInterval = setInterval(function() {
                runnerCount += 200;
                component.setState({ runners: runnerCount });

                if (runnerCount >= runners) {
                  clearInterval(runnerInterval);
                }
              }, 2);

              this.setState({ runnerInterval: runnerInterval });

              //RIDER STATS
              var riders = this.state.riders;
              var riderCount = 0;
              //var riderSpeed = (1 / riders) * 100000;
              riderInterval = setInterval(function() {
                riderCount += 200;
                component.setState({ riders: riderCount });

                if (riderCount >= riders) {
                  clearInterval(riderInterval);
                }
              }, 2);

              this.setState({ riderInterval: riderInterval });
            },

            onLeave: function onLeave() {
              this.setState({
                runners: this.props.data.running.runnerCount,
                riders: this.props.data.riding.riderCount
              });

              var runnerInterval = this.state.runnerInterval;
              clearInterval(runnerInterval);

              var riderInterval = this.state.riderInterval;
              clearInterval(riderInterval);

              var component = this;
              var src = component.state.img;
              var style = {
                backgroundImage: "url(" + src + ")",
                backgroundPosition: "center center",
                opacity: 1
              };

              this.setState({ hovered: false, style: style });
            },

            render: function render() {
              var url = "/city/" + this.props.data.info.city.slug;

              return React.createElement(
                "div",
                {
                  onMouseEnter: this.onEnter,
                  onMouseLeave: this.onLeave,
                  className: "city col-lg-3 col-sm-4 col-ms-6 col-xs-12 "
                },
                React.createElement(
                  "a",
                  { href: url },
                  React.createElement(
                    "div",
                    { style: this.state.style, className: "city-image" },
                    React.createElement(
                      "div",
                      { className: "city-data" },
                      React.createElement(
                        "div",
                        { className: "title" },
                        React.createElement(
                          "h4",
                          null,
                          " ",
                          this.state.city,
                          ", ",
                          this.state.country,
                          " "
                        )
                      ),
                      React.createElement(
                        "div",
                        { className: "details" },
                        React.createElement(
                          "h4",
                          null,
                          " Runners: ",
                          this.state.runners,
                          " "
                        ),
                        React.createElement(
                          "h4",
                          null,
                          " Riders: ",
                          this.state.riders,
                          " "
                        )
                      )
                    )
                  )
                )
              );
            }
          });

          module.exports = Main;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./CityImage.js": 5 }
    ],
    5: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var CityImage = React.createClass({
            displayName: "CityImage",

            getInitialState: function getInitialState() {
              return {
                img: ""
              };
            },

            componentDidMount: function componentDidMount() {
              var component = this;
              var url = "/api/flickr";
              var query = {};
              query.lat = this.props.city.location.latitude;
              query.long = this.props.city.location.longitude;
              query.city = this.props.city.city.name;

              $.get(url, query, function(data) {
                component.setState({ img: data });
              });
            },

            render: function render() {
              if (this.props.type === "front") {
                var style = {
                  position: "absolute",
                  maxWidth: "100%",
                  clip: "rect(0px,200px,200px,0px)",
                  Zindex: "0"
                };
              } else {
                var style = {
                  maxWidth: "100%",
                  Zindex: "0",
                  float: "right"
                };
              }

              return React.createElement(
                "div",
                null,
                React.createElement("img", {
                  style: style,
                  src: this.state.img
                })
              );
            }
          });

          module.exports = CityImage;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    6: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Cities = require("./Cities.js");

          var Temp = require("./filter/Temp.js");
          var Hotel = require("./filter/Hotel.js");
          var Terrain = require("./filter/Terrain.js");
          var Month = require("./filter/Month.js");
          var Continent = require("./filter/Continent.js");
          var Sort = require("./filter/Sort.js");
          var Altitude = require("./filter/Altitude.js");
          var Rain = require("./filter/Rain.js");

          var Filter = React.createClass({
            displayName: "Filter",

            getInitialState: function getInitialState() {
              var date = new Date();
              var month = date.getMonth();

              var defaultStyle = {
                backgroundColor: "#F8F8F8",
                color: "rgb(58, 193, 98)"
              };

              var selectedStyle = {
                backgroundColor: "rgb(58, 193, 98)",
                color: "white"
              };

              return {
                continent: "",
                defaultStyle: defaultStyle,
                selectedStyle: selectedStyle,
                month: month,
                minHotelCost: 0,
                maxHotelCost: 150,
                limit: 20,
                maxRain: 30
              };
            },

            updateHotel: function updateHotel(data) {
              this.setState(data);
            },

            updateSort: function updateSort(data) {
              console.log(data);
              this.setState(data);
            },

            filter: function filter() {
              var component = this;
              var query = {
                minHotelCost: this.state.minHotelCost,
                maxHotelCost: this.state.maxHotelCost,
                sortBy: this.state.sortBy,
                month: this.state.month,
                temp: this.state.temp,
                terrain: this.state.terrain,
                continent: this.state.continent,
                alt: this.state.alt,
                limit: this.state.limit
              };

              console.log(query);

              var url = "/api/cities";

              $.get(url, query, function(data) {
                component.props.updateCities(data);
              });
            },

            updateTemp: function updateTemp(data) {
              this.setState(data);
            },

            updateRain: function updateRain(data) {
              this.setState(data);
            },

            selectMonth: function selectMonth(data) {
              this.setState(data);
            },

            setTerrain: function setTerrain(e) {
              this.setState({ terrain: e.target.value });
            },

            updateTerrain: function updateTerrain(data) {
              this.setState(data);
            },

            updateAlt: function updateAlt(data) {
              this.setState(data);
            },

            selectContinent: function selectContinent(data) {
              this.setState(data);
            },

            componentDidMount: function componentDidMount() {
              var component = this;

              if (!("ontouchstart" in window)) {
                $("button").tooltip();
              }

              //INFINITE SCROLL

              $(document).ready(function() {
                var win = $(window);

                // Each time the user scrolls
                win.scroll(function() {
                  // End of the document reached?
                  if ($(document).height() - win.height() == win.scrollTop()) {
                    component.setState({ limit: component.state.limit + 10 });
                    component.filter();
                  }
                });
              });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  { className: "row filter-holder" },
                  React.createElement(
                    "div",
                    {
                      className:
                        "filter-section filter-hotel filter-sort col-lg-4 col-sm-4 col-ms-6 col-xs-12"
                    },
                    React.createElement(Hotel, {
                      minCost: this.state.minHotelCost,
                      maxCost: this.state.maxHotelCost,
                      updateHotel: this.updateHotel
                    }),
                    React.createElement(Sort, {
                      defaultStyle: this.state.defaultStyle,
                      selectedStyle: this.state.selectedStyle,
                      updateFilter: this.updateSort,
                      sortBy: this.state.sortBy
                    })
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "filter-section filter-temp col-lg-4 col-sm-4 col-ms-6 col-xs-12"
                    },
                    React.createElement(Temp, {
                      defaultStyle: this.state.defaultStyle,
                      selectedStyle: this.state.selectedStyle,
                      updateFilter: this.updateTemp,
                      temp: this.state.temp
                    })
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "filter-section filter-rain col-lg-4 col-sm-4 col-ms-6 col-xs-12"
                    },
                    React.createElement(Rain, {
                      updateRain: this.updateRain,
                      maxRain: this.state.maxRain
                    })
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "filter-section filter-terrain col-lg-4 col-sm-4 col-ms-6 col-xs-12"
                    },
                    React.createElement(Terrain, {
                      defaultStyle: this.state.defaultStyle,
                      selectedStyle: this.state.selectedStyle,
                      updateFilter: this.updateTerrain,
                      terrain: this.state.terrain
                    })
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "filter-section filter-altitude col-lg-4 col-sm-4 col-ms-6 col-xs-12"
                    },
                    React.createElement(Altitude, {
                      defaultStyle: this.state.defaultStyle,
                      selectedStyle: this.state.selectedStyle,
                      updateFilter: this.updateAlt,
                      alt: this.state.alt
                    })
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "filter-section filter-month col-lg-4 col-sm-4 col-ms-6 col-xs-12"
                    },
                    React.createElement(Month, {
                      selectMonth: this.selectMonth,
                      month: this.state.month
                    })
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "filter-section filter-continent col-lg-4 col-sm-4 col-ms-6 col-xs-12"
                    },
                    React.createElement(Continent, {
                      selectContinent: this.selectContinent
                    })
                  )
                ),
                React.createElement(
                  "button",
                  { className: "btn btn-filter-send", onClick: this.filter },
                  "Filter"
                )
              );
            }
          });

          module.exports = Filter;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {
        "./Cities.js": 3,
        "./filter/Altitude.js": 21,
        "./filter/Continent.js": 22,
        "./filter/Hotel.js": 23,
        "./filter/Month.js": 24,
        "./filter/Rain.js": 25,
        "./filter/Sort.js": 26,
        "./filter/Temp.js": 27,
        "./filter/Terrain.js": 28
      }
    ],
    7: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var LoginModal = require("./Login.js");
          var SignupModal = require("./Signup.js");
          var AddCityModal = require("./addcity/AddCityModal.js");
          var IntroText = require("./IntroText.js");
          var Overview = require("./single/Overview.js");
          var SearchBox = require("./search-box/SearchBox.js");

          var Header = React.createClass({
            displayName: "Header",

            getInitialState: function getInitialState() {
              return {
                showSignupModal: false,
                showLoginModal: false,
                addCityModal: false,
                attr: ""
              };
            },

            componentDidMount: function componentDidMount() {
              var component = this;

              window.addEventListener("showLogin", function() {
                component.setState({ showLoginModal: true });
              });

              if (this.props.type === "single") {
                //IMAGE

                var url = "/api/flickr";
                var query = {};
                query.lat = this.props.data.info.location.latitude;
                query.long = this.props.data.info.location.longitude;
                query.city = this.props.data.info.city.name;
                query.country = this.props.data.info.country.name;
                query.slug = this.props.data.info.city.slug;

                $.get(url, query, function(data) {
                  component.setState({ img: data.img, attr: data.attr });
                  var style = {
                    backgroundImage:
                      "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(" +
                      data.img +
                      ")"
                  };

                  component.setState({ style: style });
                });
              }
            },

            showLoginModal: function showLoginModal() {
              this.setState({ showLoginModal: true });
            },

            hideLoginModal: function hideLoginModal() {
              this.setState({ showLoginModal: false });
            },

            showSignupModal: function showSignupModal() {
              this.setState({ showSignupModal: true });
            },

            hideSignupModal: function hideSignupModal() {
              this.setState({ showSignupModal: false });
            },

            showAddCityModal: function showAddCityModal() {
              this.setState({ showAddCityModal: true });
            },

            hideAddCityModal: function hideAddCityModal() {
              this.setState({ showAddCityModal: false });
            },

            changeModal: function changeModal() {
              this.setState({ showLoginModal: false });
              this.setState({ showSignupModal: true });
            },

            render: function render() {
              if (this.props.type === "front") {
                var headerStyle = {
                  backgroundImage:
                    "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/public/images/header.jpg)"
                };
              } else {
                var headerStyle = this.state.style;
              }

              return React.createElement(
                "div",
                { className: "header-holder" },
                React.createElement(
                  "div",
                  { className: "header-full", style: headerStyle },
                  React.createElement(
                    "div",
                    { className: "navigation-holder" },
                    React.createElement(
                      "div",
                      { className: "navbar-header" },
                      React.createElement(
                        "button",
                        {
                          type: "button",
                          className: "navbar-toggle collapsed",
                          "data-toggle": "collapse",
                          "data-target": "#navbar",
                          "aria-expanded": "false",
                          "aria-controls": "navbar"
                        },
                        React.createElement(
                          "span",
                          { className: "sr-only" },
                          "Toggle navigation"
                        ),
                        React.createElement("span", { className: "icon-bar" }),
                        React.createElement("span", { className: "icon-bar" }),
                        React.createElement("span", { className: "icon-bar" })
                      ),
                      React.createElement(
                        "a",
                        { className: "navbar-brand", href: "/" },
                        "NomadWorkout"
                      )
                    ),
                    React.createElement(
                      "div",
                      {
                        id: "navbar",
                        className: "navbar-collapse collapse",
                        "aria-expanded": "false"
                      },
                      React.createElement("ul", {
                        className: "nav navbar-nav"
                      }),
                      React.createElement(
                        "ul",
                        { className: "nav navbar-nav navbar-right" },
                        React.createElement(
                          "li",
                          null,
                          React.createElement("a", { href: "/" }, "Home")
                        ),
                        React.createElement(
                          "li",
                          null,
                          React.createElement(
                            "a",
                            { href: "#", onClick: this.showSignupModal },
                            "Sign Up"
                          )
                        ),
                        React.createElement(
                          "li",
                          null,
                          React.createElement(
                            "a",
                            { href: "#", onClick: this.showLoginModal },
                            "Login"
                          )
                        )
                      )
                    )
                  ),
                  this.props.type === "front"
                    ? React.createElement(
                        "div",
                        { className: "header-intro-search" },
                        React.createElement(IntroText, null),
                        React.createElement(SearchBox, null)
                      )
                    : React.createElement(
                        "div",
                        { className: "single-header-text-holder" },
                        React.createElement(
                          "h3",
                          { className: "single-header-text" },
                          " ",
                          this.props.data.info.city.name,
                          ", ",
                          this.props.data.info.country.name,
                          " "
                        ),
                        React.createElement(Overview, {
                          data: this.props.data
                        }),
                        React.createElement(
                          "a",
                          {
                            target: "_blank",
                            className: "img-attribution",
                            href: this.state.attr
                          },
                          "Image Author"
                        )
                      ),
                  React.createElement(LoginModal, {
                    changeModal: this.changeModal,
                    showMessage: this.state.showLoginModal,
                    hideMessage: this.hideLoginModal
                  }),
                  React.createElement(SignupModal, {
                    showMessage: this.state.showSignupModal,
                    hideMessage: this.hideSignupModal
                  }),
                  React.createElement(AddCityModal, {
                    showMessage: this.state.showAddCityModal,
                    hideMessage: this.hideAddCityModal
                  })
                )
              );
            }
          });

          module.exports = Header;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {
        "./IntroText.js": 8,
        "./Login.js": 9,
        "./Signup.js": 12,
        "./addcity/AddCityModal.js": 16,
        "./search-box/SearchBox.js": 35,
        "./single/Overview.js": 47
      }
    ],
    8: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var IntroText = React.createClass({
            displayName: "IntroText",

            getInitialState: function getInitialState() {
              return {
                text: ""
              };
            },

            componentDidMount: function componentDidMount() {
              var cities = [
                "Amsterdam",
                "New York",
                "Medellin",
                "my dream destination."
              ];

              var component = this;
              var string = "I want to run in " + cities[0];
              var length = string.length;

              var textInterval;

              //STARTS IT OFF
              goForwards(0);

              function goForwards(count) {
                length = string.length;

                textInterval = setInterval(function() {
                  count += 1;
                  component.setState({ text: string.substr(0, count) });

                  if (component.state.text.substr(-3, 3) === "run") {
                    clearInterval(textInterval);
                    goBackwards(3, cities[0]);
                  }

                  for (var i = 0; i < cities.length - 1; i++) {
                    changeCity(i);
                  }

                  if (count === length) {
                    clearInterval(textInterval);
                  }
                }, 100);
              }

              function goBackwards(limit, newCity) {
                var length = component.state.text.length;
                var count = length;
                var backInterval = setInterval(function() {
                  count -= 1;
                  component.setState({ text: string.substr(0, count) });

                  if (count === length - limit) {
                    clearInterval(backInterval);
                    if (newCity) {
                      string = "I want to ride in " + newCity;
                      goForwards(count);
                    }
                  }
                }, 200);
              }

              //FUNCTION TO DECLARE WHEN TO GO TO NEXT CITY
              function changeCity(i) {
                if (
                  component.state.text.substr(
                    0 - cities[i].length,
                    cities[i].length
                  ) === cities[i]
                ) {
                  clearInterval(textInterval);
                  goBackwards(cities[i].length, cities[i + 1]);
                }
              }
            },

            render: function render() {
              return React.createElement(
                "div",
                { className: "intro-text" },
                React.createElement("h1", null, " NomadWorkout "),
                React.createElement("h3", null, this.state.text)
              );
            }
          });

          module.exports = IntroText;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    9: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var ReactBootstrap =
            typeof window !== "undefined"
              ? window["ReactBootstrap"]
              : typeof global !== "undefined"
              ? global["ReactBootstrap"]
              : null;

          var Modal = ReactBootstrap.Modal;
          var Button = ReactBootstrap.Button;

          var LoginModal = React.createClass({
            displayName: "LoginModal",

            getInitialState: function getInitialState() {
              return {
                userOK: false,
                passwordOK: false
              };
            },

            componentDidMount: function componentDidMount() {
              this.setState({
                stravaDirect:
                  "/auth/strava?redirect=" + window.location.pathname,
                facebookDirect:
                  "/auth/facebook?redirect=" + window.location.pathname
              });
            },

            sendForm: function sendForm() {
              var component = this;
              //MAKE PARAMS HERE
              var url = "/login";

              var username = this.state.user;
              var password = this.state.password;
              var params = "username=" + username + "&password=" + password;

              $.post(url, params, function(data) {
                if (data.failure) {
                  component.setState({ errorMessage: data.message });
                } else {
                  window.location.replace(window.location.pathname);
                }
              });
            },

            addUser: function addUser(e) {
              var user = e.target.value;
              this.setState({ user: user });
            },

            addPassword: function addPassword(e) {
              var password = e.target.value;
              this.setState({ password: password });
            },

            createErrorMarkup: function createErrorMarkup(data) {
              if (!data) {
                return null;
              }
              return {
                __html:
                  '<div class="alert alert-' + "danger" + '">' + data + "</div>"
              };
            },

            render: function render() {
              var inline = {
                display: "inline"
              };

              var center = {
                textAlign: "center"
              };

              var image = {
                width: "100px",
                height: "100px"
              };

              var form = {
                textAlign: "center"
              };

              return React.createElement(
                "div",
                null,
                React.createElement(
                  Modal,
                  {
                    style: center,
                    show: this.props.showMessage,
                    onHide: this.props.hideMessage
                  },
                  React.createElement(
                    Modal.Body,
                    { style: center },
                    React.createElement("h2", null, " Log In "),
                    React.createElement(
                      "div",
                      { className: "signup-container" },
                      React.createElement(
                        "a",
                        {
                          style: { color: "white" },
                          className: "btn btn-social btn-facebook",
                          href: this.state.facebookDirect
                        },
                        React.createElement("span", {
                          className: "fa fa-facebook"
                        }),
                        " Login with Facebook"
                      ),
                      React.createElement(
                        "a",
                        {
                          className: "btn-strava",
                          href: this.state.stravaDirect
                        },
                        React.createElement("img", {
                          src: "/public/images/strava-login.png"
                        })
                      ),
                      React.createElement(
                        "h4",
                        { className: "form-element" },
                        " Or Login With Email "
                      ),
                      React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement("label", null, "Email"),
                        React.createElement("input", {
                          onKeyUp: this.addUser,
                          type: "text",
                          className: "form-control",
                          name: "username"
                        })
                      ),
                      React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement("label", null, "Password"),
                        React.createElement("input", {
                          onKeyUp: this.addPassword,
                          type: "password",
                          className: "form-control",
                          name: "password"
                        })
                      ),
                      React.createElement(
                        "button",
                        {
                          type: "submit",
                          onClick: this.sendForm,
                          className: "btn btn-primary btn-block"
                        },
                        "Sign In"
                      ),
                      React.createElement("div", {
                        dangerouslySetInnerHTML: this.createErrorMarkup(
                          this.state.errorMessage
                        )
                      }),
                      React.createElement(
                        "p",
                        { className: "form-element" },
                        " Not got an account yet? "
                      ),
                      " ",
                      React.createElement(
                        "button",
                        {
                          onClick: this.props.changeModal,
                          className: "show-signup btn btn-secondary"
                        },
                        " Sign Up "
                      )
                    )
                  ),
                  React.createElement(
                    Modal.Footer,
                    null,
                    React.createElement(
                      Button,
                      { onClick: this.props.hideMessage },
                      "Close"
                    )
                  )
                )
              );
            }
          });

          module.exports = LoginModal;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    10: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var Cities = require("./Cities.js");
          var Filter = require("./Filter.js");
          var Map = require("./map/Map.js");

          var Main = React.createClass({
            displayName: "Main",

            getInitialState: function getInitialState() {
              return {
                data: this.props.data,
                view: "list",
                btnMessage: "Map View",
                mapStyle: { display: "none" },
                listStyle: { display: "block" }
              };
            },

            updateCities: function updateCities(data) {
              this.setState({ data: data });
            },

            changeView: function changeView() {
              if (this.state.view === "list") {
                this.setState({
                  view: "map",
                  btnMessage: "List View",
                  mapStyle: { display: "block" },
                  listStyle: { display: "none" }
                });
              } else {
                this.setState({
                  view: "list",
                  btnMessage: "Map View",
                  mapStyle: { display: "none" },
                  listStyle: { display: "block" }
                });
              }
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement(Filter, {
                  updateCities: this.updateCities
                }),
                React.createElement(
                  "button",
                  {
                    onClick: this.changeView,
                    className: "map-toggle main-btn pull-right"
                  },
                  this.state.btnMessage
                ),
                React.createElement("div", { style: { clear: "both" } }, " "),
                React.createElement(Map, {
                  show: this.state.mapStyle,
                  cities: this.state.data
                }),
                React.createElement(Cities, {
                  show: this.state.listStyle,
                  cities: this.state.data
                })
              );
            }
          });

          module.exports = Main;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./Cities.js": 3, "./Filter.js": 6, "./map/Map.js": 30 }
    ],
    11: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var DataDisplay = require("./sidebar/DataDisplay.js");
          var About = require("./sidebar/About.js");
          var SimilarCities = require("./sidebar/SimilarCities.js");

          var SideBar = React.createClass({
            displayName: "SideBar",

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement(About, null),
                this.props.similarCities
                  ? React.createElement(SimilarCities, {
                      cities: this.props.similarCities
                    })
                  : null,
                React.createElement(DataDisplay, null)
              );
            }
          });

          module.exports = SideBar;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {
        "./sidebar/About.js": 36,
        "./sidebar/DataDisplay.js": 37,
        "./sidebar/SimilarCities.js": 38
      }
    ],
    12: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var ReactBootstrap =
            typeof window !== "undefined"
              ? window["ReactBootstrap"]
              : typeof global !== "undefined"
              ? global["ReactBootstrap"]
              : null;
          var Modal = ReactBootstrap.Modal;
          var Button = ReactBootstrap.Button;

          var SignupModal = React.createClass({
            displayName: "SignupModal",

            getInitialState: function getInitialState() {
              return {
                userOK: false,
                passwordOK: false,
                emailValid: false
              };
            },

            sendForm: function sendForm() {
              var component = this;

              //IF PASSWORDS DONT MATCH
              if (
                component.state.password !== component.state.confirmPassword
              ) {
                component.setState({
                  errorMessage:
                    "Your passwords do not match, please check again and then submit."
                });
                return;
              }

              //IF PASSWORD OR USER IS NOT ENTERED CORRECTLY / ALREADY USED
              if (!component.state.userOK || !component.state.passwordOK) {
                component.setState({
                  errorMessage:
                    "There are errors or information missing in the signup form. Please review them and then submit again."
                });
                return;
              }

              //IF THERE IS NO CONFIRM PASSWORD
              if (!component.state.confirmPassword) {
                component.setState({
                  errorMessage:
                    "There are errors or information missing in the signup form. Please review them and then submit again."
                });
                return;
              }

              if (!component.state.name) {
                component.setState({
                  errorMessage:
                    "There are errors or information missing in the signup form. Please review them and then submit again."
                });
                return;
              }

              //MAKE PARAMS HERE
              var url = "/signup";

              var username = this.state.user;
              var password = this.state.confirmPassword;
              var name = this.state.name;
              var params =
                "username=" +
                username +
                "&password=" +
                password +
                "&name=" +
                name;
              $.post(url, params, function(data) {
                if (data.failure) {
                  component.setState({ errorMessage: data.message });
                } else {
                  window.location.replace("/");
                }
              });
            },

            checkUsername: function checkUsername(e) {
              this.setState({ errorMessage: "" });

              var component = this;

              var user = e.target.value;

              var reg = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
              var test = user.match(reg);
              console.log(test);

              if (!test) {
                component.setState({
                  usernameMessage: "That email address is not valid",
                  userAlert: "alert alert-warning",
                  emailValid: false
                });
                return;
              } else {
                component.setState({ emailValid: true });
              }

              var url = "/checkuser/" + user;

              $.get(url, function(data) {
                component.setState(
                  { usernameMessage: data.message, userAlert: data.alert },
                  function() {
                    if (data.alert === "success") {
                      component.setState({ userOK: true });
                    } else {
                      component.setState({ userOK: false });
                    }
                  }
                );
              });
            },

            addUser: function addUser(e) {
              var user = e.target.value;
              this.setState({ user: user });
            },

            addPassword: function addPassword(e) {
              this.setState({ errorMessage: "" });
              var component = this;
              var password = e.target.value;
              this.setState({ password: password }, function() {
                if (component.state.password === "") {
                  component.setState({
                    passwordMessage: "",
                    passwordAlert: "success"
                  });
                }
              });

              var regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(.{8,})$/;

              var test = password.match(regex);

              if (test) {
                this.setState({
                  passwordMessage: "",
                  passwordAlert: "success",
                  passwordOK: true
                });
              } else {
                this.setState({
                  passwordMessage:
                    " Your password must be at least 8 characters and contain one uppercase letter, one lowercase letter, and one number",
                  passwordAlert: "warning",
                  passwordOK: false
                });
              }
            },

            confirmPassword: function confirmPassword(e) {
              this.setState({ errorMessage: "" });
              var component = this;
              this.setState({ confirmPassword: e.target.value }, function() {
                if (
                  component.state.password !== component.state.confirmPassword
                ) {
                  component.setState({
                    passwordMatch: "Your passwords don't match!",
                    confirmPasswordAlert: "warning"
                  });
                } else {
                  component.setState({
                    passwordMatch: "",
                    confirmPasswordAlert: "success"
                  });
                }
              });
            },

            confirmName: function confirmName(e) {
              this.setState({ name: e.target.value });
            },

            createUserMarkup: function createUserMarkup(data, alertType) {
              if (!data) {
                return null;
              }

              return {
                __html:
                  '<div class="alert alert-' +
                  alertType +
                  '">' +
                  data +
                  "</div>"
              };
            },

            createPasswordMarkup: function createPasswordMarkup(
              data,
              alertType
            ) {
              if (!data) {
                return null;
              }
              return {
                __html:
                  '<div class="alert alert-' +
                  alertType +
                  '">' +
                  data +
                  "</div>"
              };
            },

            createConfirmPasswordMarkup: function createConfirmPasswordMarkup(
              data,
              alertType
            ) {
              if (!data) {
                return null;
              }
              return {
                __html:
                  '<div class="alert alert-' +
                  alertType +
                  '">' +
                  data +
                  "</div>"
              };
            },

            createErrorMarkup: function createErrorMarkup(data) {
              if (!data) {
                return null;
              }
              return {
                __html:
                  '<div class="alert alert-' + "danger" + '">' + data + "</div>"
              };
            },

            render: function render() {
              var inline = {
                display: "inline"
              };

              var center = {
                textAlign: "center"
              };

              var image = {
                width: "100px",
                height: "100px"
              };

              var form = {
                textAlign: "center"
              };

              var margin = {
                margin: "10px"
              };

              return React.createElement(
                "div",
                null,
                React.createElement(
                  Modal,
                  {
                    style: center,
                    show: this.props.showMessage,
                    onHide: this.props.hideMessage
                  },
                  React.createElement(
                    Modal.Body,
                    { style: center },
                    React.createElement("h2", null, " Sign Up  "),
                    React.createElement(
                      "a",
                      {
                        className: "btn btn-social btn-facebook",
                        href: "/auth/facebook"
                      },
                      React.createElement("span", {
                        className: "fa fa-facebook"
                      }),
                      " Sign Up with Facebook"
                    ),
                    React.createElement(
                      "a",
                      { className: "btn-strava", href: "/auth/strava" },
                      React.createElement("img", {
                        src: "/public/images/strava-connect.png"
                      })
                    ),
                    React.createElement(
                      "h4",
                      { className: "form-element" },
                      " Or Sign Up With Email "
                    ),
                    React.createElement(
                      "div",
                      { className: "form-group" },
                      React.createElement("label", null, "Name"),
                      React.createElement("input", {
                        type: "text",
                        onChange: this.confirmName,
                        value: this.state.name,
                        className: "form-control",
                        name: "name",
                        id: "name"
                      })
                    ),
                    React.createElement(
                      "div",
                      { className: "form-group" },
                      React.createElement("label", null, "Email"),
                      React.createElement("input", {
                        type: "text",
                        onBlur: this.addUser,
                        onChange: this.checkUsername,
                        className: "form-control",
                        name: "username",
                        id: "username"
                      })
                    ),
                    React.createElement("div", {
                      dangerouslySetInnerHTML: this.createUserMarkup(
                        this.state.usernameMessage,
                        this.state.userAlert
                      )
                    }),
                    React.createElement(
                      "div",
                      { className: "form-group" },
                      React.createElement("label", null, "Password"),
                      React.createElement("input", {
                        type: "password",
                        onKeyUp: this.addPassword,
                        className: "form-control",
                        name: "password"
                      })
                    ),
                    React.createElement("div", {
                      dangerouslySetInnerHTML: this.createPasswordMarkup(
                        this.state.passwordMessage,
                        this.state.passwordAlert
                      )
                    }),
                    React.createElement(
                      "div",
                      { className: "form-group" },
                      React.createElement("label", null, "Confirm Password"),
                      React.createElement("input", {
                        type: "password",
                        onKeyUp: this.confirmPassword,
                        className: "form-control",
                        name: "confirmpassword",
                        id: "password"
                      }),
                      React.createElement("div", {
                        dangerouslySetInnerHTML: this.createConfirmPasswordMarkup(
                          this.state.passwordMatch,
                          this.state.confirmPasswordAlert
                        )
                      })
                    ),
                    React.createElement(
                      "button",
                      {
                        type: "submit",
                        onClick: this.sendForm,
                        className: "btn btn-primary"
                      },
                      "Submit"
                    ),
                    React.createElement("div", {
                      dangerouslySetInnerHTML: this.createErrorMarkup(
                        this.state.errorMessage
                      )
                    })
                  ),
                  React.createElement(
                    Modal.Footer,
                    null,
                    React.createElement(
                      Button,
                      { onClick: this.props.hideMessage },
                      "Close"
                    )
                  )
                )
              );
            }
          });

          module.exports = SignupModal;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    13: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var ReactBootstrap =
            typeof window !== "undefined"
              ? window["ReactBootstrap"]
              : typeof global !== "undefined"
              ? global["ReactBootstrap"]
              : null;

          var Segments = require("./single/Segments.js");
          var Groups = require("./single/Groups.js");
          var Users = require("./single/Users.js");
          var CityImage = require("./CityImage.js");
          var Nutrition = require("./single/Nutrition.js");
          var Tips = require("./single/Tips.js");
          var UserForm = require("./single/UserForm.js");
          var Description = require("./single/Description.js");
          var Weather = require("./single/Weather.js");
          var CityGuides = require("./single/CityGuides.js");
          var TopArrow = require("./TopArrow.js");

          var Single = React.createClass({
            displayName: "Single",

            getInitialState: function getInitialState() {
              return {
                data: this.props.data,
                flight: ""
              };
            },

            render: function render() {
              var clearFix = { clear: "both" };

              return React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  { className: "single-users" },
                  React.createElement(
                    "h3",
                    { className: "sub-title" },
                    " Athletes "
                  ),
                  React.createElement(Users, {
                    riders: this.state.data.riding.riders,
                    runners: this.state.data.running.runners
                  })
                ),
                React.createElement("div", { style: { clear: "both" } }, " "),
                !this.props.addCity
                  ? React.createElement(
                      "div",
                      { className: "single-city-guides" },
                      React.createElement(
                        "h3",
                        { className: "sub-title" },
                        " City Guides "
                      ),
                      React.createElement(CityGuides, { data: this.state.data })
                    )
                  : null,
                React.createElement(
                  "div",
                  { className: "single-segments" },
                  React.createElement(
                    "h3",
                    { className: "sub-title" },
                    " Popular Segments "
                  ),
                  React.createElement(Segments, {
                    ridingSegments: this.state.data.riding.segments,
                    runningSegments: this.state.data.running.segments
                  })
                ),
                React.createElement(
                  "div",
                  { className: "single-groups" },
                  React.createElement(
                    "h3",
                    { className: "sub-title" },
                    " Groups "
                  ),
                  React.createElement(Groups, { city: this.state.data.info })
                ),
                this.state.data.weather
                  ? React.createElement(
                      "div",
                      { className: "single-weather" },
                      React.createElement(
                        "h3",
                        { className: "sub-title" },
                        " Weather "
                      ),
                      React.createElement(Weather, {
                        container: this.props.weatherContainer,
                        city: this.state.data.info.city
                          ? this.state.data.info.city.name
                          : null,
                        weather: this.state.data.weather,
                        data: this.state.data
                      })
                    )
                  : null,
                React.createElement(
                  "div",
                  { className: "single-nutrition" },
                  React.createElement(
                    "h3",
                    { className: "sub-title" },
                    " Nutrition "
                  ),
                  React.createElement(Nutrition, { city: this.state.data.info })
                ),
                React.createElement("div", { style: clearFix }, " "),
                !this.props.addCity
                  ? React.createElement(
                      "div",
                      { className: "single-tips" },
                      React.createElement(
                        "h3",
                        { className: "sub-title" },
                        " Tips "
                      ),
                      React.createElement(Tips, {
                        slug: this.state.data.info.city.slug,
                        runningTips: this.state.data.running.tips,
                        ridingTips: this.state.data.riding.tips
                      })
                    )
                  : null,
                !this.props.addCity ? React.createElement(TopArrow, null) : null
              );
            }
          });

          module.exports = Single;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {
        "./CityImage.js": 5,
        "./TopArrow.js": 14,
        "./single/CityGuides.js": 40,
        "./single/Description.js": 42,
        "./single/Groups.js": 45,
        "./single/Nutrition.js": 46,
        "./single/Segments.js": 50,
        "./single/Tips.js": 52,
        "./single/UserForm.js": 54,
        "./single/Users.js": 55,
        "./single/Weather.js": 56
      }
    ],
    14: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var TopArrow = React.createClass({
            displayName: "TopArrow",

            goUp: function goUp() {
              $("html, body").animate({ scrollTop: 0 }, "slow");
            },

            render: function render() {
              return React.createElement(
                "div",
                { className: "arrow-up", onClick: this.goUp },
                React.createElement("p", {
                  className: "fa fa-arrow-up",
                  "aria-hidden": "true"
                })
              );
            }
          });

          module.exports = TopArrow;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    15: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var LoginModal = require("./Login.js");
          var SignupModal = require("./Signup.js");
          var IntroText = require("./IntroText.js");
          var Overview = require("./single/Overview.js");
          var AddCityModal = require("./addcity/AddCityModal.js");
          var ProfileModal = require("./profile/ProfileModal.js");
          var SearchBox = require("./search-box/SearchBox.js");

          var Header = React.createClass({
            displayName: "Header",

            getInitialState: function getInitialState() {
              return {
                attr: "",
                showAddCityModal: false
              };
            },

            showAddCityModal: function showAddCityModal() {
              this.setState({ showAddCityModal: true });
            },

            hideAddCityModal: function hideAddCityModal() {
              this.setState({ showAddCityModal: false });
            },

            showProfileModal: function showProfileModal() {
              this.setState({ showProfileModal: true });
            },

            hideProfileModal: function hideProfileModal() {
              this.setState({ showProfileModal: false });
            },

            componentDidMount: function componentDidMount() {
              this.setState({
                logoutHref: "/logout?redirect=" + window.location.pathname
              });

              if (this.props.type === "single") {
                //IMAGE
                var component = this;
                var url = "/api/flickr";
                var query = {};
                query.lat = this.props.data.info.location.latitude;
                query.long = this.props.data.info.location.longitude;
                query.city = this.props.data.info.city.name;
                query.country = this.props.data.info.country.name;

                $.get(url, query, function(data) {
                  component.setState({ img: data.img, attr: data.attr });
                  var style = {
                    backgroundImage:
                      "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(" +
                      data.img +
                      ")"
                  };

                  component.setState({ style: style });
                });
              }
            },

            render: function render() {
              if (this.props.type === "front") {
                var headerStyle = {
                  backgroundImage:
                    "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/public/images/header.jpg)"
                };
              } else {
                var headerStyle = this.state.style;
              }

              return React.createElement(
                "div",
                { className: "header-full", style: headerStyle },
                React.createElement(
                  "div",
                  { className: "navigation-holder" },
                  React.createElement(
                    "div",
                    { className: "navbar-header" },
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        className: "navbar-toggle collapsed",
                        "data-toggle": "collapse",
                        "data-target": "#navbar",
                        "aria-expanded": "false",
                        "aria-controls": "navbar"
                      },
                      React.createElement(
                        "span",
                        { className: "sr-only" },
                        "Toggle navigation"
                      ),
                      React.createElement("span", { className: "icon-bar" }),
                      React.createElement("span", { className: "icon-bar" }),
                      React.createElement("span", { className: "icon-bar" })
                    ),
                    React.createElement(
                      "a",
                      { className: "navbar-brand", href: "/" },
                      "NomadWorkout"
                    )
                  ),
                  React.createElement(
                    "div",
                    {
                      id: "navbar",
                      className: "navbar-collapse collapse",
                      "aria-expanded": "false"
                    },
                    React.createElement("ul", { className: "nav navbar-nav" }),
                    React.createElement(
                      "ul",
                      { className: "nav navbar-nav navbar-right" },
                      React.createElement(
                        "li",
                        null,
                        React.createElement("a", { href: "/" }, "Home")
                      ),
                      React.createElement(
                        "li",
                        null,
                        React.createElement(
                          "a",
                          { href: "#", onClick: this.showProfileModal },
                          "Profile"
                        )
                      ),
                      React.createElement(
                        "li",
                        null,
                        React.createElement(
                          "a",
                          { href: this.state.logoutHref },
                          "Logout"
                        )
                      )
                    )
                  )
                ),
                this.props.type === "front"
                  ? React.createElement(
                      "div",
                      { className: "header-intro-search" },
                      React.createElement(IntroText, null),
                      React.createElement(SearchBox, null)
                    )
                  : React.createElement(
                      "div",
                      { className: "single-header-text-holder" },
                      React.createElement(
                        "h3",
                        { className: "single-header-text" },
                        " ",
                        this.props.data.info.city.name,
                        ", ",
                        this.props.data.info.country.name,
                        " "
                      ),
                      React.createElement(Overview, { data: this.props.data }),
                      React.createElement(
                        "a",
                        {
                          target: "_blank",
                          className: "img-attribution",
                          href: this.state.attr
                        },
                        "Image Author"
                      )
                    ),
                React.createElement(AddCityModal, {
                  showMessage: this.state.showAddCityModal,
                  hideMessage: this.hideAddCityModal
                }),
                React.createElement(ProfileModal, {
                  user: this.props.user,
                  showMessage: this.state.showProfileModal,
                  hideMessage: this.hideProfileModal
                })
              );
            }
          });

          module.exports = Header;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {
        "./IntroText.js": 8,
        "./Login.js": 9,
        "./Signup.js": 12,
        "./addcity/AddCityModal.js": 16,
        "./profile/ProfileModal.js": 32,
        "./search-box/SearchBox.js": 35,
        "./single/Overview.js": 47
      }
    ],
    16: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var ReactBootstrap =
            typeof window !== "undefined"
              ? window["ReactBootstrap"]
              : typeof global !== "undefined"
              ? global["ReactBootstrap"]
              : null;
          var Modal = ReactBootstrap.Modal;
          var Button = ReactBootstrap.Button;

          var Location = require("./Location.js");

          var Single = require("../Single.js");

          var AddCityModal = React.createClass({
            displayName: "AddCityModal",

            getInitialState: function getInitialState() {
              return {
                city: "",
                locations: [],
                dataReceived: false
              };
            },

            changeCity: function changeCity(e) {
              this.setState({ city: e.target.value });
            },

            geocode: function geocode() {
              //REMOVE ALL DATA FROM PREVIOUS
              this.setState({ dataReceived: false, data: {} });

              var component = this;
              var city = this.state.city;

              $.get("/api/geocode?city=" + city, function(data) {
                console.log(data);
                component.setState({ locations: data });
              });
            },

            getSegments: function getSegments(city) {
              var component = this;
              var url = "/api/getsegs";
              var data = city;
              $.post(url, data, function(data) {
                if (data === "error") {
                  component.setState({
                    statusMsg:
                      "We seemed to have encountered an error. Try a different city or email us with your city request."
                  });
                  return;
                }

                component.setState({ data: data });

                //REMOVE DATA RECEIVED AND CALL WEATHER WHEN IT IS FIXED
                //component.setState({dataReceived: true, statusMsg: "", loader: false})
                component.getWeather();
              }).fail(function(response) {
                component.setState({
                  statusMsg:
                    "We seemed to have encountered an error. Try a different city or email us with your city request."
                });
              });

              this.setState({
                statusMsg: "Loading city data now...",
                loader: true
              });
            },

            getWeather: function getWeather() {
              var component = this;
              var url = "/api/weather";
              var data = this.state.data;
              $.post(url, data, function(data) {
                console.log(data);
                if (data !== "error") {
                  component.setState({
                    data: data,
                    dataReceived: true,
                    statusMsg: "",
                    loader: false
                  });
                } else {
                  component.setState({
                    dataReceived: true,
                    statusMsg: "We could not find weather data at this moment.",
                    loader: false
                  });
                }
              });
            },

            declareCity: function declareCity(cityChoice) {
              this.setState(
                { chosenCity: cityChoice },
                console.log(this.state)
              );

              var cities = this.state.locations;
              var chosenCity = [];
              cities.forEach(function(city) {
                if (city === cityChoice) {
                  console.log(city);
                  chosenCity.push(city);
                }
              });

              console.log(chosenCity);
              this.setState(
                { locations: chosenCity },
                this.getSegments(cityChoice)
              );
            },

            destroy: function destroy() {
              this.props.hideMessage();
              $(".add-city-single").fadeOut("slow");
            },

            checkEnter: function checkEnter(e) {
              console.log(e.keyCode);

              if (e.keyCode === 13) {
                this.geocode();
              }
            },

            render: function render() {
              var component = this;

              return React.createElement(
                "div",
                null,
                React.createElement(
                  Modal,
                  {
                    dialogClassName: "addCityModal",
                    show: this.props.showMessage,
                    backdrop: true,
                    keyboard: true,
                    onHide: this.destroy
                  },
                  React.createElement(
                    Modal.Header,
                    { closeButton: true },
                    React.createElement("h1", null, " City Explorer ")
                  ),
                  React.createElement(
                    Modal.Body,
                    null,
                    React.createElement(
                      "p",
                      null,
                      " If we do not have a city, you can explore the world here. "
                    ),
                    React.createElement(
                      "p",
                      null,
                      " We want to add in cities that people will want to represent and share, "
                    ),
                    React.createElement(
                      "p",
                      null,
                      " so if you want to become a cityguide for this city, shoot us an email! "
                    ),
                    React.createElement("input", {
                      type: "text",
                      onChange: this.changeCity,
                      value: this.state.city,
                      onKeyDown: this.checkEnter
                    }),
                    React.createElement(
                      "button",
                      { className: "btn filter-btn", onClick: this.geocode },
                      "Find City"
                    ),
                    React.createElement(
                      "div",
                      { className: "location-buttons row" },
                      this.state.locations.map(function(city) {
                        return React.createElement(Location, {
                          declareCity: component.declareCity,
                          key: city.id,
                          city: city
                        });
                      })
                    ),
                    this.state.statusMsg
                      ? React.createElement(
                          "p",
                          null,
                          " ",
                          this.state.statusMsg,
                          " "
                        )
                      : null,
                    this.state.loader
                      ? React.createElement("img", {
                          src: "/public/images/loader.gif"
                        })
                      : null,
                    React.createElement(
                      "div",
                      { className: "add-city-single" },
                      this.state.dataReceived
                        ? React.createElement(Single, {
                            data: this.state.data,
                            weatherContainer: "modal-chart",
                            addCity: true
                          })
                        : null
                    )
                  ),
                  React.createElement(
                    Modal.Footer,
                    null,
                    React.createElement(
                      Button,
                      { onClick: this.destroy },
                      "Close"
                    )
                  )
                )
              );
            }
          });

          module.exports = AddCityModal;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "../Single.js": 13, "./Location.js": 17 }
    ],
    17: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Location = React.createClass({
            displayName: "Location",

            declareCity: function declareCity() {
              this.props.declareCity(this.props.city);
            },

            render: function render() {
              return React.createElement(
                "div",
                {
                  className:
                    "location-buttons col-lg-4 col-md-4 col-sm-4 col-xs-12"
                },
                React.createElement(
                  "button",
                  {
                    onClick: this.declareCity,
                    className: "btn filter-btn auto-width"
                  },
                  this.props.city.address
                )
              );
            }
          });

          module.exports = Location;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    18: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var ReactBootstrap =
            typeof window !== "undefined"
              ? window["ReactBootstrap"]
              : typeof global !== "undefined"
              ? global["ReactBootstrap"]
              : null;
          var Modal = ReactBootstrap.Modal;

          var CityGuidesInfo = React.createClass({
            displayName: "CityGuidesInfo",

            getInitialState: function getInitialState() {
              return {
                bio: ""
              };
            },

            addCityGuide: function addCityGuide() {
              var component = this;

              if (!this.state.bio) {
                this.setState({
                  message:
                    "You must include a brief description of yourself to become a city guide."
                });
                return;
              }

              var user = JSON.parse(document.getElementById("user").innerHTML);

              if (user !== "none") {
                console.log("has a user");
                var data = {
                  slug: this.props.data.info.city.slug,
                  cityName:
                    this.props.data.info.city.name +
                    ", " +
                    this.props.data.info.country.name,
                  bio: this.state.bio
                };

                $.post("/api/guides", data, function(data) {
                  console.log(data);
                  component.setState({
                    success:
                      "Congratulations, you've just added yourself as a city guide!"
                  });
                });
              } else {
                this.setState({
                  message:
                    "You must be logged in to add yourself as a city guide."
                });
              }
            },

            tweetIt: function tweetIt() {
              var phrase =
                "I just became a city guide for " +
                this.props.data.info.city.name +
                ", " +
                this.props.data.info.country.name +
                "! #runanywhere #rideanywhere";
              var tweetUrl =
                "https://twitter.com/share?text=" +
                encodeURIComponent(phrase) +
                "." +
                "&url=" +
                "http://www.nomadworkout.com/";

              window.open(tweetUrl);
            },

            fbookIt: function fbookIt() {
              var title = "My Title";
              var summary = "This is my summary";
              var url = "http://www.nomadworkout.com";
              var image =
                "http://www.nomadworkout.com/public/images/header.jpg";

              var fb = window.open(
                "https://www.facebook.com/sharer/sharer.php?u=" +
                  encodeURIComponent(url)
              );
              fb.focus();
            },

            showLoginModal: function showLoginModal() {
              var showLoginEvent = new CustomEvent("showLogin");
              window.dispatchEvent(showLoginEvent);
            },

            setBio: function setBio(e) {
              this.setState({ bio: e.target.value });
            },

            render: function render() {
              var component = this;

              return React.createElement(
                "div",
                null,
                React.createElement(
                  Modal,
                  {
                    show: this.props.showMessage,
                    backdrop: true,
                    keyboard: true,
                    onHide: this.props.hideMessage
                  },
                  React.createElement(
                    Modal.Header,
                    { closeButton: true },
                    React.createElement(
                      "h3",
                      { className: "sub-title" },
                      "City Guides"
                    )
                  ),
                  React.createElement(
                    Modal.Body,
                    null,
                    React.createElement(
                      "p",
                      null,
                      " Our city guides are nice people that want to share the best that their cities have to offer with others. "
                    ),
                    React.createElement(
                      "p",
                      null,
                      " You will get messages from people interested in visiting your city, all you have to do is respond and give advice. "
                    ),
                    React.createElement(
                      "p",
                      null,
                      " Sound like a good idea? We think so. Add a short description of yourself and start helping athletes around the world. "
                    ),
                    React.createElement("textarea", {
                      onChange: this.setBio,
                      value: this.state.bio
                    }),
                    React.createElement(
                      "button",
                      {
                        className: "btn main-btn btn-block",
                        onClick: this.addCityGuide
                      },
                      " Become a guide for ",
                      component.props.data.info.city.name,
                      " "
                    ),
                    this.state.message
                      ? React.createElement(
                          "div",
                          null,
                          React.createElement(
                            "p",
                            { className: "alert alert-warning" },
                            this.state.message
                          ),
                          " ",
                          React.createElement(
                            "button",
                            {
                              onClick: this.showLoginModal,
                              className: "btn main-btn"
                            },
                            "Login Now"
                          )
                        )
                      : null,
                    this.state.success
                      ? React.createElement(
                          "div",
                          null,
                          React.createElement(
                            "p",
                            { className: "alert alert-success" },
                            this.state.success
                          ),
                          " ",
                          React.createElement(
                            "button",
                            {
                              onClick: this.tweetIt,
                              className: "btn main-btn"
                            },
                            "Tweet Your Friends"
                          ),
                          React.createElement(
                            "button",
                            {
                              onClick: this.fbookIt,
                              className: "btn btn-social btn-facebook"
                            },
                            React.createElement("span", {
                              className: "fa fa-facebook"
                            }),
                            "Share"
                          )
                        )
                      : null,
                    this.state.success
                      ? null
                      : React.createElement(
                          "div",
                          { className: "smallprint" },
                          React.createElement("br", null),
                          React.createElement("p", null, " The SmallPrint "),
                          React.createElement(
                            "p",
                            null,
                            " We will never share your email address with others and will not share any of your personal details. People will send you a message via this site, and then you can choose to email them back. If you do so, they will then have access to your email address to reply."
                          ),
                          React.createElement(
                            "p",
                            null,
                            " If at any point you would like to stop being a city guide, simply go to your profile and remove yourself. "
                          )
                        )
                  ),
                  React.createElement(
                    Modal.Footer,
                    null,
                    React.createElement(
                      "button",
                      {
                        className: "btn filter-btn",
                        onClick: this.props.hideMessage
                      },
                      "Close"
                    )
                  )
                )
              );
            }
          });

          module.exports = CityGuidesInfo;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    19: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Guide = React.createClass({
            displayName: "Guide",

            getInitialState: function getInitialState() {
              return {};
            },

            componentDidMount: function componentDidMount() {
              $("img").tooltip();
              console.log(this.props);
              $("#" + this.props.data.user.id)
                .on("load", function() {})
                .on("error", function() {
                  $(this).attr("src", "/public/images/profile.png");
                });
            },

            showGuide: function showGuide() {
              this.props.showGuide(this.props.data);
            },

            render: function render() {
              var secondName = this.props.data.user.secondName || "";

              return React.createElement(
                "div",
                {
                  className: "guide col-lg-2 col-md-3 col-sm-3 col-xs-6",
                  onClick: this.showGuide
                },
                React.createElement(
                  "div",
                  null,
                  React.createElement("img", {
                    id: this.props.data.user.id,
                    className: "athlete-img",
                    src: this.props.data.user.img,
                    alt: this.props.data.user.firstName + " " + secondName,
                    "data-toggle": "tooltip",
                    "data-placement": "top",
                    title: this.props.data.user.firstName + " " + secondName
                  }),
                  React.createElement("p", null, " Contact ")
                )
              );
            }
          });

          module.exports = Guide;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    20: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          function _defineProperty(obj, key, value) {
            if (key in obj) {
              Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
              });
            } else {
              obj[key] = value;
            }
            return obj;
          }

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var ReactBootstrap =
            typeof window !== "undefined"
              ? window["ReactBootstrap"]
              : typeof global !== "undefined"
              ? global["ReactBootstrap"]
              : null;
          var Modal = ReactBootstrap.Modal;

          var ContactGuide = React.createClass({
            displayName: "ContactGuide",

            getInitialState: function getInitialState() {
              return {};
            },

            sendData: function sendData() {
              var component = this;

              $("form").submit(function(e) {
                e.preventDefault();
                console.log($(this));
                var body = $(this).serializeArray();
                console.log(body);
                component.setState({ googleVerify: body[0].value }, function() {
                  console.log(this.props);
                  var body = {
                    guideId: this.props.guide.user.id,
                    name: this.state.name,
                    subject: this.state.subject,
                    info: this.state.info,
                    googleVerify: this.state.googleVerify
                  };

                  if (
                    !this.state.infoAdded ||
                    !this.state.nameAdded ||
                    !this.state.subjectAdded
                  ) {
                    component.setState({
                      msg:
                        "You are missing some information in the form, please check again."
                    });
                    return;
                  }

                  console.log(body);
                  console.log("trying to send data");
                  $.post("/api/contactguide", body, function(data) {
                    console.log(data);
                    grecaptcha.reset();
                    component.setState({ msg: data.msg });
                  });
                });
              });
            },

            addName: function addName(e) {
              this.setState({ name: e.target.value, nameAdded: true });
            },

            addSubject: function addSubject(e) {
              this.setState({ subject: e.target.value, subjectAdded: true });
            },

            addInfo: function addInfo(e) {
              this.setState({ info: e.target.value, infoAdded: true });
            },

            render: function render() {
              var component = this;

              return React.createElement(
                "div",
                null,
                React.createElement(
                  Modal,
                  {
                    className: "contact-guide-modal",
                    show: this.props.showMessage,
                    backdrop: true,
                    keyboard: true,
                    onHide: this.props.hideMessage
                  },
                  React.createElement(
                    Modal.Header,
                    { closeButton: true },
                    React.createElement(
                      "h3",
                      { className: "sub-title" },
                      "Contact Guide"
                    )
                  ),
                  React.createElement(
                    Modal.Body,
                    null,
                    React.createElement(
                      "h4",
                      {
                        style: { marginTop: "20px" },
                        className: "text-center"
                      },
                      " Guide Profile "
                    ),
                    this.props.guide
                      ? React.createElement("img", {
                          style: {
                            width: "100px",
                            height: "100px",
                            margin: "0px auto",
                            display: "block"
                          },
                          src: this.props.guide.user.img
                        })
                      : null,
                    React.createElement(
                      "h5",
                      { className: "text-center" },
                      " ",
                      this.props.guide ? this.props.guide.user.bio : null,
                      " "
                    ),
                    React.createElement(
                      "h4",
                      {
                        style: { marginTop: "20px" },
                        className: "text-center"
                      },
                      " Contact "
                    ),
                    React.createElement(
                      "form",
                      { className: "contact-guide" },
                      React.createElement("p", null, "Your Name"),
                      React.createElement("input", {
                        onChange: this.addName,
                        value: this.state.name,
                        className: "form-control",
                        type: "text"
                      }),
                      React.createElement("p", null, " Subject "),
                      React.createElement("input", {
                        onChange: this.addSubject,
                        value: this.state.subject,
                        className: "form-control",
                        type: "text"
                      }),
                      React.createElement("p", null, " Message "),
                      React.createElement("textarea", {
                        onChange: this.addInfo,
                        value: this.state.info,
                        className: "form-control"
                      }),
                      React.createElement("div", {
                        style: { margin: "10px auto" },
                        id: "recaptcha2"
                      }),
                      React.createElement(
                        "input",
                        _defineProperty(
                          {
                            type: "submit",
                            className: "btn main-btn",
                            onClick: this.sendData,
                            value: "Submit"
                          },
                          "type",
                          "submit"
                        )
                      )
                    )
                  ),
                  React.createElement(
                    Modal.Footer,
                    null,
                    this.state.msg
                      ? React.createElement(
                          "p",
                          { className: "info info-success" },
                          this.state.msg
                        )
                      : null,
                    React.createElement(
                      "button",
                      {
                        className: "btn filter-btn",
                        onClick: this.props.hideMessage
                      },
                      "Close"
                    )
                  )
                )
              );
            }
          });

          module.exports = ContactGuide;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    21: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Sort = React.createClass({
            displayName: "Sort",

            getInitialState: function getInitialState() {
              return {
                selected: null
              };
            },

            setAlt: function setAlt(e) {
              var component = this;

              $(".filter-altitude button").removeClass("filter-btn-selected");

              if (this.state.selected === e.target.value) {
                this.props.updateFilter({ alt: null });
                return;
              }

              $(e.target).addClass("filter-btn-selected");
              this.setState({ selected: e.target.value });
              //SEND TO PARENT HERE

              var alt = e.target.value;

              var lookup = {
                low: { min: -10, max: 500 },
                medium: { min: 500, max: 1000 },
                high: { min: 1000, max: 9000 }
              };

              var altQuery = lookup[alt];

              //SEND TO PARENT HERE
              this.props.updateFilter({ alt: altQuery });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("p", null, " Altitude "),
                React.createElement(
                  "button",
                  {
                    className: "btn filter-btn btn-three",
                    value: "high",
                    onClick: this.setAlt,
                    "data-toggle": "tooltip",
                    "data-placement": "top",
                    title: "1000m+"
                  },
                  "High"
                ),
                React.createElement(
                  "button",
                  {
                    className: "btn filter-btn btn-three",
                    value: "medium",
                    onClick: this.setAlt,
                    "data-toggle": "tooltip",
                    "data-placement": "top",
                    title: "500 - 1000m"
                  },
                  "Med"
                ),
                React.createElement(
                  "button",
                  {
                    className: "btn filter-btn btn-three",
                    value: "low",
                    onClick: this.setAlt,
                    "data-toggle": "tooltip",
                    "data-placement": "top",
                    title: "0 - 500m"
                  },
                  "Low"
                )
              );
            }
          });

          module.exports = Sort;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    22: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Continent = React.createClass({
            displayName: "Continent",

            getInitialState: function getInitialState() {
              return {
                continent: ""
              };
            },

            selectContinent: function selectContinent(e) {
              this.setState({ continent: e.target.value });
              this.props.selectContinent({ continent: e.target.value });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("p", null, " Continent "),
                React.createElement(
                  "select",
                  {
                    defaultValue: "",
                    value: this.state.continent,
                    onChange: this.selectContinent
                  },
                  React.createElement("option", { value: "" }, "WorldWide"),
                  React.createElement("option", { value: "asia" }, "Asia"),
                  React.createElement("option", { value: "europe" }, "Europe"),
                  React.createElement(
                    "option",
                    { value: "north-america" },
                    "North America"
                  ),
                  React.createElement(
                    "option",
                    { value: "south-america" },
                    "South America"
                  ),
                  React.createElement("option", { value: "africa" }, "Africa"),
                  React.createElement(
                    "option",
                    { value: "middle-east" },
                    "Middle East"
                  )
                )
              );
            }
          });

          module.exports = Continent;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    23: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Hotel = React.createClass({
            displayName: "Hotel",

            getInitialState: function getInitialState() {
              return {
                minHotelCost: this.props.minCost,
                maxHotelCost: this.props.maxCost
              };
            },

            componentDidMount: function componentDidMount() {
              /*
     var component = this;
     var url = "/api/hotelcost";
      $.get(url, function(data) {
         component.setState({minHotelCost: data[0]})
         component.setState({maxHotelCost: data[1]})
         component.props.updateHotel({minHotelCost: data[0]})
         component.props.updateHotel({maxHotelCost: data[1]})
     });
     */
            },

            changeHotelMin: function changeHotelMin(e) {
              this.setState({ minHotelCost: e.target.value });
              this.props.updateHotel({ minHotelCost: e.target.value });
            },

            changeHotelMax: function changeHotelMax(e) {
              this.setState({ maxHotelCost: e.target.value });
              this.props.updateHotel({ maxHotelCost: e.target.value });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("p", null, " Min Hotel Cost "),
                React.createElement("input", {
                  className: "filter-runners",
                  onChange: this.changeHotelMin,
                  type: "range",
                  value: this.state.minHotelCost,
                  min: 0,
                  max: 150
                }),
                React.createElement("p", null, "$", this.state.minHotelCost),
                React.createElement("p", null, " Max Hotel Cost "),
                React.createElement("input", {
                  className: "filter-riders",
                  onChange: this.changeHotelMax,
                  type: "range",
                  value: this.state.maxHotelCost,
                  min: 0,
                  max: 150
                }),
                React.createElement("p", null, "$", this.state.maxHotelCost)
              );
            }
          });

          module.exports = Hotel;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    24: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Month = React.createClass({
            displayName: "Month",

            getInitialState: function getInitialState() {
              return {
                month: this.props.month
              };
            },

            selectMonth: function selectMonth(e) {
              this.setState({ month: +e.target.value });
              this.props.selectMonth({ month: +e.target.value });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("p", null, " I want to go in: "),
                React.createElement(
                  "select",
                  { value: this.state.month, onChange: this.selectMonth },
                  React.createElement("option", { value: "0" }, "January"),
                  React.createElement("option", { value: "1" }, "February"),
                  React.createElement("option", { value: "2" }, "March"),
                  React.createElement("option", { value: "3" }, "April"),
                  React.createElement("option", { value: "4" }, "May"),
                  React.createElement("option", { value: "5" }, "June"),
                  React.createElement("option", { value: "6" }, "July"),
                  React.createElement("option", { value: "7" }, "August"),
                  React.createElement("option", { value: "8" }, "September"),
                  React.createElement("option", { value: "9" }, "October"),
                  React.createElement("option", { value: "10" }, "November"),
                  React.createElement("option", { value: "11" }, "December")
                )
              );
            }
          });

          module.exports = Month;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    25: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Rain = React.createClass({
            displayName: "Rain",

            getInitialState: function getInitialState() {
              return {
                maxRain: this.props.maxRain
              };
            },

            changeRain: function changeRain(e) {
              this.setState({ maxRain: e.target.value });
              this.props.updateRain({ maxRain: e.target.value });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("p", null, " Max Rain Days "),
                React.createElement("input", {
                  className: "filter-rain",
                  onChange: this.changeRain,
                  type: "range",
                  value: this.state.maxRain,
                  min: 0,
                  max: 30
                }),
                React.createElement("p", null, this.state.maxRain)
              );
            }
          });

          module.exports = Rain;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    26: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Sort = React.createClass({
            displayName: "Sort",

            getInitialState: function getInitialState() {
              return {
                selected: null
              };
            },

            setSort: function setSort(e) {
              var component = this;

              var component = this;
              $(".filter-sort button").removeClass("filter-btn-selected");

              console.log(e.target.value);
              console.log(this.state.selected);
              if (this.state.selected === e.target.value) {
                this.props.updateFilter({ sortBy: null });
                return;
              }

              $(e.target).addClass("filter-btn-selected");
              this.setState({ selected: e.target.value });

              //SEND TO PARENT HERE
              this.props.updateFilter({ sortBy: e.target.value });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("p", null, " Sort By "),
                React.createElement(
                  "button",
                  {
                    className: "btn filter-btn btn-two",
                    value: "running",
                    onClick: this.setSort
                  },
                  " Runners "
                ),
                React.createElement(
                  "button",
                  {
                    className: "btn filter-btn btn-two",
                    value: "riding",
                    onClick: this.setSort
                  },
                  " Riders "
                )
              );
            }
          });

          module.exports = Sort;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    27: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Temp = React.createClass({
            displayName: "Temp",

            getInitialState: function getInitialState() {
              return {
                selected: null
              };
            },

            setTemperature: function setTemperature(e) {
              var component = this;

              $(".filter-temp button").removeClass("filter-btn-selected");

              console.log(e.target.value);
              console.log(this.state.selected);
              if (this.state.selected === e.target.value) {
                this.props.updateFilter({ temp: null });
                return;
              }

              $(e.target).addClass("filter-btn-selected");
              this.setState({ selected: e.target.value });

              var temp = e.target.value;

              var lookup = {
                hot: { min: 26, max: 60 },
                warm: { min: 16, max: 25 },
                cool: { min: -20, max: 15 }
              };

              var tempQuery = lookup[temp];

              //SEND TO PARENT HERE
              this.props.updateFilter({ temp: tempQuery });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("p", null, " Temperature "),
                React.createElement(
                  "button",
                  {
                    className: "btn filter-btn btn-three",
                    value: "hot",
                    onClick: this.setTemperature,
                    "data-toggle": "tooltip",
                    "data-placement": "top",
                    title: "26+ deg C"
                  },
                  " Hot "
                ),
                React.createElement(
                  "button",
                  {
                    className: "btn filter-btn btn-three",
                    value: "warm",
                    onClick: this.setTemperature,
                    "data-toggle": "tooltip",
                    "data-placement": "top",
                    title: "15 to 26 deg C"
                  },
                  " Warm "
                ),
                React.createElement(
                  "button",
                  {
                    className: "btn filter-btn btn-three",
                    value: "cool",
                    onClick: this.setTemperature,
                    "data-toggle": "tooltip",
                    "data-placement": "top",
                    title: "-5 to 15 deg C"
                  },
                  " Cold "
                )
              );
            }
          });

          module.exports = Temp;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    28: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Terrain = React.createClass({
            displayName: "Terrain",

            getInitialState: function getInitialState() {
              return {
                selected: null
              };
            },

            setTerrain: function setTerrain(e) {
              var component = this;
              $(".filter-terrain button").removeClass("filter-btn-selected");

              if (this.state.selected === e.target.value) {
                this.props.updateFilter({ terrain: null });
                return;
              }

              $(e.target).addClass("filter-btn-selected");
              this.setState({ selected: e.target.value });
              //SEND TO PARENT HERE
              this.props.updateFilter({ terrain: e.target.value });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("p", null, " Terrain "),
                React.createElement(
                  "button",
                  {
                    className: "btn filter-btn btn-two",
                    value: "hilly",
                    onClick: this.setTerrain
                  },
                  " Hilly "
                ),
                React.createElement(
                  "button",
                  {
                    className: "btn filter-btn btn-two",
                    value: "flat",
                    onClick: this.setTerrain
                  },
                  " Flat "
                )
              );
            }
          });

          module.exports = Terrain;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    29: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var ReactDOM =
            typeof window !== "undefined"
              ? window["ReactDOM"]
              : typeof global !== "undefined"
              ? global["ReactDOM"]
              : null;

          var Main = require("./Main.js");
          var SideBar = require("./Sidebar.js");
          var Single = require("./Single.js");
          var Header = require("./Header.js");
          var UserHeader = require("./UserHeader.js");
          //GET PROPS

          var data = JSON.parse(document.getElementById("data").innerHTML);

          var user = JSON.parse(document.getElementById("user").innerHTML);

          var pageType = document.getElementById("pageType").innerHTML;

          var similarCities = document.getElementById("similarCities")
            .innerHTML;

          var headerHolder = document.getElementById("header-react-holder");
          var sidebarHolder = document.getElementById("sidebar-react-holder");
          var mainHolder = document.getElementById("main-react-holder");
          var singleHolder = document.getElementById("single-react-holder");

          if (user !== "none") {
            ReactDOM.render(
              React.createElement(UserHeader, {
                data: data,
                user: user,
                type: pageType
              }),
              headerHolder
            );
          } else {
            ReactDOM.render(
              React.createElement(Header, { data: data, type: pageType }),
              headerHolder
            );
          }

          if (similarCities) {
            ReactDOM.render(
              React.createElement(SideBar, {
                data: data,
                similarCities: JSON.parse(similarCities)
              }),
              sidebarHolder
            );
          } else {
            ReactDOM.render(
              React.createElement(SideBar, { data: data }),
              sidebarHolder
            );
          }

          if (mainHolder) {
            ReactDOM.render(
              React.createElement(Main, { data: data }),
              mainHolder
            );
          } else if (singleHolder) {
            ReactDOM.render(
              React.createElement(Single, {
                data: data,
                weatherContainer: "chart"
              }),
              singleHolder
            );
          }
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {
        "./Header.js": 7,
        "./Main.js": 10,
        "./Sidebar.js": 11,
        "./Single.js": 13,
        "./UserHeader.js": 15
      }
    ],
    30: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var MapChart = require("../../common/MapChart.js");

          var MapDisplay = React.createClass({
            displayName: "MapDisplay",

            getInitialState: function getInitialState() {
              return {
                width: "100%",
                height: 500
              };
            },

            componentDidMount: function componentDidMount() {
              var component = this;

              var CityMap = new MapChart(
                "#map-holder",
                component.props.cities,
                component.state.width,
                component.state.height,
                6,
                14
              );

              this.setState({ CityMap: CityMap }, function() {
                this.state.CityMap.appendSvg();
                this.state.CityMap.createMap();
              });

              window.addEventListener("resize", function(event) {
                var containerHeight = $("#map-holder").height();
                var containerWidth = $("#map-holder").width();
                component.setState({
                  width: containerWidth,
                  height: containerHeight
                });
              });
            },

            componentDidUpdate: function componentDidUpdate() {
              this.state.CityMap.removeData();
              this.state.CityMap.addData(this.props.cities);
              this.state.CityMap.addEvents();
            },

            render: function render() {
              return React.createElement("div", {
                style: this.props.show,
                id: "map-holder"
              });
            }
          });

          module.exports = MapDisplay;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "../../common/MapChart.js": 1 }
    ],
    31: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var GuideCity = React.createClass({
            displayName: "GuideCity",

            removeCity: function removeCity() {
              var data = { slug: this.props.city.slug };
              var component = this;

              $.ajax({
                url: "/api/guides",
                data: data,
                type: "DELETE",
                success: function success(result) {
                  component.props.getUser();
                }
              });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement(
                  "p",
                  null,
                  " ",
                  this.props.city.cityName,
                  " "
                ),
                React.createElement(
                  "button",
                  { onClick: this.removeCity, className: "btn main-bth" },
                  "Remove"
                )
              );
            }
          });

          module.exports = GuideCity;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    32: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var ReactBootstrap =
            typeof window !== "undefined"
              ? window["ReactBootstrap"]
              : typeof global !== "undefined"
              ? global["ReactBootstrap"]
              : null;

          var Modal = ReactBootstrap.Modal;
          var GuideCity = require("./GuideCity.js");
          var ProfileTip = require("./ProfileTip.js");

          var Profile = React.createClass({
            displayName: "Profile",

            getInitialState: function getInitialState() {
              return {
                user: {},
                guideCities: false,
                tips: false
              };
            },

            getUser: function getUser() {
              var component = this;
              this.setState({ user: this.props.user });

              $.get("/api/user", function(data) {
                //console.log(data)
                component.setState({ user: data[0] }, function() {
                  console.log(this.state.user);
                  if (data[0].guideCities.length > 0) {
                    component.setState({ guideCities: true });
                  }

                  if (data[0].tips.length > 0) {
                    component.setState({ tips: true });
                  }
                });
              });
            },

            componentDidMount: function componentDidMount() {
              this.getUser();
            },

            render: function render() {
              var component = this;

              var firstName = "";
              var secondName = "";
              var img = "";

              var user = this.state.user;

              if (user.strava) {
                firstName = user.strava.firstName;
                secondName = user.strava.secondName;
                img = user.strava.profileImg;
              } else if (user.facebook) {
                firstName = user.facebook.firstName;
                secondName = user.facebook.secondName;
                img = user.facebook.profileImg;
              } else if (user.local) {
                firstName = user.local.name;
                img = user.local.profileImg;
              }

              var style = { width: "100px", height: "100px" };

              return React.createElement(
                "div",
                null,
                React.createElement(
                  Modal,
                  {
                    dialogClassName: "profileModal",
                    onEntering: this.getUser,
                    show: this.props.showMessage,
                    backdrop: true,
                    keyboard: true,
                    onHide: this.props.hideMessage
                  },
                  React.createElement(
                    Modal.Header,
                    { closeButton: true },
                    React.createElement(
                      "h4",
                      { className: "sub-title" },
                      " Profile "
                    )
                  ),
                  React.createElement(
                    Modal.Body,
                    null,
                    React.createElement(
                      "h4",
                      null,
                      " ",
                      firstName + " " + secondName,
                      " "
                    ),
                    React.createElement("img", { src: img, style: style }),
                    React.createElement("h4", null, " My Cities "),
                    this.state.user.guideCities
                      ? this.state.user.guideCities.map(function(city, i) {
                          return React.createElement(GuideCity, {
                            key: i,
                            getUser: component.getUser,
                            city: city
                          });
                        })
                      : React.createElement(
                          "p",
                          null,
                          " You haven't made yourself a guide to any cities yet "
                        ),
                    React.createElement("h4", null, " My Tips "),
                    this.state.user.tips
                      ? this.state.user.tips.map(function(tip, i) {
                          var date = new Date(tip.date);
                          return React.createElement(ProfileTip, {
                            key: i + tip.date,
                            tip: tip,
                            date: date,
                            getUser: component.getUser
                          });
                        })
                      : React.createElement(
                          "p",
                          null,
                          " You haven't added any tips yet "
                        )
                  ),
                  React.createElement(
                    Modal.Footer,
                    null,
                    React.createElement(
                      "button",
                      {
                        className: "btn main-btn",
                        onClick: this.props.hideMessage
                      },
                      "Close"
                    )
                  )
                )
              );
            }
          });

          module.exports = Profile;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./GuideCity.js": 31, "./ProfileTip.js": 33 }
    ],
    33: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var ProfileTip = React.createClass({
            displayName: "ProfileTip",

            getInitialState: function getInitialState() {
              return {
                tipEditing: false,
                editedTip: this.props.tip.tip
              };
            },

            componentDidMount: function componentDidMount() {},

            removeTip: function removeTip() {
              var data = { slug: this.props.tip.slug, tip: this.props.tip };
              var component = this;

              $.ajax({
                url: "/api/tips",
                data: data,
                type: "DELETE",
                success: function success(result) {
                  console.log(data);
                  component.props.getUser();
                }
              });
            },

            setTip: function setTip(e) {
              this.setState({ editedTip: e.target.value });
            },

            showTipEditor: function showTipEditor() {
              this.setState({ tipEditing: true });
            },

            sendTip: function sendTip() {
              var data = {
                oldTip: this.props.tip,
                updatedTip: this.state.editedTip
              };
              var component = this;

              $.ajax({
                url: "/api/tips",
                data: data,
                type: "PUT",
                success: function success(result) {
                  console.log(data);
                  component.props.getUser();
                }
              });
            },

            render: function render() {
              var style = { marginRight: "10px" };

              return React.createElement(
                "div",
                null,
                React.createElement(
                  "p",
                  null,
                  " ",
                  this.props.date.toDateString() +
                    " Type: " +
                    this.props.tip.activity,
                  " "
                ),
                " ",
                React.createElement("p", null, " ", this.props.tip.tip, " "),
                React.createElement(
                  "button",
                  {
                    style: style,
                    onClick: this.removeTip,
                    className: "btn main-bth"
                  },
                  "Remove"
                ),
                React.createElement(
                  "button",
                  { onClick: this.showTipEditor, className: "btn main-bth" },
                  "Edit"
                ),
                this.state.tipEditing
                  ? React.createElement(
                      "div",
                      null,
                      React.createElement("textarea", {
                        value: this.state.editedTip,
                        onChange: this.setTip
                      }),
                      React.createElement(
                        "button",
                        { onClick: this.sendTip, className: "btn main-bth" },
                        "Update Tip"
                      )
                    )
                  : null
              );
            }
          });

          module.exports = ProfileTip;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    34: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Option = React.createClass({
            displayName: "Option",

            goToCity: function goToCity() {
              location.replace("/city/" + this.props.city.info.city.slug);
            },

            render: function render() {
              return React.createElement(
                "div",
                {
                  className: "city-options",
                  style: this.props.style,
                  onClick: this.goToCity
                },
                this.props.city.info.city.name +
                  ", " +
                  this.props.city.info.country.name
              );
            }
          });

          module.exports = Option;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    35: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Option = require("./Option.js");
          var SearchBox = React.createClass({
            displayName: "SearchBox",

            getInitialState: function getInitialState() {
              return {
                value: "",
                cities: [],
                matchingCities: [],
                placeHolder: "Search",
                cityNo: 0,
                firstTime: true
              };
            },

            componentDidMount: function componentDidMount() {
              var selectedCity;

              var component = this;
              var url = "/api/citynames";
              $.get(
                url,
                function(data) {
                  this.setState({ cities: data }, function() {});
                }.bind(this)
              );

              $(document).keydown(function(e) {
                var cityNo = component.state.cityNo;

                switch (e.which) {
                  case 38:
                    // up
                    if (cityNo === 0) {
                    } else {
                      cityNo -= 1;
                      component.setState({
                        cityNo: (component.state.cityNo -= 1)
                      });
                    }

                    //console.log(component.state.cityOptions)
                    selectedCity = component.state.cityOptions[cityNo];

                    component.setState(
                      { selectedCity: selectedCity },
                      function() {
                        //console.log(component.state.selectedCity)
                        for (
                          var i = 0;
                          i < component.state.cityOptions.length;
                          i++
                        ) {
                          component.state.cityOptions[i].style = "color: white";
                        }
                        component.state.selectedCity.style =
                          "color: rgb(58, 193, 98)";
                      }
                    );

                    break;

                  case 40:
                    // down
                    if (cityNo === component.state.cityOptions.length - 1) {
                      break;
                    }

                    cityNo += 1;
                    component.setState({
                      cityNo: (component.state.cityNo += 1)
                    });
                    console.log(cityNo);
                    //console.log(component.state.cityOptions)
                    selectedCity = component.state.cityOptions[cityNo];

                    component.setState(
                      { selectedCity: selectedCity },
                      function() {
                        // console.log(component.state.selectedCity)
                        for (
                          var i = 0;
                          i < component.state.cityOptions.length;
                          i++
                        ) {
                          component.state.cityOptions[i].style = "color: white";
                        }

                        component.state.selectedCity.style =
                          "color: rgb(58, 193, 98)";
                      }
                    );
                    break;

                  case 13:
                    var cityName = component.state.selectedCity.innerText.split(
                      ","
                    )[0];
                    var cities = component.state.cities;

                    cities.forEach(function(city) {
                      if (city.info.city.name === cityName) {
                        location.replace("/city/" + city.info.city.slug);
                      }
                    });
                    break;

                  default:
                    return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
              });
            },

            changeValue: function changeValue(e) {
              this.setState({ value: e.target.value, firstTime: true });
            },

            removePlaceholder: function removePlaceholder(e) {
              var component = this;
              this.setState({ placeHolder: "", value: "" }, function() {});
            },

            searchIt: function searchIt(e) {
              var component = this;
              $("body").on("click", function() {
                setTimeout(function() {
                  component.setState({
                    matchingCities: [],
                    firstTime: true,
                    cityNo: 0,
                    value: ""
                  });
                }, 30);
              });

              this.setState({ style: { height: "0px" } });
              var city = this.state.value;
              var cities = this.state.cities;

              var matchingCities = [];

              for (var i = 0; i < cities.length; i++) {
                if (
                  city.substr(0, city.length).toUpperCase() ===
                  cities[i].info.city.name.substr(0, city.length).toUpperCase()
                ) {
                  matchingCities.push(cities[i]);
                }
              }

              matchingCities = matchingCities.splice(0, 5);

              this.setState({ matchingCities: matchingCities }, function() {
                var cityOptions = document.querySelectorAll(".city-options");
                component.setState({ cityOptions: cityOptions }, function() {
                  if (component.state.firstTime) {
                    var selectedCity = component.state.cityOptions[0];

                    component.setState(
                      { selectedCity: selectedCity },
                      function() {
                        //console.log(component.state.selectedCity)
                        for (
                          var i = 0;
                          i < component.state.cityOptions.length;
                          i++
                        ) {
                          component.state.cityOptions[i].style = "color: white";
                        }
                        component.state.selectedCity.style =
                          "color: rgb(58, 193, 98)";
                      }
                    );

                    component.setState({ firstTime: false });
                  }
                });
              });
              this.setState({ style: { height: "auto" } });
            },

            selectValue: function selectValue(e) {
              var city = e.target.value;
              var cityName = city.split(",")[0];
              var cities = this.state.cities;

              cities.forEach(function(city) {
                if (city.info.city.name === cityName) {
                  location.replace("/city/" + city.info.city.slug);
                }
              });
            },

            render: function render() {
              var component = this;
              return React.createElement(
                "div",
                { className: "search-box" },
                React.createElement("input", {
                  type: "text",
                  placeholder: this.state.placeHolder,
                  value: this.state.value,
                  onClick: this.removePlaceholder,
                  onChange: this.changeValue,
                  onKeyUp: this.searchIt,
                  onSelect: this.selectValue
                }),
                React.createElement(
                  "div",
                  { className: "search-dropdown" },
                  this.state.matchingCities.map(function(city, i) {
                    return React.createElement(Option, {
                      ref: i,
                      style: component.state.style,
                      key: city.info.city.slug,
                      city: city
                    });
                  })
                )
              );
            }
          });

          module.exports = SearchBox;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./Option.js": 34 }
    ],
    36: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var SideBar = React.createClass({
            displayName: "SideBar",

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("h4", null, " About "),
                React.createElement(
                  "p",
                  null,
                  " We bring communities of athletes together around the world by making travel easier. "
                ),
                React.createElement("p", null, " Nothing more, nothing less ")
              );
            }
          });

          module.exports = SideBar;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    37: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var TopCity = require("./TopCity.js");
          var DataDisplay = React.createClass({
            displayName: "DataDisplay",

            getInitialState: function getInitialState() {
              return {
                running: [],
                riding: [],
                hotel: [],
                altitude: [],
                data: false
              };
            },

            componentDidMount: function componentDidMount() {
              var url = "/api/totals";
              $.get(
                url,
                function(data) {
                  this.setState({
                    running: data.running,
                    riding: data.riding,
                    altitude: data.elevation,
                    hotel: data.cost
                  });
                }.bind(this)
              );
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("h4", null, " Top Cities "),
                React.createElement("h5", null, " Total Runners "),
                this.state.running.map(function(city, i) {
                  return React.createElement(TopCity, {
                    key: city.info.city.slug + i,
                    city: city
                  });
                }),
                React.createElement("h5", null, " Total Riders "),
                this.state.riding.map(function(city, i) {
                  return React.createElement(TopCity, {
                    key: city.info.city.slug + i,
                    city: city
                  });
                }),
                React.createElement("h5", null, " Highest "),
                this.state.altitude.map(function(city, i) {
                  return React.createElement(TopCity, {
                    key: city.info.city.slug + i,
                    city: city
                  });
                }),
                React.createElement("h5", null, " Cheapest "),
                this.state.hotel.map(function(city, i) {
                  return React.createElement(TopCity, {
                    key: city.info.city.slug + i,
                    city: city
                  });
                })
              );
            }
          });

          module.exports = DataDisplay;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./TopCity.js": 39 }
    ],
    38: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var TopCity = require("./TopCity.js");
          var SimilarCities = React.createClass({
            displayName: "SimilarCities",

            getInitialState: function getInitialState() {
              return {
                cities: [],
                data: false
              };
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("h4", null, " Similar Cities "),
                this.props.cities.map(function(city, i) {
                  return React.createElement(TopCity, {
                    key: city.info.city.slug + i,
                    city: city
                  });
                })
              );
            }
          });

          module.exports = SimilarCities;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./TopCity.js": 39 }
    ],
    39: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var TopCity = React.createClass({
            displayName: "TopCity",

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement(
                  "a",
                  { href: "/city/" + this.props.city.info.city.slug },
                  " ",
                  this.props.city.info.city.name,
                  ", ",
                  this.props.city.info.country.name,
                  " "
                )
              );
            }
          });

          module.exports = TopCity;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    40: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var CityGuideInfo = require("../city-guides/CityGuideInfo.js");
          var Guide = require("../city-guides/Guide.js");
          var GuideContact = require("../city-guides/GuideContact.js");

          var CityGuides = React.createClass({
            displayName: "CityGuides",

            getInitialState: function getInitialState() {
              return {
                runningGroups: [],
                ridingGroups: [],
                showInfo: false,
                guideContact: false
              };
            },

            showCityGuideInfo: function showCityGuideInfo() {
              this.setState({ showInfo: true });
            },

            hideCityGuideInfo: function hideCityGuideInfo() {
              this.setState({ showInfo: false });
            },

            showGuideContact: function showGuideContact(guide) {
              var component = this;
              var user = JSON.parse(document.getElementById("user").innerHTML);
              console.log(guide);
              if (user === "none") {
                this.setState({
                  msg: "You must be logged in to message a city guide."
                });
                return;
              }

              this.setState({ chosenGuide: guide }, function() {
                component.setState({ guideContact: true }, function() {
                  var recaptcha2;
                  recaptcha2 = grecaptcha.render("recaptcha2", {
                    sitekey: "6LfeFCITAAAAAMs0b3-ZFfJUNcdgOr_zfb9nnhHr", //Replace this with your Site key
                    theme: "light"
                  });
                });
              });
            },

            hideGuideContact: function hideGuideContact(guide) {
              this.setState({ guideContact: false });
            },

            showLogin: function showLogin() {
              var showLoginEvent = new CustomEvent("showLogin");
              window.dispatchEvent(showLoginEvent);
            },

            render: function render() {
              var component = this;
              return React.createElement(
                "div",
                null,
                React.createElement(
                  "button",
                  {
                    className: "btn main-btn pull-right",
                    onClick: this.showCityGuideInfo
                  },
                  " Want to become a guide? "
                ),
                React.createElement("div", { style: { clear: "both" } }),
                this.props.data.guides.length > 0
                  ? this.props.data.guides.map(function(guide, i) {
                      return React.createElement(Guide, {
                        key: guide.user.id + i,
                        data: guide,
                        showGuide: component.showGuideContact
                      });
                    })
                  : React.createElement(
                      "p",
                      null,
                      " We have no city guides for this city, why not consider being one? "
                    ),
                this.state.msg
                  ? React.createElement(
                      "button",
                      { onClick: this.showLogin, className: "btn btn-warning" },
                      this.state.msg
                    )
                  : null,
                React.createElement(CityGuideInfo, {
                  showMessage: this.state.showInfo,
                  hideMessage: this.hideCityGuideInfo,
                  data: this.props.data
                }),
                React.createElement(GuideContact, {
                  guide: this.state.chosenGuide,
                  showMessage: this.state.guideContact,
                  hideMessage: this.hideGuideContact,
                  data: "test"
                }),
                React.createElement("div", { style: { clear: "both" } })
              );
            }
          });

          module.exports = CityGuides;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {
        "../city-guides/CityGuideInfo.js": 18,
        "../city-guides/Guide.js": 19,
        "../city-guides/GuideContact.js": 20
      }
    ],
    41: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Controls = React.createClass({
            displayName: "Controls",

            render: function render() {
              var runner = {};
              var rider = {};

              if (this.props.selected === "running") {
                runner.color = "rgb(58, 193, 98)";
              } else {
                rider.color = "rgb(58, 193, 98)";
              }

              return React.createElement(
                "div",
                { className: "controls", style: { zIndex: 999 } },
                React.createElement(
                  "h4",
                  { style: runner, onClick: this.props.showRunners },
                  "Running"
                ),
                React.createElement(
                  "h4",
                  { style: rider, onClick: this.props.showRiders },
                  "Riding"
                )
              );
            }
          });

          module.exports = Controls;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    42: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var UserForm = require("./UserForm.js");

          var Description = React.createClass({
            displayName: "Description",

            getInitialState: function getInitialState() {
              return {
                text: this.props.text
              };
            },

            update: function update() {
              var component = this;
              var url = "/api/description" + "?slug=" + this.props.slug;
              $.get(url, function(data) {
                component.setState({ text: data.description.description });
              });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                this.state.text
                  ? React.createElement("h3", null, " ", this.state.text, " ")
                  : React.createElement(UserForm, {
                      update: this.update,
                      type: "description",
                      slug: this.props.slug
                    })
              );
            }
          });

          module.exports = Description;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./UserForm.js": 54 }
    ],
    43: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var cityData = require("../../common/description.js");

          var DescriptionString = React.createClass({
            displayName: "DescriptionString",

            getInitialState: function getInitialState() {
              var city = new cityData(this.props.city);

              return {
                general: city.createWeather().general,
                current: city.createWeather().current
              };
            },

            addDescription: function addDescription() {},

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement("p", null, " ", this.state.current, " "),
                React.createElement("p", null, " ", this.state.general, " ")
              );
            }
          });

          module.exports = DescriptionString;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "../../common/description.js": 2 }
    ],
    44: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var User = React.createClass({
            displayName: "User",

            render: function render() {
              var href = "http://facebook.com/" + this.props.group.id;

              return React.createElement(
                "div",
                {
                  itemScope: true,
                  itemType: "http://schema.org/SportsTeam",
                  className: "single-group"
                },
                React.createElement(
                  "a",
                  { itemProp: "url", target: "_blank", href: href },
                  " ",
                  React.createElement(
                    "h4",
                    { itemProp: "name" },
                    " ",
                    this.props.group.name,
                    " "
                  ),
                  " "
                )
              );
            }
          });

          module.exports = User;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    45: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Group = require("./Group.js");
          var Controls = require("./Controls.js");

          var Main = React.createClass({
            displayName: "Main",

            getInitialState: function getInitialState() {
              return {
                type: "running",
                runningGroups: [],
                ridingGroups: [],
                containerHeight: "400px"
              };
            },

            showRunningGroups: function showRunningGroups() {
              var component = this;

              this.setState({ type: "running" }, function() {
                setTimeout(function() {
                  var height = $(".single-runners-groups").height();
                  console.log(height);
                  component.setState({ containerHeight: height });
                }, 250);
              });
            },

            showRidingGroups: function showRidingGroups() {
              var component = this;
              this.setState({ type: "riding" }, function() {
                setTimeout(function() {
                  var height = $(".single-riders-groups").height();
                  console.log(height);
                  component.setState({ containerHeight: height });
                }, 250);
              });
            },

            componentDidMount: function componentDidMount() {
              var url = "/api/fbookgroups";

              var country = this.props.city.country.name;

              if (this.props.city.city) {
                var cityName = this.props.city.city.name;
              } else {
                var cityName = country;
              }

              var runningQuery = "?query=" + cityName + " running";
              var ridingQuery = "?query=" + cityName + " cycling";

              //FIRE ONE FOR RUNNING
              var component = this;

              $.get(url + runningQuery, function(data) {
                data = JSON.parse(data);
                component.setState({ runningGroups: data.data }, function() {
                  component.showRunningGroups();
                });
              });

              //FIRE ONE FOR RIDING

              $.get(url + ridingQuery, function(data) {
                data = JSON.parse(data);
                component.setState({ ridingGroups: data.data });
              });
            },

            render: function render() {
              var riderStyle;
              var runnerStyle;
              if (this.state.type === "running") {
                riderStyle = {
                  opacity: 1,
                  position: "absolute",
                  top: 20,
                  left: "5000px"
                };
                runnerStyle = {
                  opacity: 1,
                  position: "absolute",
                  top: 20,
                  left: "50%",
                  width: "95%",
                  marginLeft: "-47.5%"
                };
              } else {
                riderStyle = {
                  opacity: 1,
                  position: "absolute",
                  top: 20,
                  left: "50%",
                  width: "95%",
                  marginLeft: "-47.5%"
                };
                runnerStyle = {
                  opacity: 1,
                  position: "absolute",
                  top: 20,
                  left: "-5000px"
                };
              }

              return React.createElement(
                "div",
                null,
                React.createElement(Controls, {
                  showRiders: this.showRidingGroups,
                  showRunners: this.showRunningGroups,
                  selected: this.state.type
                }),
                React.createElement(
                  "div",
                  {
                    style: {
                      position: "relative",
                      overflow: "hidden",
                      height: this.state.containerHeight + 20
                    }
                  },
                  React.createElement(
                    "div",
                    {
                      style: runnerStyle,
                      className: "single-runners-groups row"
                    },
                    this.state.runningGroups.map(function(group) {
                      return React.createElement(Group, {
                        key: group.id,
                        group: group
                      });
                    })
                  ),
                  React.createElement(
                    "div",
                    {
                      style: riderStyle,
                      className: "single-riders-groups row"
                    },
                    this.state.ridingGroups.map(function(group) {
                      return React.createElement(Group, {
                        key: group.id,
                        group: group
                      });
                    })
                  )
                )
              );
            }
          });

          module.exports = Main;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./Controls.js": 41, "./Group.js": 44 }
    ],
    46: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Restaurant = require("./Restaurant.js");

          var Segment = React.createClass({
            displayName: "Segment",

            getInitialState: function getInitialState() {
              return {
                restaurants: [],
                data: true
              };
            },

            componentDidMount: function componentDidMount() {
              var url = "/api/foursquare";

              var query = {};
              query.lat = this.props.city.location.latitude;
              query.long = this.props.city.location.longitude;

              //FIRE ONE FOR RUNNING
              var component = this;

              $.get(url, query, function(data) {
                if (data.length > 0) {
                  component.setState({ restaurants: data, data: true });
                } else {
                  component.setState({ data: false });
                }
              });
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                this.state.data === true
                  ? React.createElement(
                      "div",
                      null,
                      this.state.restaurants.map(function(restaurant) {
                        return React.createElement(Restaurant, {
                          key: restaurant.id,
                          data: restaurant
                        });
                      }),
                      React.createElement(
                        "a",
                        { target: "_blank", href: "http://www.foursquare.com" },
                        React.createElement("img", {
                          className: "pull-right",
                          src: "/public/images/attribution/foursquare.jpg"
                        })
                      )
                    )
                  : React.createElement(
                      "p",
                      null,
                      " No Restaurants Found - We're Working On It "
                    )
              );
            }
          });

          module.exports = Segment;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./Restaurant.js": 48 }
    ],
    47: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var ReactBootstrap =
            typeof window !== "undefined"
              ? window["ReactBootstrap"]
              : typeof global !== "undefined"
              ? global["ReactBootstrap"]
              : null;

          var Overview = React.createClass({
            displayName: "Overview",

            getInitialState: function getInitialState() {
              return {
                flight: ""
              };
            },

            componentDidMount: function componentDidMount() {
              console.log(this.props.data);
              $("i").tooltip();
              //FLIGHT
              /*
            var url = "/api/skyscan"
            var query = {};
            query.origin = "Manchester" //THIS WILL BE CODED ON SERVER IN FUTURE
            query.destination = this.props.data.info.city.name;
             
            $.get(url, query, function(data) {
                component.setState({flight: data});
            });
            */
            },

            render: function render() {
              var date = new Date();
              var currentMonth = date.getMonth();
              var clearFix = { clear: "both" };

              return React.createElement(
                "div",
                { className: "description-overview" },
                React.createElement(
                  "div",
                  { className: "running-riding" },
                  React.createElement(
                    "div",
                    { className: "pull-right" },
                    React.createElement("img", {
                      src: "/public/images/bike.png"
                    }),
                    React.createElement(
                      "p",
                      null,
                      " ",
                      this.props.data.riding.riderCount,
                      " "
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "pull-right" },
                    React.createElement("img", {
                      src: "/public/images/shoe.png"
                    }),
                    React.createElement(
                      "p",
                      null,
                      " ",
                      this.props.data.running.runnerCount,
                      " "
                    )
                  )
                ),
                React.createElement(
                  "div",
                  { className: "description-details" },
                  this.props.data.weather
                    ? React.createElement(
                        "div",
                        null,
                        this.props.data.weather.elevation
                          ? React.createElement(
                              "i",
                              {
                                className: "fa fa-chevron-up",
                                "data-toggle": "tooltip",
                                "data-placement": "bottom",
                                title: "Elevation"
                              },
                              "  ",
                              this.props.data.weather.elevation,
                              "m"
                            )
                          : null,
                        this.props.data.weather.data[currentMonth].hotDays
                          ? React.createElement(
                              "i",
                              {
                                className: "fa fa-sun-o",
                                "data-toggle": "tooltip",
                                "data-placement": "bottom",
                                title: "Hot Days This Month"
                              },
                              "  ",
                              this.props.data.weather.data[currentMonth].hotDays
                            )
                          : null,
                        this.props.data.weather.data[currentMonth].wetDays
                          ? React.createElement(
                              "i",
                              {
                                className: "fa fa-cloud",
                                "data-toggle": "tooltip",
                                "data-placement": "bottom",
                                title: "Wet Days This Month"
                              },
                              "  ",
                              this.props.data.weather.data[currentMonth].wetDays
                            )
                          : null
                      )
                    : null,
                  this.props.data.cost
                    ? React.createElement(
                        "i",
                        {
                          className: "fa fa-coffee",
                          "data-toggle": "tooltip",
                          "data-placement": "bottom",
                          title: "Coffee In Cafe"
                        },
                        "  ",
                        React.createElement(
                          "span",
                          null,
                          "$",
                          this.props.data.cost.coffee_in_cafe.USD
                        )
                      )
                    : null,
                  this.props.data.cost
                    ? React.createElement(
                        "i",
                        {
                          className: "fa fa-beer",
                          "data-toggle": "tooltip",
                          "data-placement": "bottom",
                          title: "Beer in Bar"
                        },
                        "  $",
                        this.props.data.cost.beer_in_cafe.USD
                      )
                    : null,
                  this.props.data.cost
                    ? React.createElement(
                        "i",
                        {
                          className: "fa fa-rss",
                          "data-toggle": "tooltip",
                          "data-placement": "bottom",
                          title: "Internet Speed"
                        },
                        "  ",
                        this.props.data.info.internet.speed.download,
                        "Mbps"
                      )
                    : null,
                  this.props.data.cost
                    ? React.createElement(
                        "i",
                        {
                          className: "fa fa-home",
                          "data-toggle": "tooltip",
                          "data-placement": "bottom",
                          title: "Hotel Cost"
                        },
                        "  $",
                        this.props.data.cost.hotel.USD
                      )
                    : null,
                  this.state.flight
                    ? React.createElement(
                        "i",
                        {
                          className: "fa fa-plane",
                          "data-toggle": "tooltip",
                          "data-placement": "bottom",
                          title: "Flight Cost"
                        },
                        "  $",
                        this.state.flight.price
                      )
                    : null
                )
              );
            }
          });

          module.exports = Overview;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    48: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Restaurant = React.createClass({
            displayName: "Restaurant",

            render: function render() {
              var src;

              if (this.props.data.photo[0]) {
                src =
                  this.props.data.photo[0].prefix +
                  "100x100" +
                  this.props.data.photo[0].suffix;
              } else {
                src = "/public/images/food-placeholder.jpg";
              }

              var link =
                "https://foursquare.com/v/" +
                this.props.data.name +
                "/" +
                this.props.data.id;

              var style = {
                width: "100px",
                height: "100px"
              };

              return React.createElement(
                "div",
                { className: "restaurant col-lg-2 col-sm-3 col-ms-4 col-xs-6" },
                React.createElement(
                  "a",
                  { target: "_blank", href: link },
                  React.createElement("img", { style: style, src: src }),
                  React.createElement("p", null, " ", this.props.data.name, " ")
                )
              );
            }
          });

          module.exports = Restaurant;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    49: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Segment = React.createClass({
            displayName: "Segment",

            getInitialState: function getInitialState() {
              return {
                error: false
              };
            },

            render: function render() {
              var href = "http://www.strava.com/segments/" + this.props.data.id;
              var src =
                "http://maps.google.com/maps/api/staticmap?maptype=terrain&size=" +
                "100" +
                "x" +
                "100" +
                "&key=AIzaSyDZTyENWRBeduSGtY8bBmwstMpKRDUN9YE&sensor=false&path=color:0xFF0000BF|weight:2|enc:";
              if (this.props.data.points.length < 2000) {
                src += this.props.data.points;
              }

              var name = this.props.data.name;

              if (name.length > 25) {
                name = name.substr(0, 25);
              }

              return React.createElement(
                "div",
                {
                  itemScope: true,
                  itemType: "http://schema.org/Map",
                  className: "segment col-lg-2 col-sm-3 col-ms-4 col-xs-6"
                },
                React.createElement(
                  "a",
                  { itemProp: "url", href: href, target: "_blank" },
                  React.createElement("img", {
                    src: src,
                    alt: this.props.data.name
                  }),
                  React.createElement("p", { itemProp: "text" }, " ", name, " ")
                )
              );
            }
          });

          module.exports = Segment;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    50: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var Segment = require("./Segment.js");
          var Controls = require("./Controls.js");

          var Segments = React.createClass({
            displayName: "Segments",

            getInitialState: function getInitialState() {
              return { type: "running", containerHeight: "500px" };
            },

            showRunners: function showRunners() {
              var component = this;

              this.setState({ type: "running" }, function() {
                setTimeout(function() {
                  var height = $(".single-runners-segments").height();
                  console.log(height);
                  component.setState({ containerHeight: height });
                }, 250);
              });
            },

            showRiders: function showRiders() {
              var component = this;
              this.setState({ type: "riding" }, function() {
                setTimeout(function() {
                  var height = $(".single-riders-segments").height();
                  console.log(height);
                  component.setState({ containerHeight: height });
                }, 250);
              });
            },

            componentDidMount: function componentDidMount() {
              this.showRunners();
            },

            render: function render() {
              var riderStyle;
              var runnerStyle;
              if (this.state.type === "running") {
                riderStyle = {
                  opacity: 1,
                  position: "absolute",
                  top: 20,
                  left: "5000px"
                };
                runnerStyle = {
                  opacity: 1,
                  position: "absolute",
                  top: 20,
                  left: 0
                };
              } else {
                riderStyle = {
                  opacity: 1,
                  position: "absolute",
                  top: 20,
                  left: 0
                };
                runnerStyle = {
                  opacity: 1,
                  position: "absolute",
                  top: 20,
                  left: "-5000px"
                };
              }

              return React.createElement(
                "div",
                null,
                React.createElement(Controls, {
                  showRiders: this.showRiders,
                  showRunners: this.showRunners,
                  selected: this.state.type
                }),
                React.createElement(
                  "div",
                  {
                    style: {
                      position: "relative",
                      overflow: "hidden",
                      height: this.state.containerHeight + 20
                    }
                  },
                  React.createElement(
                    "div",
                    {
                      style: runnerStyle,
                      className: "single-runners-segments row"
                    },
                    this.props.runningSegments.map(function(segment) {
                      return React.createElement(Segment, {
                        key: segment.id,
                        data: segment
                      });
                    })
                  ),
                  React.createElement(
                    "div",
                    {
                      style: riderStyle,
                      className: "single-riders-segments row"
                    },
                    this.props.ridingSegments.map(function(segment) {
                      return React.createElement(Segment, {
                        key: segment.id,
                        data: segment
                      });
                    })
                  )
                )
              );
            }
          });

          module.exports = Segments;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./Controls.js": 41, "./Segment.js": 49 }
    ],
    51: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Tips = React.createClass({
            displayName: "Tips",

            render: function render() {
              //STYLES

              var imgStyle = {
                width: "25px",
                height: "25px",
                float: "left",
                margin: "0 10px 10px 0px"
              };

              var clearFix = {
                clear: "both",
                marginTop: "20px"

                //CONVERT DATE
              };
              var date = new Date(Date.parse(this.props.data.date));
              date = date.toDateString();

              return React.createElement(
                "div",
                {
                  style: clearFix,
                  itemScope: true,
                  itemType: "http://schema.org/Comment"
                },
                React.createElement("img", {
                  style: imgStyle,
                  src: this.props.data.user.img
                }),
                React.createElement(
                  "p",
                  { itemProp: "author" },
                  " ",
                  this.props.data.user.firstName,
                  " | ",
                  date,
                  "  "
                ),
                React.createElement(
                  "p",
                  { itemProp: "text" },
                  " ",
                  this.props.data.tip,
                  " "
                )
              );
            }
          });

          module.exports = Tips;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    52: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var UserForm = require("./UserForm.js");
          var Tip = require("./Tip.js");
          var Controls = require("./Controls.js");

          var Tips = React.createClass({
            displayName: "Tips",

            getInitialState: function getInitialState() {
              return {
                ridingTips: this.props.ridingTips,
                runningTips: this.props.runningTips,
                type: "running",
                containerHeight: "500px"
              };
            },

            componentDidMount: function componentDidMount() {
              this.showRunningTips();
              //this.getTips();
            },

            getTips: function getTips() {
              var component = this;
              var url = "/api/tips?slug=" + this.props.slug;
              $.get(url, function(data) {
                console.log(data.running.tips);

                component.setState({
                  runningTips: data.running.tips,
                  ridingTips: data.riding.tips
                });
              });
            },

            showRunningTips: function showRunningTips() {
              var component = this;
              this.setState({ type: "running" }, function() {
                setTimeout(function() {
                  var height = $(".running-tips").height();
                  console.log(height);
                  component.setState({ containerHeight: height });
                }, 250);
              });
            },

            showRidingTips: function showRidingTips() {
              var component = this;
              this.setState({ type: "riding" }, function() {
                setTimeout(function() {
                  var height = $(".riding-tips").height();
                  console.log(height);
                  component.setState({ containerHeight: height });
                }, 250);
              });
            },

            render: function render() {
              var riderStyle;
              var runnerStyle;
              if (this.state.type === "running") {
                riderStyle = { position: "absolute", top: 20, left: "5000px" };
                runnerStyle = { position: "absolute", top: 20, left: 0 };
              } else {
                riderStyle = { position: "absolute", top: 20, left: 0 };
                runnerStyle = {
                  position: "absolute",
                  top: 20,
                  left: "-5000px"
                };
              }

              var runningTips = this.state.runningTips.sort(function(a, b) {
                return new Date(b.date) - new Date(a.date);
              });
              var ridingTips = this.state.ridingTips.sort(function(a, b) {
                return new Date(b.date) - new Date(a.date);
              });

              return React.createElement(
                "div",
                null,
                React.createElement(Controls, {
                  showRiders: this.showRidingTips,
                  showRunners: this.showRunningTips,
                  selected: this.state.type
                }),
                React.createElement(UserForm, {
                  update: this.getTips,
                  slug: this.props.slug,
                  activity: this.state.type
                }),
                React.createElement(
                  "div",
                  {
                    style: {
                      position: "relative",
                      overflow: "hidden",
                      height: this.state.containerHeight + 20
                    }
                  },
                  React.createElement(
                    "div",
                    { style: riderStyle, className: "riding-tips" },
                    ridingTips.map(function(tip) {
                      return React.createElement(Tip, {
                        key: tip.tip + tip.date,
                        data: tip
                      });
                    })
                  ),
                  React.createElement(
                    "div",
                    { style: runnerStyle, className: "running-tips" },
                    runningTips.map(function(tip) {
                      return React.createElement(Tip, {
                        key: tip.tip + tip.date,
                        data: tip
                      });
                    })
                  )
                )
              );
            }
          });

          module.exports = Tips;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./Controls.js": 41, "./Tip.js": 51, "./UserForm.js": 54 }
    ],
    53: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var User = React.createClass({
            displayName: "User",

            getInitialState: function getInitialState() {
              return {};
            },

            componentDidMount: function componentDidMount() {
              $("#" + this.props.athlete.id)
                .on("load", function() {
                  console.log("loading");
                  console.log(this.props.athlete.id);
                })
                .on("error", function() {
                  console.log("error found");
                  $(this).attr("src", "/public/images/profile.png");
                });
            },

            checkError: function checkError() {
              console.log("error found");
            },

            render: function render() {
              var href =
                "http://www.strava.com/athletes/" + this.props.athlete.id;

              if (this.props.athlete.pic === "avatar/athlete/large.png") {
                return null;
              } else {
                return React.createElement(
                  "div",
                  {
                    itemScope: true,
                    itemType: "http://schema.org/Person",
                    className: "athlete col-lg-2 col-sm-3 col-ms-4 col-xs-6"
                  },
                  React.createElement(
                    "div",
                    { style: { opacity: 0, height: "0px" }, itemProp: "name" },
                    this.props.athlete.name
                  ),
                  React.createElement(
                    "a",
                    { itemProp: "url", href: href, target: "_blank" },
                    React.createElement("img", {
                      id: this.props.athlete.id,
                      onError: this.checkError,
                      className: "athlete-img",
                      src: this.props.athlete.pic,
                      alt: this.props.athlete.name,
                      "data-toggle": "tooltip",
                      "data-placement": "top",
                      title: this.props.athlete.name
                    })
                  )
                );
              }
            }
          });

          module.exports = User;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    54: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          function _defineProperty(obj, key, value) {
            if (key in obj) {
              Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
              });
            } else {
              obj[key] = value;
            }
            return obj;
          }

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var Main = React.createClass({
            displayName: "Main",

            getInitialState: function getInitialState() {
              return {
                message: "",
                activityChosen: false,
                userMsg: "",
                msgClass: "alert alert-success",
                signedIn: false,
                captcha: false
              };
            },

            postData: function postData() {
              var component = this;
              var body;
              var url;

              body = {
                slug: this.props.slug,
                tip: this.state.data,
                activity: this.props.activity,
                googleVerify: this.state.googleVerify
              };
              url = "/api/tips";

              var user = JSON.parse(document.getElementById("user").innerHTML);

              if (user === "none") {
                this.setState({
                  userMsg: "You must be logged in to submit a tip"
                });
                return;
              } else {
                this.setState({ signedIn: true });
              }

              $.post(url, body, function(data) {
                console.log(data);

                if (data.success) {
                  component.setState({
                    msgClass: "alert alert-success",
                    userMsg: data.msg,
                    data: ""
                  });
                  component.props.update();
                  grecaptcha.reset();
                } else {
                  grecaptcha.reset();
                  component.setState({
                    msgClass: "alert alert-warning",
                    userMsg: data.msg,
                    data: ""
                  });
                  $(".single-form .alert").fadeIn("slow");
                  setTimeout(function() {
                    $(".single-form .alert").fadeOut("slow");
                  }, 3000);
                }
              });
            },

            changeData: function changeData(e) {
              this.setState({ data: e.target.value });

              if (!this.state.captcha) {
                this.setState({ captcha: true }, function() {
                  addTipRecaptcha();
                });
              }
            },

            showLoginModal: function showLoginModal() {
              var showLoginEvent = new CustomEvent("showLogin");
              window.dispatchEvent(showLoginEvent);
            },

            componentDidMount: function componentDidMount() {
              var component = this;

              $("form").submit(function(e) {
                e.preventDefault();
                console.log($(this).serializeArray());
                var body = $(this).serializeArray();
                component.setState({ googleVerify: body[1].value }, function() {
                  component.postData();
                });
              });

              this.setState({
                message: "Add a " + this.props.activity + " tip"
              });

              var user = JSON.parse(document.getElementById("user").innerHTML);

              if (user === "none") {
                this.setState({
                  userMsg: "You must be logged in to submit a tip",
                  signedIn: false
                });
                return;
              } else {
                this.setState({ signedIn: true });
              }
            },

            render: function render() {
              var formStyle;

              if (this.state.signedIn) {
                formStyle = { display: "block" };
              } else {
                formStyle = { display: "none" };
              }

              return React.createElement(
                "div",
                { className: "single-form" },
                React.createElement(
                  "div",
                  { style: formStyle },
                  React.createElement(
                    "p",
                    null,
                    "Add a " + this.props.activity + " tip"
                  ),
                  React.createElement(
                    "form",
                    {
                      className: "tips-form",
                      action: "/recap",
                      method: "post"
                    },
                    React.createElement("textarea", {
                      value: this.state.data,
                      onChange: this.changeData,
                      className: "form-control",
                      name: "tip"
                    }),
                    React.createElement("div", {
                      style: { margin: "10px auto" },
                      id: "recaptcha1"
                    }),
                    React.createElement(
                      "input",
                      _defineProperty(
                        {
                          type: "submit",
                          className: "btn main-btn",
                          value: "Submit " + this.props.activity + " tip"
                        },
                        "type",
                        "submit"
                      )
                    )
                  )
                ),
                this.state.userMsg !== ""
                  ? React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "p",
                        { className: this.state.msgClass },
                        this.state.userMsg
                      )
                    )
                  : null,
                !this.state.signedIn
                  ? React.createElement(
                      "button",
                      {
                        onClick: this.showLoginModal,
                        className: "btn main-btn"
                      },
                      "Login Now"
                    )
                  : null
              );
            }
          });

          module.exports = Main;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      {}
    ],
    55: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;

          var User = require("./User.js");
          var Controls = require("./Controls.js");

          var Users = React.createClass({
            displayName: "Users",

            getInitialState: function getInitialState() {
              return { type: "riding", containerHeight: "500px" };
            },

            showRunners: function showRunners() {
              var component = this;

              this.setState({ type: "running" }, function() {
                setTimeout(function() {
                  var height = $(".single-runners").height();
                  console.log(height);
                  component.setState({ containerHeight: height });
                }, 250);
              });
              setTimeout(function() {
                $(".athlete img").tooltip();
              }, 500);
            },

            showRiders: function showRiders() {
              var component = this;
              this.setState({ type: "riding" }, function() {
                setTimeout(function() {
                  var height = $(".single-riders").height();
                  console.log(height);
                  component.setState({ containerHeight: height });
                }, 250);
              });

              setTimeout(function() {
                $(".athlete img").tooltip();
              }, 500);
            },

            componentDidMount: function componentDidMount() {
              this.showRunners();
            },

            render: function render() {
              var riderStyle;
              var runnerStyle;
              if (this.state.type === "running") {
                riderStyle = { position: "absolute", top: 20, left: "5000px" };
                runnerStyle = { position: "absolute", top: 20, left: 0 };
              } else {
                riderStyle = { position: "absolute", top: 20, left: 0 };
                runnerStyle = {
                  position: "absolute",
                  top: 20,
                  left: "-5000px"
                };
              }

              return React.createElement(
                "div",
                null,
                React.createElement(Controls, {
                  showRiders: this.showRiders,
                  showRunners: this.showRunners,
                  selected: this.state.type
                }),
                React.createElement(
                  "div",
                  {
                    style: {
                      position: "relative",
                      overflow: "hidden",
                      height: this.state.containerHeight + 20
                    }
                  },
                  React.createElement(
                    "div",
                    { style: runnerStyle, className: "single-runners row" },
                    this.props.runners.map(function(runner, i) {
                      return React.createElement(User, {
                        key: "runner" + runner.id + i,
                        athlete: runner
                      });
                    })
                  ),
                  React.createElement(
                    "div",
                    { style: riderStyle, className: "single-riders row" },
                    this.props.riders.map(function(rider, i) {
                      return React.createElement(User, {
                        key: "rider" + rider.id + i,
                        athlete: rider
                      });
                    })
                  )
                )
              );
            }
          });

          module.exports = Users;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./Controls.js": 41, "./User.js": 53 }
    ],
    56: [
      function(require, module, exports) {
        (function(global) {
          "use strict";

          var React =
            typeof window !== "undefined"
              ? window["React"]
              : typeof global !== "undefined"
              ? global["React"]
              : null;
          var DescriptionString = require("./DescriptionString.js");

          var Weather = React.createClass({
            displayName: "Weather",

            getInitialState: function getInitialState() {
              return {
                title: "Weather Data for " + this.props.city,
                container: this.props.container,
                style: { height: "400px" }
              };
            },

            componentDidMount: function componentDidMount() {
              if (!this.props.weather) {
                this.setState({
                  title: "No Weather Data Found - We're Working On It"
                });
                return;
              }

              var container = this.state.container;
              var containerId = "#" + this.state.container;

              var svgIdentifier = this.state.container + "-svg";
              var svgClass = "." + svgIdentifier;

              var d3_time_months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
              ];

              var data = this.props.weather.data;

              //DEFAULT COLORS
              var rain = "#00897B";
              var temp = "#E57373";

              var component = this;

              var height, width, margin, svg;

              margin = { top: 70, right: 70, bottom: 70, left: 70 };

              var containerHeight = $(containerId).height();
              var containerWidth = $(containerId).width();

              setTimeout(function() {
                (width = containerWidth - margin.left - margin.right),
                  (height = containerHeight - margin.top - margin.bottom);
                //CREATE SVG MARGINS
                d3.select(svgClass).remove();
                d3.select(".graph-tooltip").remove();
                makeChart();
              }, 2000);

              window.addEventListener("resize", function(event) {
                var containerHeight = $(containerId).height();
                var containerWidth = $(containerId).width();
                (width = containerWidth - margin.left - margin.right),
                  (height = containerHeight - margin.top - margin.bottom);

                d3.select(svgClass).remove();
                d3.select(".graph-tooltip").remove();
                makeChart();
              });

              function makeChart() {
                //CREATE SVG
                svg = d3
                  .select(containerId)
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .classed(svgIdentifier, true)
                  .append("g")
                  .attr(
                    "transform",
                    "translate(" + margin.left + "," + margin.top + ")"
                  );

                //DEFINE MIN AND MAX VALUES

                var maxTemp = d3.max(data, function(d) {
                  return d.avgTemp;
                });
                var minTemp = d3.min(data, function(d) {
                  return d.avgTemp;
                });
                var maxPrec = d3.max(data, function(d) {
                  return d.totalPrec;
                });
                var minPrec = d3.min(data, function(d) {
                  return d.totalPrec;
                });

                //DEFINE SCALE
                var yTemp = d3.scale
                  .linear()
                  .domain([maxTemp, minTemp])
                  .range([0, height]);

                var yPrec = d3.scale
                  .linear()
                  .domain([maxPrec, minPrec])
                  .range([0, height]);

                var x = d3.scale
                  .ordinal()
                  .domain(d3_time_months)
                  .rangePoints([0, width]);

                //DEFINE AXES

                var xAxis = d3.svg
                  .axis()
                  .scale(x)
                  .orient("bottom");

                var yAxisRight = d3.svg
                  .axis()
                  .scale(yPrec)
                  .orient("right");

                var yAxisLeft = d3.svg
                  .axis()
                  .scale(yTemp)
                  .orient("left");

                addLine(data, x, yTemp, "avgTemp", temp);
                addLine(data, x, yPrec, "totalPrec", rain);

                var tempCircles = createScatter(
                  data,
                  x,
                  yTemp,
                  "avgTemp",
                  "tempPlotGroup",
                  temp
                );
                var rainCircles = createScatter(
                  data,
                  x,
                  yPrec,
                  "totalPrec",
                  "rainPlotGroup",
                  rain
                );

                addAxes(xAxis, yAxisRight, yAxisLeft);

                addLabels(height, margin, width, svg, data);

                addTooltip(x);
              }

              function addAxes(axis1, axis2, axis3) {
                //BUILD AXES
                svg
                  .append("g")
                  .attr("class", "axis")
                  .attr("transform", "translate(" + 0 + "," + height + ")")
                  .call(axis1)
                  .classed("axis", true)
                  .selectAll("text")
                  .attr("y", 0)
                  .attr("x", 9)
                  .attr("dy", ".35em")
                  .attr("transform", "rotate(90)")
                  .style("text-anchor", "start");

                if (checkData(data, "totalPrec")) {
                  svg
                    .append("g")
                    .attr("class", "axis")
                    .style("fill", rain)
                    .attr("transform", "translate(" + width + "," + 0 + ")")
                    .call(axis2)
                    .classed("axis", true);
                }

                if (checkData(data, "avgTemp")) {
                  svg
                    .append("g")
                    .attr("class", "axis")
                    .call(axis3)
                    .classed("axis", true)
                    .style("fill", temp);
                }
              }

              function addTooltip(xAx) {
                //CREATE TOOLTIP
                var tooltip = d3
                  .select(containerId)
                  .append("div")
                  .attr("class", "graph-tooltip")
                  .style("opacity", 0);

                svg
                  .append("rect")
                  .data(data)
                  .attr("class", "overlay")
                  .attr("width", width)
                  .attr("height", height)
                  .on("mouseover", function() {
                    tooltip.style("opacity", 0.6);
                  })
                  .on("mouseout", function() {
                    tooltip.style("opacity", 0);
                  })
                  .on("mousemove", mousemove);

                function mousemove(d) {
                  // GETS X COORDINATE

                  var stops = [];

                  for (var i = 0; i <= 11; i++) {
                    var obj = {
                      month: d3_time_months[i],
                      interval: xAx(d3_time_months[i]) + 40,
                      data: data[i]
                    };
                    stops.push(obj);
                  }

                  //FIND POINT NEAREST TO x0
                  var x0 = d3.mouse(this)[0];
                  var y0 = d3.mouse(this)[1];

                  var location;
                  var month;
                  var monthData;

                  for (var i = 0; i < stops.length; i++) {
                    if (stops[i].interval > x0) {
                      location = i;
                      month = stops[i].month;
                      monthData = stops[i].data;

                      break;
                    } else {
                      continue;
                    }
                  }

                  var monthString = "Month: " + month + "<br>";
                  var tempString =
                    "Avg Temp: " + monthData.avgTemp + "&#8451;<br>";
                  var rainString =
                    "Rainfall: " + monthData.totalPrec + " mm<br>";
                  var hotString =
                    "Hot Days: " + (monthData.hotDays || 0) + "<br>";
                  var wetString =
                    "Wet Days: " + (monthData.wetDays || 0) + "<br>";

                  if (!monthData.avgTemp) {
                    tempString = "";
                  }

                  if (!monthData.totalPrec) {
                    rainString = "";
                  }

                  tooltip
                    .style("left", d3.event.pageX - 34 + "px")
                    .style("top", d3.event.pageY - 12 + "px");
                  tooltip.html(
                    monthString +
                      tempString +
                      rainString +
                      hotString +
                      wetString
                  );
                }
              }

              function addLine(data, xAx, scale, value, color) {
                if (checkData(data, value)) {
                  var lineFunction = d3.svg
                    .line()
                    .x(function(d, i) {
                      return xAx(d3_time_months[i]);
                    })
                    .y(function(d) {
                      return scale(d[value]);
                    })
                    .interpolate("linear");

                  var graph = svg
                    .append("path")
                    .attr("d", lineFunction(data))
                    .attr("stroke", color)
                    .attr("stroke-width", 2)
                    .attr("fill", "none")
                    .classed("line", true);

                  var totalLength = graph.node().getTotalLength();

                  graph
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .delay(1000)
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0);
                }
              }

              function createScatter(
                data,
                xAx,
                scale,
                value,
                groupName,
                color
              ) {
                //IF DATA HAS NO NULL VALUES
                if (checkData(data, value)) {
                  //CREATE CIRCLES
                  var scatterPlotGroups = svg
                    .selectAll("." + groupName)
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("class", groupName);

                  var circles = scatterPlotGroups
                    .selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d, i) {
                      return xAx(d3_time_months[i]);
                    })
                    .attr("cy", function(d) {
                      return 0;
                    })
                    .attr("r", 3)
                    .attr("fill", color);

                  circles
                    .transition()
                    .duration(1000)
                    .attr("cy", function(d) {
                      return scale(d[value]);
                    });

                  return circles;
                }
              }

              function addLabels(height, margin, width, svg, data) {
                if (checkData(data, "avgTemp")) {
                  //ADD TEMP LABEL
                  var tempLabel = svg
                    .append("text")
                    .attr("x", 0 - height / 2)
                    .attr("y", 0 - margin.left / 1.5)
                    .style("text-anchor", "middle")
                    .style("fill", temp)
                    .text("Avg Temperature (C)")
                    .attr("transform", "rotate(-90)")
                    .classed("label", true);
                }

                if (checkData(data, "totalPrec")) {
                  //ADD RAIN LABEL
                  var rainLabel = svg
                    .append("text")
                    .attr("x", 0 - height / 2)
                    .attr("y", margin.left + width - margin.right / 2.5)
                    .style("text-anchor", "middle")
                    .style("fill", rain)
                    .text("Total Rain (mm)")
                    .attr("transform", "rotate(-90)")
                    .classed("label", true);
                }

                //ADD X LABEL
                svg
                  .append("text")
                  .attr("x", width / 2)
                  .attr("y", height + margin.bottom / 1.3)
                  .style("text-anchor", "middle")
                  .text("Month")
                  .classed("label", true);
              }

              function checkData(data, value) {
                var completeData = true;

                data.forEach(function(month) {
                  if (month[value] === null) {
                    completeData = false;
                  }
                });

                return completeData;
              }
            },

            render: function render() {
              return React.createElement(
                "div",
                null,
                React.createElement(DescriptionString, {
                  city: this.props.data
                }),
                React.createElement("div", {
                  style: this.state.style,
                  id: this.state.container
                })
              );
            }
          });

          module.exports = Weather;
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./DescriptionString.js": 43 }
    ],
    57: [function(require, module, exports) {}, {}]
  },
  {},
  [29]
);
