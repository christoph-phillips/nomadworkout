var React = require("react");

var GuideCity = React.createClass({
  removeCity: function() {
    var data = { slug: this.props.city.slug };
    var component = this;

    $.ajax({
      url: "/api/guides",
      data: data,
      type: "DELETE",
      success: function(result) {
        component.props.getUser();
      }
    });
  },

  render: function() {
    return (
      <div>
        <p> {this.props.city.cityName} </p>
        <button onClick={this.removeCity} className="btn main-bth">
          Remove
        </button>
      </div>
    );
  }
});

module.exports = GuideCity;
