var React = require("react");

var Rain = React.createClass({
  getInitialState: function() {
    return {
      maxRain: this.props.maxRain
    };
  },

  changeRain: function(e) {
    this.setState({ maxRain: e.target.value });
    this.props.updateRain({ maxRain: e.target.value });
  },

  render: function() {
    return (
      <div>
        <p> Max Rain Days </p>
        <input
          className="filter-rain"
          onChange={this.changeRain}
          type="range"
          value={this.state.maxRain}
          min={0}
          max={30}
        />
        <p>{this.state.maxRain}</p>
      </div>
    );
  }
});

module.exports = Rain;
