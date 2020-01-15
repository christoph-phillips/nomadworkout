var React = require("react");

var Continent = React.createClass({
  getInitialState: function() {
    return {
      continent: ""
    };
  },

  selectContinent: function(e) {
    this.setState({ continent: e.target.value });
    this.props.selectContinent({ continent: e.target.value });
  },

  render: function() {
    return (
      <div>
        <p> Continent </p>
        <select
          defaultValue=""
          value={this.state.continent}
          onChange={this.selectContinent}
        >
          <option value="">WorldWide</option>
          <option value="asia">Asia</option>
          <option value="europe">Europe</option>
          <option value="north-america">North America</option>
          <option value="south-america">South America</option>
          <option value="africa">Africa</option>
          <option value="middle-east">Middle East</option>
        </select>
      </div>
    );
  }
});

module.exports = Continent;
