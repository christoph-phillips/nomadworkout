var React = require("react");

var IntroText = React.createClass({
  getInitialState: function() {
    return {
      text: ""
    };
  },

  componentDidMount: function() {
    var cities = ["Amsterdam", "New York", "Medellin", "my dream destination."];

    var component = this;
    var string = "I want to run in " + cities[0];
    var length = string.length;

    var textInterval;

    //STARTS IT OFF
    goForwards(0);

    function goForwards(count) {
      length = string.length;

      textInterval = setInterval(function() {
        count += 1;
        component.setState({ text: string.substr(0, count) });

        if (component.state.text.substr(-3, 3) === "run") {
          clearInterval(textInterval);
          goBackwards(3, cities[0]);
        }

        for (var i = 0; i < cities.length - 1; i++) {
          changeCity(i);
        }

        if (count === length) {
          clearInterval(textInterval);
        }
      }, 100);
    }

    function goBackwards(limit, newCity) {
      var length = component.state.text.length;
      var count = length;
      var backInterval = setInterval(function() {
        count -= 1;
        component.setState({ text: string.substr(0, count) });

        if (count === length - limit) {
          clearInterval(backInterval);
          if (newCity) {
            string = "I want to ride in " + newCity;
            goForwards(count);
          }
        }
      }, 200);
    }

    //FUNCTION TO DECLARE WHEN TO GO TO NEXT CITY
    function changeCity(i) {
      if (
        component.state.text.substr(0 - cities[i].length, cities[i].length) ===
        cities[i]
      ) {
        clearInterval(textInterval);
        goBackwards(cities[i].length, cities[i + 1]);
      }
    }
  },

  render: function() {
    return (
      <div className="intro-text">
        <h1> NomadWorkout </h1>
        <h3>{this.state.text}</h3>
      </div>
    );
  }
});

module.exports = IntroText;
