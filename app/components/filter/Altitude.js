var React = require("react");

var Sort = React.createClass({
  getInitialState: function() {
    return {
      selected: null
    };
  },

  setAlt: function(e) {
    var component = this;

    $(".filter-altitude button").removeClass("filter-btn-selected");

    if (this.state.selected === e.target.value) {
      this.props.updateFilter({ alt: null });
      return;
    }

    $(e.target).addClass("filter-btn-selected");
    this.setState({ selected: e.target.value });
    //SEND TO PARENT HERE

    var alt = e.target.value;

    var lookup = {
      low: { min: -10, max: 500 },
      medium: { min: 500, max: 1000 },
      high: { min: 1000, max: 9000 }
    };

    var altQuery = lookup[alt];

    //SEND TO PARENT HERE
    this.props.updateFilter({ alt: altQuery });
  },

  render: function() {
    return (
      <div>
        <p> Altitude </p>

        <button
          className="btn filter-btn btn-three"
          value="high"
          onClick={this.setAlt}
          data-toggle="tooltip"
          data-placement="top"
          title={"1000m+"}
        >
          High
        </button>
        <button
          className="btn filter-btn btn-three"
          value="medium"
          onClick={this.setAlt}
          data-toggle="tooltip"
          data-placement="top"
          title={"500 - 1000m"}
        >
          Med
        </button>
        <button
          className="btn filter-btn btn-three"
          value="low"
          onClick={this.setAlt}
          data-toggle="tooltip"
          data-placement="top"
          title={"0 - 500m"}
        >
          Low
        </button>
      </div>
    );
  }
});

module.exports = Sort;
