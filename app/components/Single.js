var React = require("react");
var ReactBootstrap = require("react-bootstrap");

var Segments = require("./single/Segments.js");
var Groups = require("./single/Groups.js");
var Users = require("./single/Users.js");
var CityImage = require("./CityImage.js");
var Nutrition = require("./single/Nutrition.js");
var Tips = require("./single/Tips.js");
var UserForm = require("./single/UserForm.js");
var Description = require("./single/Description.js");
var Weather = require("./single/Weather.js");
var CityGuides = require("./single/CityGuides.js");
var TopArrow = require("./TopArrow.js");

var Single = React.createClass({
  getInitialState: function() {
    return {
      data: this.props.data,
      flight: ""
    };
  },

  render: function() {
    var clearFix = { clear: "both" };

    return (
      <div>
        <div className="single-users">
          <h3 className="sub-title"> Athletes </h3>
          <Users
            riders={this.state.data.riding.riders}
            runners={this.state.data.running.runners}
          />
        </div>

        <div style={{ clear: "both" }}> </div>

        {!this.props.addCity ? (
          <div className="single-city-guides">
            <h3 className="sub-title"> City Guides </h3>
            <CityGuides data={this.state.data} />
          </div>
        ) : null}

        <div className="single-segments">
          <h3 className="sub-title"> Popular Segments </h3>
          <Segments
            ridingSegments={this.state.data.riding.segments}
            runningSegments={this.state.data.running.segments}
          />
        </div>

        <div className="single-groups">
          <h3 className="sub-title"> Groups </h3>
          <Groups city={this.state.data.info} />
        </div>

        {this.state.data.weather ? (
          <div className="single-weather">
            <h3 className="sub-title"> Weather </h3>
            <Weather
              container={this.props.weatherContainer}
              city={
                this.state.data.info.city
                  ? this.state.data.info.city.name
                  : null
              }
              weather={this.state.data.weather}
              data={this.state.data}
            />
          </div>
        ) : null}

        <div className="single-nutrition">
          <h3 className="sub-title"> Nutrition </h3>
          <Nutrition city={this.state.data.info} />
        </div>

        <div style={clearFix}> </div>

        {!this.props.addCity ? (
          <div className="single-tips">
            <h3 className="sub-title"> Tips </h3>
            <Tips
              slug={this.state.data.info.city.slug}
              runningTips={this.state.data.running.tips}
              ridingTips={this.state.data.riding.tips}
            />
          </div>
        ) : null}

        {!this.props.addCity ? <TopArrow /> : null}
      </div>
    );
  }
});

module.exports = Single;
