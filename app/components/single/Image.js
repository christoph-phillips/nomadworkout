var React = require("react");

var Image = React.createClass({
  componentDidMount: function() {
    var self = this;
    var img = new Image();
    img.onerror = function() {
      self.setState({ src: "/public/images/profile.jpg" });
    };

    img.src = this.state.src;
  },

  getInitialState: function() {
    return { src: "/404.jpg" };
  },

  render: function() {
    return <img src={this.state.src} />;
  }
});

module.exports = Image;
