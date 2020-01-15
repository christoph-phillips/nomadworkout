var React = require("react");

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
  getInitialState: function() {
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

  updateHotel: function(data) {
    this.setState(data);
  },

  updateSort: function(data) {
    console.log(data);
    this.setState(data);
  },

  filter: function() {
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

  updateTemp: function(data) {
    this.setState(data);
  },

  updateRain: function(data) {
    this.setState(data);
  },

  selectMonth: function(data) {
    this.setState(data);
  },

  setTerrain: function(e) {
    this.setState({ terrain: e.target.value });
  },

  updateTerrain: function(data) {
    this.setState(data);
  },

  updateAlt: function(data) {
    this.setState(data);
  },

  selectContinent: function(data) {
    this.setState(data);
  },

  componentDidMount: function() {
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

  render: function() {
    return (
      <div>
        <div className="row filter-holder">
          <div className="filter-section filter-hotel filter-sort col-lg-4 col-sm-4 col-ms-6 col-xs-12">
            <Hotel
              minCost={this.state.minHotelCost}
              maxCost={this.state.maxHotelCost}
              updateHotel={this.updateHotel}
            />
            <Sort
              defaultStyle={this.state.defaultStyle}
              selectedStyle={this.state.selectedStyle}
              updateFilter={this.updateSort}
              sortBy={this.state.sortBy}
            />
          </div>

          <div className="filter-section filter-temp col-lg-4 col-sm-4 col-ms-6 col-xs-12">
            <Temp
              defaultStyle={this.state.defaultStyle}
              selectedStyle={this.state.selectedStyle}
              updateFilter={this.updateTemp}
              temp={this.state.temp}
            />
          </div>

          <div className="filter-section filter-rain col-lg-4 col-sm-4 col-ms-6 col-xs-12">
            <Rain updateRain={this.updateRain} maxRain={this.state.maxRain} />
          </div>

          <div className="filter-section filter-terrain col-lg-4 col-sm-4 col-ms-6 col-xs-12">
            <Terrain
              defaultStyle={this.state.defaultStyle}
              selectedStyle={this.state.selectedStyle}
              updateFilter={this.updateTerrain}
              terrain={this.state.terrain}
            />
          </div>

          <div className="filter-section filter-altitude col-lg-4 col-sm-4 col-ms-6 col-xs-12">
            <Altitude
              defaultStyle={this.state.defaultStyle}
              selectedStyle={this.state.selectedStyle}
              updateFilter={this.updateAlt}
              alt={this.state.alt}
            />
          </div>

          <div className="filter-section filter-month col-lg-4 col-sm-4 col-ms-6 col-xs-12">
            <Month selectMonth={this.selectMonth} month={this.state.month} />
          </div>

          <div className="filter-section filter-continent col-lg-4 col-sm-4 col-ms-6 col-xs-12">
            <Continent selectContinent={this.selectContinent} />
          </div>
        </div>

        <button className="btn btn-filter-send" onClick={this.filter}>
          Filter
        </button>
      </div>
    );
  }
});

module.exports = Filter;
