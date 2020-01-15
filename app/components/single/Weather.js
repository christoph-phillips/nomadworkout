var React = require("react");
var DescriptionString = require("./DescriptionString.js");

var Weather = React.createClass({
  getInitialState: function() {
    return {
      title: "Weather Data for " + this.props.city,
      container: this.props.container,
      style: { height: "400px" }
    };
  },

  componentDidMount: function() {
    if (!this.props.weather) {
      this.setState({ title: "No Weather Data Found - We're Working On It" });
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
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
        var tempString = "Avg Temp: " + monthData.avgTemp + "&#8451;<br>";
        var rainString = "Rainfall: " + monthData.totalPrec + " mm<br>";
        var hotString = "Hot Days: " + (monthData.hotDays || 0) + "<br>";
        var wetString = "Wet Days: " + (monthData.wetDays || 0) + "<br>";

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
          monthString + tempString + rainString + hotString + wetString
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

    function createScatter(data, xAx, scale, value, groupName, color) {
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

  render: function() {
    return (
      <div>
        <DescriptionString city={this.props.data} />
        <div style={this.state.style} id={this.state.container}></div>
      </div>
    );
  }
});

module.exports = Weather;
