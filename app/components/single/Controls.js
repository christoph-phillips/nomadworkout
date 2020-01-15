var React = require("react");

var Controls = React.createClass({
  render: function() {
    var runner = {};
    var rider = {};

    if (this.props.selected === "running") {
      runner.color = "rgb(58, 193, 98)";
    } else {
      rider.color = "rgb(58, 193, 98)";
    }

    return (
      <div className="controls" style={{ zIndex: 999 }}>
        <h4 style={runner} onClick={this.props.showRunners}>
          Running
        </h4>
        <h4 style={rider} onClick={this.props.showRiders}>
          Riding
        </h4>
      </div>
    );
  }
});

module.exports = Controls;
