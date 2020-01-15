var React = require("react");

var CityGuideInfo = require("../city-guides/CityGuideInfo.js");
var Guide = require("../city-guides/Guide.js");
var GuideContact = require("../city-guides/GuideContact.js");

var CityGuides = React.createClass({
  getInitialState: function() {
    return {
      runningGroups: [],
      ridingGroups: [],
      showInfo: false,
      guideContact: false
    };
  },

  showCityGuideInfo: function() {
    this.setState({ showInfo: true });
  },

  hideCityGuideInfo: function() {
    this.setState({ showInfo: false });
  },

  showGuideContact: function(guide) {
    var component = this;
    var user = JSON.parse(document.getElementById("user").innerHTML);
    console.log(guide);
    if (user === "none") {
      this.setState({ msg: "You must be logged in to message a city guide." });
      return;
    }

    this.setState({ chosenGuide: guide }, function() {
      component.setState({ guideContact: true }, function() {
        var recaptcha2;
        recaptcha2 = grecaptcha.render("recaptcha2", {
          sitekey: "6LfeFCITAAAAAMs0b3-ZFfJUNcdgOr_zfb9nnhHr", //Replace this with your Site key
          theme: "light"
        });
      });
    });
  },

  hideGuideContact: function(guide) {
    this.setState({ guideContact: false });
  },

  showLogin: function() {
    var showLoginEvent = new CustomEvent("showLogin");
    window.dispatchEvent(showLoginEvent);
  },

  render: function() {
    var component = this;
    return (
      <div>
        <button
          className="btn main-btn pull-right"
          onClick={this.showCityGuideInfo}
        >
          {" "}
          Want to become a guide?{" "}
        </button>
        <div style={{ clear: "both" }}></div>
        {this.props.data.guides.length > 0 ? (
          this.props.data.guides.map(function(guide, i) {
            return (
              <Guide
                key={guide.user.id + i}
                data={guide}
                showGuide={component.showGuideContact}
              />
            );
          })
        ) : (
          <p>
            {" "}
            We have no city guides for this city, why not consider being one?{" "}
          </p>
        )}

        {this.state.msg ? (
          <button onClick={this.showLogin} className="btn btn-warning">
            {this.state.msg}
          </button>
        ) : null}

        <CityGuideInfo
          showMessage={this.state.showInfo}
          hideMessage={this.hideCityGuideInfo}
          data={this.props.data}
        />
        <GuideContact
          guide={this.state.chosenGuide}
          showMessage={this.state.guideContact}
          hideMessage={this.hideGuideContact}
          data={"test"}
        />
        <div style={{ clear: "both" }}></div>
      </div>
    );
  }
});

module.exports = CityGuides;
