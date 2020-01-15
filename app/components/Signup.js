var React = require("react");
var ReactBootstrap = require("react-bootstrap");
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;

var SignupModal = React.createClass({
  getInitialState: function() {
    return {
      userOK: false,
      passwordOK: false,
      emailValid: false
    };
  },

  sendForm: function() {
    var component = this;

    //IF PASSWORDS DONT MATCH
    if (component.state.password !== component.state.confirmPassword) {
      component.setState({
        errorMessage:
          "Your passwords do not match, please check again and then submit."
      });
      return;
    }

    //IF PASSWORD OR USER IS NOT ENTERED CORRECTLY / ALREADY USED
    if (!component.state.userOK || !component.state.passwordOK) {
      component.setState({
        errorMessage:
          "There are errors or information missing in the signup form. Please review them and then submit again."
      });
      return;
    }

    //IF THERE IS NO CONFIRM PASSWORD
    if (!component.state.confirmPassword) {
      component.setState({
        errorMessage:
          "There are errors or information missing in the signup form. Please review them and then submit again."
      });
      return;
    }

    if (!component.state.name) {
      component.setState({
        errorMessage:
          "There are errors or information missing in the signup form. Please review them and then submit again."
      });
      return;
    }

    //MAKE PARAMS HERE
    var url = "/signup";

    var username = this.state.user;
    var password = this.state.confirmPassword;
    var name = this.state.name;
    var params =
      "username=" + username + "&password=" + password + "&name=" + name;
    $.post(url, params, function(data) {
      if (data.failure) {
        component.setState({ errorMessage: data.message });
      } else {
        window.location.replace("/");
      }
    });
  },

  checkUsername(e) {
    this.setState({ errorMessage: "" });

    var component = this;

    var user = e.target.value;

    var reg = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
    var test = user.match(reg);
    console.log(test);

    if (!test) {
      component.setState({
        usernameMessage: "That email address is not valid",
        userAlert: "alert alert-warning",
        emailValid: false
      });
      return;
    } else {
      component.setState({ emailValid: true });
    }

    var url = "/checkuser/" + user;

    $.get(url, function(data) {
      component.setState(
        { usernameMessage: data.message, userAlert: data.alert },
        function() {
          if (data.alert === "success") {
            component.setState({ userOK: true });
          } else {
            component.setState({ userOK: false });
          }
        }
      );
    });
  },

  addUser: function(e) {
    var user = e.target.value;
    this.setState({ user: user });
  },

  addPassword: function(e) {
    this.setState({ errorMessage: "" });
    var component = this;
    var password = e.target.value;
    this.setState({ password: password }, function() {
      if (component.state.password === "") {
        component.setState({ passwordMessage: "", passwordAlert: "success" });
      }
    });

    var regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(.{8,})$/;

    var test = password.match(regex);

    if (test) {
      this.setState({
        passwordMessage: "",
        passwordAlert: "success",
        passwordOK: true
      });
    } else {
      this.setState({
        passwordMessage:
          " Your password must be at least 8 characters and contain one uppercase letter, one lowercase letter, and one number",
        passwordAlert: "warning",
        passwordOK: false
      });
    }
  },

  confirmPassword: function(e) {
    this.setState({ errorMessage: "" });
    var component = this;
    this.setState({ confirmPassword: e.target.value }, function() {
      if (component.state.password !== component.state.confirmPassword) {
        component.setState({
          passwordMatch: "Your passwords don't match!",
          confirmPasswordAlert: "warning"
        });
      } else {
        component.setState({
          passwordMatch: "",
          confirmPasswordAlert: "success"
        });
      }
    });
  },

  confirmName: function(e) {
    this.setState({ name: e.target.value });
  },

  createUserMarkup: function(data, alertType) {
    if (!data) {
      return null;
    }

    return {
      __html: '<div class="alert alert-' + alertType + '">' + data + "</div>"
    };
  },

  createPasswordMarkup: function(data, alertType) {
    if (!data) {
      return null;
    }
    return {
      __html: '<div class="alert alert-' + alertType + '">' + data + "</div>"
    };
  },

  createConfirmPasswordMarkup: function(data, alertType) {
    if (!data) {
      return null;
    }
    return {
      __html: '<div class="alert alert-' + alertType + '">' + data + "</div>"
    };
  },

  createErrorMarkup: function(data) {
    if (!data) {
      return null;
    }
    return {
      __html: '<div class="alert alert-' + "danger" + '">' + data + "</div>"
    };
  },

  render: function() {
    var inline = {
      display: "inline"
    };

    var center = {
      textAlign: "center"
    };

    var image = {
      width: "100px",
      height: "100px"
    };

    var form = {
      textAlign: "center"
    };

    var margin = {
      margin: "10px"
    };

    return (
      <div>
        <Modal
          style={center}
          show={this.props.showMessage}
          onHide={this.props.hideMessage}
        >
          <Modal.Body style={center}>
            <h2> Sign Up </h2>
            <a className="btn btn-social btn-facebook" href="/auth/facebook">
              <span className="fa fa-facebook"></span> Sign Up with Facebook
            </a>

            <a className="btn-strava" href="/auth/strava">
              <img src="/public/images/strava-connect.png" />
            </a>

            <h4 className="form-element"> Or Sign Up With Email </h4>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                onChange={this.confirmName}
                value={this.state.name}
                className="form-control"
                name="name"
                id="name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                onBlur={this.addUser}
                onChange={this.checkUsername}
                className="form-control"
                name="username"
                id="username"
              />
            </div>

            <div
              dangerouslySetInnerHTML={this.createUserMarkup(
                this.state.usernameMessage,
                this.state.userAlert
              )}
            />

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                onKeyUp={this.addPassword}
                className="form-control"
                name="password"
              />
            </div>

            <div
              dangerouslySetInnerHTML={this.createPasswordMarkup(
                this.state.passwordMessage,
                this.state.passwordAlert
              )}
            />

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                onKeyUp={this.confirmPassword}
                className="form-control"
                name="confirmpassword"
                id="password"
              />

              <div
                dangerouslySetInnerHTML={this.createConfirmPasswordMarkup(
                  this.state.passwordMatch,
                  this.state.confirmPasswordAlert
                )}
              />
            </div>
            <button
              type="submit"
              onClick={this.sendForm}
              className="btn btn-primary"
            >
              Submit
            </button>

            <div
              dangerouslySetInnerHTML={this.createErrorMarkup(
                this.state.errorMessage
              )}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.props.hideMessage}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = SignupModal;
