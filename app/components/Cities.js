var React = require("react");

var City = require("./City.js");

var Cities = React.createClass({
  render: function() {
    return (
      <div style={this.props.show} id="cities-holder">
        <div className="row">
          {this.props.cities.length === 0 ? (
            <h3> No Cities Found, Try A Different Search </h3>
          ) : null}
          {this.props.cities.map(function(city) {
            return <City key={city._id} data={city} />;
          })}
        </div>
      </div>
    );
  }
});

module.exports = Cities;
