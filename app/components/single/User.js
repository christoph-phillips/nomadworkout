var React = require("react");

var User = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    $("#" + this.props.athlete.id)
      .on("load", function() {
        console.log("loading");
        console.log(this.props.athlete.id);
      })
      .on("error", function() {
        console.log("error found");
        $(this).attr("src", "/public/images/profile.png");
      });
  },

  checkError: function() {
    console.log("error found");
  },

  render: function() {
    var href = "http://www.strava.com/athletes/" + this.props.athlete.id;

    if (this.props.athlete.pic === "avatar/athlete/large.png") {
      return null;
    } else {
      return (
        <div
          itemScope
          itemType="http://schema.org/Person"
          className="athlete col-lg-2 col-sm-3 col-ms-4 col-xs-6"
        >
          <div style={{ opacity: 0, height: "0px" }} itemProp="name">
            {this.props.athlete.name}
          </div>
          <a itemProp="url" href={href} target="_blank">
            <img
              id={this.props.athlete.id}
              onError={this.checkError}
              className="athlete-img"
              src={this.props.athlete.pic}
              alt={this.props.athlete.name}
              data-toggle="tooltip"
              data-placement="top"
              title={this.props.athlete.name}
            />
          </a>
        </div>
      );
    }
  }
});

module.exports = User;
