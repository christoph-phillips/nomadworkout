var React = require("react");

var Restaurant = require("./Restaurant.js");

var Segment = React.createClass({
  getInitialState: function() {
    return {
      restaurants: [],
      data: true
    };
  },

  componentDidMount: function() {
    var url = "/api/foursquare";

    var query = {};
    query.lat = this.props.city.location.latitude;
    query.long = this.props.city.location.longitude;

    //FIRE ONE FOR RUNNING
    var component = this;

    $.get(url, query, function(data) {
      if (data.length > 0) {
        component.setState({ restaurants: data, data: true });
      } else {
        component.setState({ data: false });
      }
    });
  },

  render: function() {
    return (
      <div>
        {this.state.data === true ? (
          <div>
            {this.state.restaurants.map(function(restaurant) {
              return <Restaurant key={restaurant.id} data={restaurant} />;
            })}
            <a target="_blank" href="http://www.foursquare.com">
              <img
                className="pull-right"
                src="/public/images/attribution/foursquare.jpg"
              />
            </a>
          </div>
        ) : (
          <p> No Restaurants Found - We're Working On It </p>
        )}
      </div>
    );
  }
});

module.exports = Segment;
