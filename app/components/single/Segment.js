var React = require("react");

var Segment = React.createClass({
  getInitialState: function() {
    return {
      error: false
    };
  },

  render: function() {
    var href = "http://www.strava.com/segments/" + this.props.data.id;
    var src =
      "http://maps.google.com/maps/api/staticmap?maptype=terrain&size=" +
      "100" +
      "x" +
      "100" +
      "&key=AIzaSyDZTyENWRBeduSGtY8bBmwstMpKRDUN9YE&sensor=false&path=color:0xFF0000BF|weight:2|enc:";
    if (this.props.data.points.length < 2000) {
      src += this.props.data.points;
    }

    var name = this.props.data.name;

    if (name.length > 25) {
      name = name.substr(0, 25);
    }

    return (
      <div
        itemScope
        itemType="http://schema.org/Map"
        className="segment col-lg-2 col-sm-3 col-ms-4 col-xs-6"
      >
        <a itemProp="url" href={href} target="_blank">
          <img src={src} alt={this.props.data.name} />
          <p itemProp="text"> {name} </p>
        </a>
      </div>
    );
  }
});

module.exports = Segment;
