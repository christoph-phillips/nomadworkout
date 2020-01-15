var React = require("react");

var CityImage = React.createClass({
  getInitialState: function() {
    return {
      img: ""
    };
  },

  componentDidMount: function() {
    var component = this;
    var url = "/api/flickr";
    var query = {};
    query.lat = this.props.city.location.latitude;
    query.long = this.props.city.location.longitude;
    query.city = this.props.city.city.name;

    $.get(url, query, function(data) {
      component.setState({ img: data });
    });
  },

  render: function() {
    if (this.props.type === "front") {
      var style = {
        position: "absolute",
        maxWidth: "100%",
        clip: "rect(0px,200px,200px,0px)",
        Zindex: "0"
      };
    } else {
      var style = {
        maxWidth: "100%",
        Zindex: "0",
        float: "right"
      };
    }

    return (
      <div>
        <img style={style} src={this.state.img} />
      </div>
    );
  }
});

module.exports = CityImage;
