var React = require("react");

var SideBar = React.createClass({
  render: function() {
    return (
      <div>
        <h4> About </h4>
        <p>
          {" "}
          We bring communities of athletes together around the world by making
          travel easier.{" "}
        </p>
        <p> Nothing more, nothing less </p>
      </div>
    );
  }
});

module.exports = SideBar;
