var React = require("react");

var LoginModal = require("./Login.js");
var SignupModal = require("./Signup.js");
var AddCityModal = require("./addcity/AddCityModal.js");
var IntroText = require("./IntroText.js");
var Overview = require("./single/Overview.js");
var SearchBox = require("./search-box/SearchBox.js");

var Header = React.createClass({
  getInitialState: function() {
    return {
      showSignupModal: false,
      showLoginModal: false,
      addCityModal: false,
      attr: ""
    };
  },

  componentDidMount: function() {
    var component = this;

    window.addEventListener("showLogin", function() {
      component.setState({ showLoginModal: true });
    });

    if (this.props.type === "single") {
      //IMAGE

      var url = "/api/flickr";
      var query = {};
      query.lat = this.props.data.info.location.latitude;
      query.long = this.props.data.info.location.longitude;
      query.city = this.props.data.info.city.name;
      query.country = this.props.data.info.country.name;
      query.slug = this.props.data.info.city.slug;

      $.get(url, query, function(data) {
        component.setState({ img: data.img, attr: data.attr });
        var style = {
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(" +
            data.img +
            ")"
        };

        component.setState({ style: style });
      });
    }
  },

  showLoginModal: function() {
    this.setState({ showLoginModal: true });
  },

  hideLoginModal: function() {
    this.setState({ showLoginModal: false });
  },

  showSignupModal: function() {
    this.setState({ showSignupModal: true });
  },

  hideSignupModal: function() {
    this.setState({ showSignupModal: false });
  },

  showAddCityModal: function() {
    this.setState({ showAddCityModal: true });
  },

  hideAddCityModal: function() {
    this.setState({ showAddCityModal: false });
  },

  changeModal: function() {
    this.setState({ showLoginModal: false });
    this.setState({ showSignupModal: true });
  },

  render: function() {
    if (this.props.type === "front") {
      var headerStyle = {
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/public/images/header.jpg)"
      };
    } else {
      var headerStyle = this.state.style;
    }

    return (
      <div className="header-holder">
        <div className="header-full" style={headerStyle}>
          <div className="navigation-holder">
            <div className="navbar-header">
              <button
                type="button"
                className="navbar-toggle collapsed"
                data-toggle="collapse"
                data-target="#navbar"
                aria-expanded="false"
                aria-controls="navbar"
              >
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="/">
                NomadWorkout
              </a>
            </div>

            <div
              id="navbar"
              className="navbar-collapse collapse"
              aria-expanded="false"
            >
              <ul className="nav navbar-nav"></ul>
              <ul className="nav navbar-nav navbar-right">
                <li>
                  <a href="/">Home</a>
                </li>
                {/*<li><a href="#" onClick={this.showAddCityModal}>Find Your City</a></li>*/}
                <li>
                  <a href="#" onClick={this.showSignupModal}>
                    Sign Up
                  </a>
                </li>
                <li>
                  <a href="#" onClick={this.showLoginModal}>
                    Login
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {this.props.type === "front" ? (
            <div className="header-intro-search">
              <IntroText />
              <SearchBox />
            </div>
          ) : (
            <div className="single-header-text-holder">
              <h3 className="single-header-text">
                {" "}
                {this.props.data.info.city.name},{" "}
                {this.props.data.info.country.name}{" "}
              </h3>
              <Overview data={this.props.data} />
              <a
                target="_blank"
                className="img-attribution"
                href={this.state.attr}
              >
                Image Author
              </a>
            </div>
          )}

          <LoginModal
            changeModal={this.changeModal}
            showMessage={this.state.showLoginModal}
            hideMessage={this.hideLoginModal}
          />
          <SignupModal
            showMessage={this.state.showSignupModal}
            hideMessage={this.hideSignupModal}
          />
          <AddCityModal
            showMessage={this.state.showAddCityModal}
            hideMessage={this.hideAddCityModal}
          />
        </div>
      </div>
    );
  }
});

module.exports = Header;
