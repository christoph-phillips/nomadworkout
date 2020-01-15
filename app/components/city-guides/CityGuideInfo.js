var React = require("react");
var ReactBootstrap = require("react-bootstrap");
var Modal = ReactBootstrap.Modal;

var CityGuidesInfo = React.createClass({
  getInitialState: function() {
    return {
      bio: ""
    };
  },

  addCityGuide: function() {
    var component = this;

    if (!this.state.bio) {
      this.setState({
        message:
          "You must include a brief description of yourself to become a city guide."
      });
      return;
    }

    var user = JSON.parse(document.getElementById("user").innerHTML);

    if (user !== "none") {
      console.log("has a user");
      var data = {
        slug: this.props.data.info.city.slug,
        cityName:
          this.props.data.info.city.name +
          ", " +
          this.props.data.info.country.name,
        bio: this.state.bio
      };

      $.post("/api/guides", data, function(data) {
        console.log(data);
        component.setState({
          success:
            "Congratulations, you've just added yourself as a city guide!"
        });
      });
    } else {
      this.setState({
        message: "You must be logged in to add yourself as a city guide."
      });
    }
  },

  tweetIt: function() {
    var phrase =
      "I just became a city guide for " +
      this.props.data.info.city.name +
      ", " +
      this.props.data.info.country.name +
      "! #runanywhere #rideanywhere";
    var tweetUrl =
      "https://twitter.com/share?text=" +
      encodeURIComponent(phrase) +
      "." +
      "&url=" +
      "http://www.nomadworkout.com/";

    window.open(tweetUrl);
  },

  fbookIt: function() {
    var title = "My Title";
    var summary = "This is my summary";
    var url = "http://www.nomadworkout.com";
    var image = "http://www.nomadworkout.com/public/images/header.jpg";

    var fb = window.open(
      "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url)
    );
    fb.focus();
  },

  showLoginModal: function() {
    var showLoginEvent = new CustomEvent("showLogin");
    window.dispatchEvent(showLoginEvent);
  },

  setBio: function(e) {
    this.setState({ bio: e.target.value });
  },

  render: function() {
    var component = this;

    return (
      <div>
        <Modal
          show={this.props.showMessage}
          backdrop={true}
          keyboard={true}
          onHide={this.props.hideMessage}
        >
          <Modal.Header closeButton>
            <h3 className="sub-title">City Guides</h3>
          </Modal.Header>
          <Modal.Body>
            <p>
              {" "}
              Our city guides are nice people that want to share the best that
              their cities have to offer with others.{" "}
            </p>
            <p>
              {" "}
              You will get messages from people interested in visiting your
              city, all you have to do is respond and give advice.{" "}
            </p>
            <p>
              {" "}
              Sound like a good idea? We think so. Add a short description of
              yourself and start helping athletes around the world.{" "}
            </p>

            <textarea onChange={this.setBio} value={this.state.bio} />
            <button
              className="btn main-btn btn-block"
              onClick={this.addCityGuide}
            >
              {" "}
              Become a guide for {component.props.data.info.city.name}{" "}
            </button>

            {this.state.message ? (
              <div>
                <p className="alert alert-warning">{this.state.message}</p>{" "}
                <button onClick={this.showLoginModal} className="btn main-btn">
                  Login Now
                </button>
              </div>
            ) : null}
            {this.state.success ? (
              <div>
                <p className="alert alert-success">{this.state.success}</p>{" "}
                <button onClick={this.tweetIt} className="btn main-btn">
                  Tweet Your Friends
                </button>
                <button
                  onClick={this.fbookIt}
                  className="btn btn-social btn-facebook"
                >
                  <span className="fa fa-facebook"></span>Share
                </button>
              </div>
            ) : null}
            {this.state.success ? null : (
              <div className="smallprint">
                <br />
                <p> The SmallPrint </p>
                <p>
                  {" "}
                  We will never share your email address with others and will
                  not share any of your personal details. People will send you a
                  message via this site, and then you can choose to email them
                  back. If you do so, they will then have access to your email
                  address to reply.
                </p>
                <p>
                  {" "}
                  If at any point you would like to stop being a city guide,
                  simply go to your profile and remove yourself.{" "}
                </p>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <button className="btn filter-btn" onClick={this.props.hideMessage}>
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = CityGuidesInfo;
