var React = require("react");

var TopCity = React.createClass({
  render: function() {
    return (
      <div>
        <a href={"/city/" + this.props.city.info.city.slug}>
          {" "}
          {this.props.city.info.city.name}, {this.props.city.info.country.name}{" "}
        </a>
      </div>
    );
  }
});

module.exports = TopCity;
