var React = require("react");

var UserForm = require("./UserForm.js");
var Tip = require("./Tip.js");
var Controls = require("./Controls.js");

var Tips = React.createClass({
  getInitialState: function() {
    return {
      ridingTips: this.props.ridingTips,
      runningTips: this.props.runningTips,
      type: "running",
      containerHeight: "500px"
    };
  },

  componentDidMount: function() {
    this.showRunningTips();
    //this.getTips();
  },

  getTips: function() {
    var component = this;
    var url = "/api/tips?slug=" + this.props.slug;
    $.get(url, function(data) {
      console.log(data.running.tips);

      component.setState({
        runningTips: data.running.tips,
        ridingTips: data.riding.tips
      });
    });
  },

  showRunningTips: function() {
    var component = this;
    this.setState({ type: "running" }, function() {
      setTimeout(function() {
        var height = $(".running-tips").height();
        console.log(height);
        component.setState({ containerHeight: height });
      }, 250);
    });
  },

  showRidingTips: function() {
    var component = this;
    this.setState({ type: "riding" }, function() {
      setTimeout(function() {
        var height = $(".riding-tips").height();
        console.log(height);
        component.setState({ containerHeight: height });
      }, 250);
    });
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

    var runningTips = this.state.runningTips.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    var ridingTips = this.state.ridingTips.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    return (
      <div>
        <Controls
          showRiders={this.showRidingTips}
          showRunners={this.showRunningTips}
          selected={this.state.type}
        />

        <UserForm
          update={this.getTips}
          slug={this.props.slug}
          activity={this.state.type}
        />

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            height: this.state.containerHeight + 20
          }}
        >
          <div style={riderStyle} className="riding-tips">
            {ridingTips.map(function(tip) {
              return <Tip key={tip.tip + tip.date} data={tip} />;
            })}
          </div>

          <div style={runnerStyle} className="running-tips">
            {runningTips.map(function(tip) {
              return <Tip key={tip.tip + tip.date} data={tip} />;
            })}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Tips;
