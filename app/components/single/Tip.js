var React = require("react");

var Tips = React.createClass({
  render: function() {
    //STYLES

    var imgStyle = {
      width: "25px",
      height: "25px",
      float: "left",
      margin: "0 10px 10px 0px"
    };

    var clearFix = {
      clear: "both",
      marginTop: "20px"
    };

    //CONVERT DATE

    var date = new Date(Date.parse(this.props.data.date));
    date = date.toDateString();

    return (
      <div style={clearFix} itemScope itemType="http://schema.org/Comment">
        <img style={imgStyle} src={this.props.data.user.img} />
        <p itemProp="author">
          {" "}
          {this.props.data.user.firstName} | {date}{" "}
        </p>
        <p itemProp="text"> {this.props.data.tip} </p>
      </div>
    );
  }
});

module.exports = Tips;
