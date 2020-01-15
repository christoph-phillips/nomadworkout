var React = require("react");

var User = React.createClass({
  render: function() {
    var href = "http://facebook.com/" + this.props.group.id;

    return (
      <div
        itemScope
        itemType="http://schema.org/SportsTeam"
        className="single-group"
      >
        <a itemProp="url" target="_blank" href={href}>
          {" "}
          <h4 itemProp="name"> {this.props.group.name} </h4>{" "}
        </a>
      </div>
    );
  }
});

module.exports = User;
