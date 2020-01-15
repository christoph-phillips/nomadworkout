var React = require("react");

var Group = require("./Group.js");
var Controls = require("./Controls.js");

var Main = React.createClass({
  getInitialState: function() {
    return {
      type: "running",
      runningGroups: [],
      ridingGroups: [],
      containerHeight: "400px"
    };
  },

  showRunningGroups: function() {
    var component = this;

    this.setState({ type: "running" }, function() {
      setTimeout(function() {
        var height = $(".single-runners-groups").height();
        console.log(height);
        component.setState({ containerHeight: height });
      }, 250);
    });
  },

  showRidingGroups: function() {
    var component = this;
    this.setState({ type: "riding" }, function() {
      setTimeout(function() {
        var height = $(".single-riders-groups").height();
        console.log(height);
        component.setState({ containerHeight: height });
      }, 250);
    });
  },

  componentDidMount: function() {
    var url = "/api/fbookgroups";

    var country = this.props.city.country.name;

    if (this.props.city.city) {
      var cityName = this.props.city.city.name;
    } else {
      var cityName = country;
    }

    var runningQuery = "?query=" + cityName + " running";
    var ridingQuery = "?query=" + cityName + " cycling";

    //FIRE ONE FOR RUNNING
    var component = this;

    $.get(url + runningQuery, function(data) {
      data = JSON.parse(data);
      component.setState({ runningGroups: data.data }, function() {
        component.showRunningGroups();
      });
    });

    //FIRE ONE FOR RIDING

    $.get(url + ridingQuery, function(data) {
      data = JSON.parse(data);
      component.setState({ ridingGroups: data.data });
    });
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
      runnerStyle = {
        opacity: 1,
        position: "absolute",
        top: 20,
        left: "50%",
        width: "95%",
        marginLeft: "-47.5%"
      };
    } else {
      riderStyle = {
        opacity: 1,
        position: "absolute",
        top: 20,
        left: "50%",
        width: "95%",
        marginLeft: "-47.5%"
      };
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
          showRiders={this.showRidingGroups}
          showRunners={this.showRunningGroups}
          selected={this.state.type}
        />

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            height: this.state.containerHeight + 20
          }}
        >
          <div style={runnerStyle} className="single-runners-groups row">
            {this.state.runningGroups.map(function(group) {
              return <Group key={group.id} group={group} />;
            })}
          </div>

          <div style={riderStyle} className="single-riders-groups row">
            {this.state.ridingGroups.map(function(group) {
              return <Group key={group.id} group={group} />;
            })}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Main;
