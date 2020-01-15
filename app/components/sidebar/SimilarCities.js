var React = require("react");

var TopCity = require("./TopCity.js");
var SimilarCities = React.createClass({
  getInitialState: function() {
    return {
      cities: [],
      data: false
    };
  },

  render: function() {
    return (
      <div>
        <h4> Similar Cities </h4>

        {this.props.cities.map(function(city, i) {
          return <TopCity key={city.info.city.slug + i} city={city} />;
        })}
      </div>
    );
  }
});

module.exports = SimilarCities;
