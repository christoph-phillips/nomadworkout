var React = require("react");

var Terrain = React.createClass({
  getInitialState: function() {
    return {
      selected: null
    };
  },

  setTerrain: function(e) {
    var component = this;
    $(".filter-terrain button").removeClass("filter-btn-selected");

    if (this.state.selected === e.target.value) {
      this.props.updateFilter({ terrain: null });
      return;
    }

    $(e.target).addClass("filter-btn-selected");
    this.setState({ selected: e.target.value });
    //SEND TO PARENT HERE
    this.props.updateFilter({ terrain: e.target.value });
  },

  render: function() {
    return (
      <div>
        <p> Terrain </p>
        <button
          className="btn filter-btn btn-two"
          value="hilly"
          onClick={this.setTerrain}
        >
          {" "}
          Hilly{" "}
        </button>
        <button
          className="btn filter-btn btn-two"
          value="flat"
          onClick={this.setTerrain}
        >
          {" "}
          Flat{" "}
        </button>
      </div>
    );
  }
});

module.exports = Terrain;
