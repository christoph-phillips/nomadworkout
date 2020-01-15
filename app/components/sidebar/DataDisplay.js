var React = require("react");

var TopCity = require("./TopCity.js");
var DataDisplay = React.createClass({
  getInitialState: function() {
    return {
      running: [],
      riding: [],
      hotel: [],
      altitude: [],
      data: false
    };
  },

  componentDidMount: function() {
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

  render: function() {
    return (
      <div>
        <h4> Top Cities </h4>

        <h5> Total Runners </h5>
        {this.state.running.map(function(city, i) {
          return <TopCity key={city.info.city.slug + i} city={city} />;
        })}

        <h5> Total Riders </h5>
        {this.state.riding.map(function(city, i) {
          return <TopCity key={city.info.city.slug + i} city={city} />;
        })}

        <h5> Highest </h5>
        {this.state.altitude.map(function(city, i) {
          return <TopCity key={city.info.city.slug + i} city={city} />;
        })}

        <h5> Cheapest </h5>
        {this.state.hotel.map(function(city, i) {
          return <TopCity key={city.info.city.slug + i} city={city} />;
        })}
      </div>
    );
  }
});

module.exports = DataDisplay;
