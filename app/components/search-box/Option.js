var React = require("react");

var Option = React.createClass({
  goToCity: function() {
    location.replace("/city/" + this.props.city.info.city.slug);
  },

  render: function() {
    return (
      <div
        className="city-options"
        style={this.props.style}
        onClick={this.goToCity}
      >
        {this.props.city.info.city.name +
          ", " +
          this.props.city.info.country.name}
      </div>
    );
  }
});

module.exports = Option;
