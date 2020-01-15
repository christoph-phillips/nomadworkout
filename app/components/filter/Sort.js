var React = require("react");

var Sort = React.createClass({
  getInitialState: function() {
    return {
      selected: null
    };
  },

  setSort: function(e) {
    var component = this;

    var component = this;
    $(".filter-sort button").removeClass("filter-btn-selected");

    console.log(e.target.value);
    console.log(this.state.selected);
    if (this.state.selected === e.target.value) {
      this.props.updateFilter({ sortBy: null });
      return;
    }

    $(e.target).addClass("filter-btn-selected");
    this.setState({ selected: e.target.value });

    //SEND TO PARENT HERE
    this.props.updateFilter({ sortBy: e.target.value });
  },

  render: function() {
    return (
      <div>
        <p> Sort By </p>
        <button
          className="btn filter-btn btn-two"
          value="running"
          onClick={this.setSort}
        >
          {" "}
          Runners{" "}
        </button>
        <button
          className="btn filter-btn btn-two"
          value="riding"
          onClick={this.setSort}
        >
          {" "}
          Riders{" "}
        </button>
      </div>
    );
  }
});

module.exports = Sort;
