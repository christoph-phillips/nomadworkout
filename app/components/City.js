var React = require("react");

var CityImage = require("./CityImage.js");

var Main = React.createClass({
  getInitialState: function() {
    return {
      img: "",
      style: {}
    };
  },

  componentDidMount: function() {
    //SET SOME STATE

    var state = {
      city: this.props.data.info.city.name,
      country: this.props.data.info.country.name,
      runners: this.props.data.running.runnerCount,
      riders: this.props.data.riding.riderCount,
      hovered: false,
      class: "city-image"
    };

    this.setState(state);

    //GET IMAGE
    var component = this;
    var url = "/api/flickr";
    var query = {};
    query.lat = this.props.data.info.location.latitude;
    query.long = this.props.data.info.location.longitude;
    query.city = this.props.data.info.city.name;
    query.country = this.props.data.info.country.name;

    $.get(url, query, function(data) {
      component.setState({ img: data.img, attr: data.attr });

      //SET ORIGINAL STYLE
      var src = component.state.img;
      var style = {
        backgroundImage: "url(" + src + ")",
        backgroundPosition: "center center",
        opacity: 1
      };

      component.setState({ style: style });
    });
  },

  onEnter: function() {
    var component = this;
    var src = component.state.img;

    var style = {
      backgroundImage: "url(" + src + ")",
      backgroundPosition: "",
      opacity: 1
    };

    this.setState({ hovered: true, style: style });

    var runnerInterval;
    var riderInterval;

    //RUNNER STATS
    var runners = this.state.runners;
    var runnerCount = 0;
    //var runnerSpeed = (1 / runners) * 100000;
    runnerInterval = setInterval(function() {
      runnerCount += 200;
      component.setState({ runners: runnerCount });

      if (runnerCount >= runners) {
        clearInterval(runnerInterval);
      }
    }, 2);

    this.setState({ runnerInterval: runnerInterval });

    //RIDER STATS
    var riders = this.state.riders;
    var riderCount = 0;
    //var riderSpeed = (1 / riders) * 100000;
    riderInterval = setInterval(function() {
      riderCount += 200;
      component.setState({ riders: riderCount });

      if (riderCount >= riders) {
        clearInterval(riderInterval);
      }
    }, 2);

    this.setState({ riderInterval: riderInterval });
  },

  onLeave: function() {
    this.setState({
      runners: this.props.data.running.runnerCount,
      riders: this.props.data.riding.riderCount
    });

    var runnerInterval = this.state.runnerInterval;
    clearInterval(runnerInterval);

    var riderInterval = this.state.riderInterval;
    clearInterval(riderInterval);

    var component = this;
    var src = component.state.img;
    var style = {
      backgroundImage: "url(" + src + ")",
      backgroundPosition: "center center",
      opacity: 1
    };

    this.setState({ hovered: false, style: style });
  },

  render: function() {
    var url = "/city/" + this.props.data.info.city.slug;

    return (
      <div
        onMouseEnter={this.onEnter}
        onMouseLeave={this.onLeave}
        className="city col-lg-3 col-sm-4 col-ms-6 col-xs-12 "
      >
        <a href={url}>
          <div style={this.state.style} className="city-image">
            <div className="city-data">
              <div className="title">
                <h4>
                  {" "}
                  {this.state.city}, {this.state.country}{" "}
                </h4>
              </div>

              <div className="details">
                <h4> Runners: {this.state.runners} </h4>
                <h4> Riders: {this.state.riders} </h4>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }
});

module.exports = Main;
