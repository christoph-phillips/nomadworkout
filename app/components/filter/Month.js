var React = require("react");

var Month = React.createClass({
  getInitialState: function() {
    return {
      month: this.props.month
    };
  },

  selectMonth: function(e) {
    this.setState({ month: +e.target.value });
    this.props.selectMonth({ month: +e.target.value });
  },

  render: function() {
    return (
      <div>
        <p> I want to go in: </p>
        <select value={this.state.month} onChange={this.selectMonth}>
          <option value="0">January</option>
          <option value="1">February</option>
          <option value="2">March</option>
          <option value="3">April</option>
          <option value="4">May</option>
          <option value="5">June</option>
          <option value="6">July</option>
          <option value="7">August</option>
          <option value="8">September</option>
          <option value="9">October</option>
          <option value="10">November</option>
          <option value="11">December</option>
        </select>
      </div>
    );
  }
});

module.exports = Month;
