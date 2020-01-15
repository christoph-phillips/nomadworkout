var React = require("react");
var ReactBootstrap = require("react-bootstrap");
var Modal = ReactBootstrap.Modal;

var ContactGuide = React.createClass({
  getInitialState: function() {
    return {};
  },

  sendData: function() {
    var component = this;

    $("form").submit(function(e) {
      e.preventDefault();
      console.log($(this));
      var body = $(this).serializeArray();
      console.log(body);
      component.setState({ googleVerify: body[0].value }, function() {
        console.log(this.props);
        var body = {
          guideId: this.props.guide.user.id,
          name: this.state.name,
          subject: this.state.subject,
          info: this.state.info,
          googleVerify: this.state.googleVerify
        };

        if (
          !this.state.infoAdded ||
          !this.state.nameAdded ||
          !this.state.subjectAdded
        ) {
          component.setState({
            msg:
              "You are missing some information in the form, please check again."
          });
          return;
        }

        console.log(body);
        console.log("trying to send data");
        $.post("/api/contactguide", body, function(data) {
          console.log(data);
          grecaptcha.reset();
          component.setState({ msg: data.msg });
        });
      });
    });
  },

  addName: function(e) {
    this.setState({ name: e.target.value, nameAdded: true });
  },

  addSubject: function(e) {
    this.setState({ subject: e.target.value, subjectAdded: true });
  },

  addInfo: function(e) {
    this.setState({ info: e.target.value, infoAdded: true });
  },

  render: function() {
    var component = this;

    return (
      <div>
        <Modal
          className="contact-guide-modal"
          show={this.props.showMessage}
          backdrop={true}
          keyboard={true}
          onHide={this.props.hideMessage}
        >
          <Modal.Header closeButton>
            <h3 className="sub-title">Contact Guide</h3>
          </Modal.Header>
          <Modal.Body>
            <h4 style={{ marginTop: "20px" }} className="text-center">
              {" "}
              Guide Profile{" "}
            </h4>
            {this.props.guide ? (
              <img
                style={{
                  width: "100px",
                  height: "100px",
                  margin: "0px auto",
                  display: "block"
                }}
                src={this.props.guide.user.img}
              />
            ) : null}
            <h5 className="text-center">
              {" "}
              {this.props.guide ? this.props.guide.user.bio : null}{" "}
            </h5>

            <h4 style={{ marginTop: "20px" }} className="text-center">
              {" "}
              Contact{" "}
            </h4>
            <form className="contact-guide">
              <p>Your Name</p>
              <input
                onChange={this.addName}
                value={this.state.name}
                className="form-control"
                type="text"
              ></input>
              <p> Subject </p>
              <input
                onChange={this.addSubject}
                value={this.state.subject}
                className="form-control"
                type="text"
              ></input>
              <p> Message </p>
              <textarea
                onChange={this.addInfo}
                value={this.state.info}
                className="form-control"
              ></textarea>

              <div style={{ margin: "10px auto" }} id="recaptcha2"></div>
              <input
                type="submit"
                className="btn main-btn"
                onClick={this.sendData}
                value={"Submit"}
                type="submit"
              />
            </form>
          </Modal.Body>

          <Modal.Footer>
            {this.state.msg ? (
              <p className="info info-success">{this.state.msg}</p>
            ) : null}
            <button className="btn filter-btn" onClick={this.props.hideMessage}>
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = ContactGuide;
