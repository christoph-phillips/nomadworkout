var React = require("react");

var ProfileTip = React.createClass({
  getInitialState: function() {
    return {
      tipEditing: false,
      editedTip: this.props.tip.tip
    };
  },

  componentDidMount: function() {},

  removeTip: function() {
    var data = { slug: this.props.tip.slug, tip: this.props.tip };
    var component = this;

    $.ajax({
      url: "/api/tips",
      data: data,
      type: "DELETE",
      success: function(result) {
        console.log(data);
        component.props.getUser();
      }
    });
  },

  setTip: function(e) {
    this.setState({ editedTip: e.target.value });
  },

  showTipEditor: function() {
    this.setState({ tipEditing: true });
  },

  sendTip: function() {
    var data = { oldTip: this.props.tip, updatedTip: this.state.editedTip };
    var component = this;

    $.ajax({
      url: "/api/tips",
      data: data,
      type: "PUT",
      success: function(result) {
        console.log(data);
        component.props.getUser();
      }
    });
  },

  render: function() {
    var style = { marginRight: "10px" };

    return (
      <div>
        <p>
          {" "}
          {this.props.date.toDateString() +
            " Type: " +
            this.props.tip.activity}{" "}
        </p>{" "}
        <p> {this.props.tip.tip} </p>
        <button style={style} onClick={this.removeTip} className="btn main-bth">
          Remove
        </button>
        <button onClick={this.showTipEditor} className="btn main-bth">
          Edit
        </button>
        {this.state.tipEditing ? (
          <div>
            <textarea
              value={this.state.editedTip}
              onChange={this.setTip}
            ></textarea>
            <button onClick={this.sendTip} className="btn main-bth">
              Update Tip
            </button>
          </div>
        ) : null}
      </div>
    );
  }
});

module.exports = ProfileTip;
