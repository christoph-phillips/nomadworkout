var React = require("react");

var Main = React.createClass({
  getInitialState: function() {
    return {
      message: "",
      activityChosen: false,
      userMsg: "",
      msgClass: "alert alert-success",
      signedIn: false,
      captcha: false
    };
  },

  postData: function() {
    var component = this;
    var body;
    var url;

    body = {
      slug: this.props.slug,
      tip: this.state.data,
      activity: this.props.activity,
      googleVerify: this.state.googleVerify
    };
    url = "/api/tips";

    var user = JSON.parse(document.getElementById("user").innerHTML);

    if (user === "none") {
      this.setState({ userMsg: "You must be logged in to submit a tip" });
      return;
    } else {
      this.setState({ signedIn: true });
    }

    $.post(url, body, function(data) {
      console.log(data);

      if (data.success) {
        component.setState({
          msgClass: "alert alert-success",
          userMsg: data.msg,
          data: ""
        });
        component.props.update();
        grecaptcha.reset();
      } else {
        grecaptcha.reset();
        component.setState({
          msgClass: "alert alert-warning",
          userMsg: data.msg,
          data: ""
        });
        $(".single-form .alert").fadeIn("slow");
        setTimeout(function() {
          $(".single-form .alert").fadeOut("slow");
        }, 3000);
      }
    });
  },

  changeData: function(e) {
    this.setState({ data: e.target.value });

    if (!this.state.captcha) {
      this.setState({ captcha: true }, function() {
        addTipRecaptcha();
      });
    }
  },

  showLoginModal: function() {
    var showLoginEvent = new CustomEvent("showLogin");
    window.dispatchEvent(showLoginEvent);
  },

  componentDidMount: function() {
    var component = this;

    $("form").submit(function(e) {
      e.preventDefault();
      console.log($(this).serializeArray());
      var body = $(this).serializeArray();
      component.setState({ googleVerify: body[1].value }, function() {
        component.postData();
      });
    });

    this.setState({ message: "Add a " + this.props.activity + " tip" });

    var user = JSON.parse(document.getElementById("user").innerHTML);

    if (user === "none") {
      this.setState({
        userMsg: "You must be logged in to submit a tip",
        signedIn: false
      });
      return;
    } else {
      this.setState({ signedIn: true });
    }
  },

  render: function() {
    var formStyle;

    if (this.state.signedIn) {
      formStyle = { display: "block" };
    } else {
      formStyle = { display: "none" };
    }

    return (
      <div className="single-form">
        <div style={formStyle}>
          <p>{"Add a " + this.props.activity + " tip"}</p>
          <form className="tips-form" action="/recap" method="post">
            <textarea
              value={this.state.data}
              onChange={this.changeData}
              className="form-control"
              name="tip"
            />
            <div style={{ margin: "10px auto" }} id="recaptcha1"></div>
            <input
              type="submit"
              className="btn main-btn"
              value={"Submit " + this.props.activity + " tip"}
              type="submit"
            />
          </form>
        </div>

        {this.state.userMsg !== "" ? (
          <div>
            <p className={this.state.msgClass}>{this.state.userMsg}</p>
          </div>
        ) : null}
        {!this.state.signedIn ? (
          <button onClick={this.showLoginModal} className="btn main-btn">
            Login Now
          </button>
        ) : null}
      </div>
    );
  }
});

module.exports = Main;
