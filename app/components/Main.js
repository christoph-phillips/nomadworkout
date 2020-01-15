var React = require("react");
var Cities = require("./Cities.js");
var Filter = require("./Filter.js");
var Map = require("./map/Map.js");

var Main = React.createClass({
  getInitialState: function() {
    return {
      data: this.props.data,
      view: "list",
      btnMessage: "Map View",
      mapStyle: { display: "none" },
      listStyle: { display: "block" }
    };
  },

  updateCities: function(data) {
    this.setState({ data: data });
  },

  changeView: function() {
    if (this.state.view === "list") {
      this.setState({
        view: "map",
        btnMessage: "List View",
        mapStyle: { display: "block" },
        listStyle: { display: "none" }
      });
    } else {
      this.setState({
        view: "list",
        btnMessage: "Map View",
        mapStyle: { display: "none" },
        listStyle: { display: "block" }
      });
    }
  },

  render: function() {
    return (
      <div>
        <Filter updateCities={this.updateCities} />
        <button
          onClick={this.changeView}
          className="map-toggle main-btn pull-right"
        >
          {this.state.btnMessage}
        </button>
        <div style={{ clear: "both" }}> </div>
        <Map show={this.state.mapStyle} cities={this.state.data} />
        <Cities show={this.state.listStyle} cities={this.state.data} />
      </div>
    );
  }
});

module.exports = Main;
