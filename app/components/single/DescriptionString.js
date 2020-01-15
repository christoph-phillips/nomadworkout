var React = require("react");

var cityData = require("../../common/description.js");

var DescriptionString = React.createClass({
  getInitialState: function() {
    var city = new cityData(this.props.city);

    return {
      general: city.createWeather().general,
      current: city.createWeather().current
    };
  },

  addDescription: function() {},

  render: function() {
    return (
      <div>
        <p> {this.state.current} </p>
        <p> {this.state.general} </p>
      </div>
    );
  }
});

module.exports = DescriptionString;
