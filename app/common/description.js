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
          " and " + Math.floor(city.riding.riderCount / 10) * 10 + " riders.";
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
            " Average rainfall is " + data[currentMonth].totalPrec + "mm.")
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
        this.convertMonthPeriod(getWetTimes(data)) + " are really hot months.";
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
        points: "kaxrA{rtdRg@Ki@AuAKo@O}K_Ao@Im@OwAMo@Co@Km@CkGq@y@@c@Ec@A",
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
