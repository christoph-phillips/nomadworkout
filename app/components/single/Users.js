var React = require("react");

var User = require("./User.js");
var Controls = require("./Controls.js");

var Users = React.createClass({
  getInitialState: function() {
    return { type: "riding", containerHeight: "500px" };
  },

  showRunners: function() {
    var component = this;

    this.setState({ type: "running" }, function() {
      setTimeout(function() {
        var height = $(".single-runners").height();
        console.log(height);
        component.setState({ containerHeight: height });
      }, 250);
    });
    setTimeout(function() {
      $(".athlete img").tooltip();
    }, 500);
  },

  showRiders: function() {
    var component = this;
    this.setState({ type: "riding" }, function() {
      setTimeout(function() {
        var height = $(".single-riders").height();
        console.log(height);
        component.setState({ containerHeight: height });
      }, 250);
    });

    setTimeout(function() {
      $(".athlete img").tooltip();
    }, 500);
  },

  componentDidMount: function() {
    this.showRunners();
  },

  render: function() {
    var riderStyle;
    var runnerStyle;
    if (this.state.type === "running") {
      riderStyle = { position: "absolute", top: 20, left: "5000px" };
      runnerStyle = { position: "absolute", top: 20, left: 0 };
    } else {
      riderStyle = { position: "absolute", top: 20, left: 0 };
      runnerStyle = { position: "absolute", top: 20, left: "-5000px" };
    }

    return (
      <div>
        <Controls
          showRiders={this.showRiders}
          showRunners={this.showRunners}
          selected={this.state.type}
        />

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            height: this.state.containerHeight + 20
          }}
        >
          <div style={runnerStyle} className="single-runners row">
            {this.props.runners.map(function(runner, i) {
              return <User key={"runner" + runner.id + i} athlete={runner} />;
            })}
          </div>

          <div style={riderStyle} className="single-riders row">
            {this.props.riders.map(function(rider, i) {
              return <User key={"rider" + rider.id + i} athlete={rider} />;
            })}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Users;
