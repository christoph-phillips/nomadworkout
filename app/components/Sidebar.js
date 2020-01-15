var React = require("react");

var DataDisplay = require("./sidebar/DataDisplay.js");
var About = require("./sidebar/About.js");
var SimilarCities = require("./sidebar/SimilarCities.js");

var SideBar = React.createClass({
  render: function() {
    return (
      <div>
        <About />
        {this.props.similarCities ? (
          <SimilarCities cities={this.props.similarCities} />
        ) : null}
        <DataDisplay />
      </div>
    );
  }
});

module.exports = SideBar;
