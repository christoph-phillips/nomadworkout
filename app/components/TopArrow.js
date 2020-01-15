var React = require("react");

var TopArrow = React.createClass({
  goUp: function() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
  },

  render: function() {
    return (
      <div className="arrow-up" onClick={this.goUp}>
        <p className="fa fa-arrow-up" aria-hidden="true"></p>
      </div>
    );
  }
});

module.exports = TopArrow;
