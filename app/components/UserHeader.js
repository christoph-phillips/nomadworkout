var React = require("react");

var LoginModal = require("./Login.js");
var SignupModal = require("./Signup.js");
var IntroText = require("./IntroText.js");
var Overview = require("./single/Overview.js");
var AddCityModal = require("./addcity/AddCityModal.js");
var ProfileModal = require("./profile/ProfileModal.js");
var SearchBox = require("./search-box/SearchBox.js");

var Header = React.createClass({
  getInitialState: function() {
    return {
      attr: "",
      showAddCityModal: false
    };
  },

  showAddCityModal: function() {
    this.setState({ showAddCityModal: true });
  },

  hideAddCityModal: function() {
    this.setState({ showAddCityModal: false });
  },

  showProfileModal: function() {
    this.setState({ showProfileModal: true });
  },

  hideProfileModal: function() {
    this.setState({ showProfileModal: false });
  },

  componentDidMount: function() {
    this.setState({
      logoutHref: "/logout?redirect=" + window.location.pathname
    });

    if (this.props.type === "single") {
      //IMAGE
      var component = this;
      var url = "/api/flickr";
      var query = {};
      query.lat = this.props.data.info.location.latitude;
      query.long = this.props.data.info.location.longitude;
      query.city = this.props.data.info.city.name;
      query.country = this.props.data.info.country.name;

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
              {/* <li><a href="#" onClick={this.showAddCityModal}>Find Your City</a></li> */}
              <li>
                <a href="#" onClick={this.showProfileModal}>
                  Profile
                </a>
              </li>
              <li>
                <a href={this.state.logoutHref}>Logout</a>
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

        <AddCityModal
          showMessage={this.state.showAddCityModal}
          hideMessage={this.hideAddCityModal}
        />
        <ProfileModal
          user={this.props.user}
          showMessage={this.state.showProfileModal}
          hideMessage={this.hideProfileModal}
        />
      </div>
    );
  }
});

module.exports = Header;
