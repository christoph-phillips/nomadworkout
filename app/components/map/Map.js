var React = require("react");

var MapChart = require("../../common/MapChart.js");

var MapDisplay = React.createClass({
  getInitialState: function() {
    return {
      width: "100%",
      height: 500
    };
  },

  componentDidMount: function() {
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
      component.setState({ width: containerWidth, height: containerHeight });
    });
  },

  componentDidUpdate: function() {
    this.state.CityMap.removeData();
    this.state.CityMap.addData(this.props.cities);
    this.state.CityMap.addEvents();
  },

  render: function() {
    return <div style={this.props.show} id="map-holder"></div>;
  }
});

module.exports = MapDisplay;
