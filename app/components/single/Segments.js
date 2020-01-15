var React = require("react");
var Segment = require("./Segment.js");
var Controls = require("./Controls.js");

var Segments = React.createClass({
  getInitialState: function() {
    return { type: "running", containerHeight: "500px" };
  },

  showRunners: function() {
    var component = this;

    this.setState({ type: "running" }, function() {
      setTimeout(function() {
        var height = $(".single-runners-segments").height();
        console.log(height);
        component.setState({ containerHeight: height });
      }, 250);
    });
  },

  showRiders: function() {
    var component = this;
    this.setState({ type: "riding" }, function() {
      setTimeout(function() {
        var height = $(".single-riders-segments").height();
        console.log(height);
        component.setState({ containerHeight: height });
      }, 250);
    });
  },

  componentDidMount: function() {
    this.showRunners();
  },

  render: function() {
    var riderStyle;
    var runnerStyle;
    if (this.state.type === "running") {
      riderStyle = {
        opacity: 1,
        position: "absolute",
        top: 20,
        left: "5000px"
      };
      runnerStyle = { opacity: 1, position: "absolute", top: 20, left: 0 };
    } else {
      riderStyle = { opacity: 1, position: "absolute", top: 20, left: 0 };
      runnerStyle = {
        opacity: 1,
        position: "absolute",
        top: 20,
        left: "-5000px"
      };
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
          <div style={runnerStyle} className="single-runners-segments row">
            {this.props.runningSegments.map(function(segment) {
              return <Segment key={segment.id} data={segment} />;
            })}
          </div>

          <div style={riderStyle} className="single-riders-segments row">
            {this.props.ridingSegments.map(function(segment) {
              return <Segment key={segment.id} data={segment} />;
            })}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Segments;
