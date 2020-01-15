var React = require("react");
var ReactBootstrap = require("react-bootstrap");

var Modal = ReactBootstrap.Modal;
var GuideCity = require("./GuideCity.js");
var ProfileTip = require("./ProfileTip.js");

var Profile = React.createClass({
  getInitialState: function() {
    return {
      user: {},
      guideCities: false,
      tips: false
    };
  },

  getUser: function() {
    var component = this;
    this.setState({ user: this.props.user });

    $.get("/api/user", function(data) {
      //console.log(data)
      component.setState({ user: data[0] }, function() {
        console.log(this.state.user);
        if (data[0].guideCities.length > 0) {
          component.setState({ guideCities: true });
        }

        if (data[0].tips.length > 0) {
          component.setState({ tips: true });
        }
      });
    });
  },

  componentDidMount: function() {
    this.getUser();
  },

  render: function() {
    var component = this;

    var firstName = "";
    var secondName = "";
    var img = "";

    var user = this.state.user;

    if (user.strava) {
      firstName = user.strava.firstName;
      secondName = user.strava.secondName;
      img = user.strava.profileImg;
    } else if (user.facebook) {
      firstName = user.facebook.firstName;
      secondName = user.facebook.secondName;
      img = user.facebook.profileImg;
    } else if (user.local) {
      firstName = user.local.name;
      img = user.local.profileImg;
    }

    var style = { width: "100px", height: "100px" };

    return (
      <div>
        <Modal
          dialogClassName="profileModal"
          onEntering={this.getUser}
          show={this.props.showMessage}
          backdrop={true}
          keyboard={true}
          onHide={this.props.hideMessage}
        >
          <Modal.Header closeButton>
            <h4 className="sub-title"> Profile </h4>
          </Modal.Header>
          <Modal.Body>
            <h4> {firstName + " " + secondName} </h4>
            <img src={img} style={style} />

            <h4> My Cities </h4>
            {this.state.user.guideCities ? (
              this.state.user.guideCities.map(function(city, i) {
                return (
                  <GuideCity key={i} getUser={component.getUser} city={city} />
                );
              })
            ) : (
              <p> You haven't made yourself a guide to any cities yet </p>
            )}

            <h4> My Tips </h4>
            {this.state.user.tips ? (
              this.state.user.tips.map(function(tip, i) {
                var date = new Date(tip.date);
                return (
                  <ProfileTip
                    key={i + tip.date}
                    tip={tip}
                    date={date}
                    getUser={component.getUser}
                  />
                );
              })
            ) : (
              <p> You haven't added any tips yet </p>
            )}
          </Modal.Body>

          <Modal.Footer>
            <button className={"btn main-btn"} onClick={this.props.hideMessage}>
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = Profile;
