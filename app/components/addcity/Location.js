var React = require("react");

var Location = React.createClass({
  declareCity: function() {
    this.props.declareCity(this.props.city);
  },

  render: function() {
    return (
      <div className="location-buttons col-lg-4 col-md-4 col-sm-4 col-xs-12">
        <button
          onClick={this.declareCity}
          className="btn filter-btn auto-width"
        >
          {this.props.city.address}
        </button>
      </div>
    );
  }
});

module.exports = Location;
