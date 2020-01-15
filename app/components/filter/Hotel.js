var React = require("react");

var Hotel = React.createClass({
  getInitialState: function() {
    return {
      minHotelCost: this.props.minCost,
      maxHotelCost: this.props.maxCost
    };
  },

  componentDidMount: function() {
    /*
        var component = this;
        var url = "/api/hotelcost";

        $.get(url, function(data) {
            component.setState({minHotelCost: data[0]})
            component.setState({maxHotelCost: data[1]})
            component.props.updateHotel({minHotelCost: data[0]})
            component.props.updateHotel({maxHotelCost: data[1]})
        });
        */
  },

  changeHotelMin: function(e) {
    this.setState({ minHotelCost: e.target.value });
    this.props.updateHotel({ minHotelCost: e.target.value });
  },

  changeHotelMax: function(e) {
    this.setState({ maxHotelCost: e.target.value });
    this.props.updateHotel({ maxHotelCost: e.target.value });
  },

  render: function() {
    return (
      <div>
        <p> Min Hotel Cost </p>
        <input
          className="filter-runners"
          onChange={this.changeHotelMin}
          type="range"
          value={this.state.minHotelCost}
          min={0}
          max={150}
        />
        <p>${this.state.minHotelCost}</p>

        <p> Max Hotel Cost </p>
        <input
          className="filter-riders"
          onChange={this.changeHotelMax}
          type="range"
          value={this.state.maxHotelCost}
          min={0}
          max={150}
        />
        <p>${this.state.maxHotelCost}</p>
      </div>
    );
  }
});

module.exports = Hotel;
