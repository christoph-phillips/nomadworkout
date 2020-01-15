var React = require("react");

var UserForm = require("./UserForm.js");

var Description = React.createClass({
  getInitialState: function() {
    return {
      text: this.props.text
    };
  },

  update: function() {
    var component = this;
    var url = "/api/description" + "?slug=" + this.props.slug;
    $.get(url, function(data) {
      component.setState({ text: data.description.description });
    });
  },

  render: function() {
    return (
      <div>
        {this.state.text ? (
          <h3> {this.state.text} </h3>
        ) : (
          <UserForm
            update={this.update}
            type={"description"}
            slug={this.props.slug}
          />
        )}
      </div>
    );
  }
});

module.exports = Description;
