var React = require("react");

var Option = require("./Option.js");
var SearchBox = React.createClass({
  getInitialState: function() {
    return {
      value: "",
      cities: [],
      matchingCities: [],
      placeHolder: "Search",
      cityNo: 0,
      firstTime: true
    };
  },

  componentDidMount: function() {
    var selectedCity;

    var component = this;
    var url = "/api/citynames";
    $.get(
      url,
      function(data) {
        this.setState({ cities: data }, function() {});
      }.bind(this)
    );

    $(document).keydown(function(e) {
      var cityNo = component.state.cityNo;

      switch (e.which) {
        case 38: // up
          if (cityNo === 0) {
          } else {
            cityNo -= 1;
            component.setState({ cityNo: (component.state.cityNo -= 1) });
          }

          //console.log(component.state.cityOptions)
          selectedCity = component.state.cityOptions[cityNo];

          component.setState({ selectedCity: selectedCity }, function() {
            //console.log(component.state.selectedCity)
            for (var i = 0; i < component.state.cityOptions.length; i++) {
              component.state.cityOptions[i].style = "color: white";
            }
            component.state.selectedCity.style = "color: rgb(58, 193, 98)";
          });

          break;

        case 40: // down
          if (cityNo === component.state.cityOptions.length - 1) {
            break;
          }

          cityNo += 1;
          component.setState({ cityNo: (component.state.cityNo += 1) });
          console.log(cityNo);
          //console.log(component.state.cityOptions)
          selectedCity = component.state.cityOptions[cityNo];

          component.setState({ selectedCity: selectedCity }, function() {
            // console.log(component.state.selectedCity)
            for (var i = 0; i < component.state.cityOptions.length; i++) {
              component.state.cityOptions[i].style = "color: white";
            }

            component.state.selectedCity.style = "color: rgb(58, 193, 98)";
          });
          break;

        case 13:
          var cityName = component.state.selectedCity.innerText.split(",")[0];
          var cities = component.state.cities;

          cities.forEach(function(city) {
            if (city.info.city.name === cityName) {
              location.replace("/city/" + city.info.city.slug);
            }
          });
          break;

        default:
          return; // exit this handler for other keys
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
    });
  },

  changeValue: function(e) {
    this.setState({ value: e.target.value, firstTime: true });
  },

  removePlaceholder: function(e) {
    var component = this;
    this.setState({ placeHolder: "", value: "" }, function() {});
  },

  searchIt: function(e) {
    var component = this;
    $("body").on("click", function() {
      setTimeout(function() {
        component.setState({
          matchingCities: [],
          firstTime: true,
          cityNo: 0,
          value: ""
        });
      }, 30);
    });

    this.setState({ style: { height: "0px" } });
    var city = this.state.value;
    var cities = this.state.cities;

    var matchingCities = [];

    for (var i = 0; i < cities.length; i++) {
      if (
        city.substr(0, city.length).toUpperCase() ===
        cities[i].info.city.name.substr(0, city.length).toUpperCase()
      ) {
        matchingCities.push(cities[i]);
      }
    }

    matchingCities = matchingCities.splice(0, 5);

    this.setState({ matchingCities: matchingCities }, function() {
      var cityOptions = document.querySelectorAll(".city-options");
      component.setState({ cityOptions: cityOptions }, function() {
        if (component.state.firstTime) {
          var selectedCity = component.state.cityOptions[0];

          component.setState({ selectedCity: selectedCity }, function() {
            //console.log(component.state.selectedCity)
            for (var i = 0; i < component.state.cityOptions.length; i++) {
              component.state.cityOptions[i].style = "color: white";
            }
            component.state.selectedCity.style = "color: rgb(58, 193, 98)";
          });

          component.setState({ firstTime: false });
        }
      });
    });
    this.setState({ style: { height: "auto" } });
  },

  selectValue: function(e) {
    var city = e.target.value;
    var cityName = city.split(",")[0];
    var cities = this.state.cities;

    cities.forEach(function(city) {
      if (city.info.city.name === cityName) {
        location.replace("/city/" + city.info.city.slug);
      }
    });
  },

  render: function() {
    var component = this;
    return (
      <div className="search-box">
        <input
          type="text"
          placeholder={this.state.placeHolder}
          value={this.state.value}
          onClick={this.removePlaceholder}
          onChange={this.changeValue}
          onKeyUp={this.searchIt}
          onSelect={this.selectValue}
        />
        <div className="search-dropdown">
          {this.state.matchingCities.map(function(city, i) {
            return (
              <Option
                ref={i}
                style={component.state.style}
                key={city.info.city.slug}
                city={city}
              />
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = SearchBox;
