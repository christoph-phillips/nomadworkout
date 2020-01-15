var React = require("react");
var ReactBootstrap = require("react-bootstrap");

var Overview = React.createClass({
  getInitialState: function() {
    return {
      flight: ""
    };
  },

  componentDidMount: function() {
    console.log(this.props.data);
    $("i").tooltip();
    //FLIGHT
    /*
        var url = "/api/skyscan"
        var query = {};
        query.origin = "Manchester" //THIS WILL BE CODED ON SERVER IN FUTURE
        query.destination = this.props.data.info.city.name;

        
        $.get(url, query, function(data) {
            component.setState({flight: data});
        });
        */
  },

  render: function() {
    var date = new Date();
    var currentMonth = date.getMonth();
    var clearFix = { clear: "both" };

    return (
      <div className="description-overview">
        <div className="running-riding">
          <div className="pull-right">
            <img src="/public/images/bike.png" />
            <p> {this.props.data.riding.riderCount} </p>
          </div>
          <div className="pull-right">
            <img src="/public/images/shoe.png" />
            <p> {this.props.data.running.runnerCount} </p>
          </div>
        </div>

        <div className="description-details">
          {this.props.data.weather ? (
            <div>
              {this.props.data.weather.elevation ? (
                <i
                  className="fa fa-chevron-up"
                  data-toggle="tooltip"
                  data-placement="bottom"
                  title={"Elevation"}
                >
                  {" "}
                  {this.props.data.weather.elevation}m
                </i>
              ) : null}
              {this.props.data.weather.data[currentMonth].hotDays ? (
                <i
                  className="fa fa-sun-o"
                  data-toggle="tooltip"
                  data-placement="bottom"
                  title={"Hot Days This Month"}
                >
                  {" "}
                  {this.props.data.weather.data[currentMonth].hotDays}
                </i>
              ) : null}
              {this.props.data.weather.data[currentMonth].wetDays ? (
                <i
                  className="fa fa-cloud"
                  data-toggle="tooltip"
                  data-placement="bottom"
                  title={"Wet Days This Month"}
                >
                  {" "}
                  {this.props.data.weather.data[currentMonth].wetDays}
                </i>
              ) : null}
            </div>
          ) : null}

          {this.props.data.cost ? (
            <i
              className="fa fa-coffee"
              data-toggle="tooltip"
              data-placement="bottom"
              title={"Coffee In Cafe"}
            >
              {" "}
              <span>${this.props.data.cost.coffee_in_cafe.USD}</span>
            </i>
          ) : null}
          {this.props.data.cost ? (
            <i
              className="fa fa-beer"
              data-toggle="tooltip"
              data-placement="bottom"
              title={"Beer in Bar"}
            >
              {" "}
              ${this.props.data.cost.beer_in_cafe.USD}
            </i>
          ) : null}
          {this.props.data.cost ? (
            <i
              className="fa fa-rss"
              data-toggle="tooltip"
              data-placement="bottom"
              title={"Internet Speed"}
            >
              {" "}
              {this.props.data.info.internet.speed.download}Mbps
            </i>
          ) : null}
          {this.props.data.cost ? (
            <i
              className="fa fa-home"
              data-toggle="tooltip"
              data-placement="bottom"
              title={"Hotel Cost"}
            >
              {" "}
              ${this.props.data.cost.hotel.USD}
            </i>
          ) : null}
          {this.state.flight ? (
            <i
              className="fa fa-plane"
              data-toggle="tooltip"
              data-placement="bottom"
              title={"Flight Cost"}
            >
              {" "}
              ${this.state.flight.price}
            </i>
          ) : null}
        </div>
      </div>
    );
  }
});

module.exports = Overview;
