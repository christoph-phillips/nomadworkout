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
            .data(topojson.feature(json, json.objects.countries).features) //get data
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
      var mouseCoords = d3.mouse(d3.select("circle").node().parentElement);

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
