var React = require("react");
var ReactBootstrap = require("react-bootstrap");
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;

var Location = require("./Location.js");

var Single = require("../Single.js");

var AddCityModal = React.createClass({
  getInitialState: function() {
    return {
      city: "",
      locations: [],
      dataReceived: false
    };
  },

  changeCity: function(e) {
    this.setState({ city: e.target.value });
  },

  geocode: function() {
    //REMOVE ALL DATA FROM PREVIOUS
    this.setState({ dataReceived: false, data: {} });

    var component = this;
    var city = this.state.city;

    $.get("/api/geocode?city=" + city, function(data) {
      console.log(data);
      component.setState({ locations: data });
    });
  },

  getSegments: function(city) {
    var component = this;
    var url = "/api/getsegs";
    var data = city;
    $.post(url, data, function(data) {
      if (data === "error") {
        component.setState({
          statusMsg:
            "We seemed to have encountered an error. Try a different city or email us with your city request."
        });
        return;
      }

      component.setState({ data: data });

      //REMOVE DATA RECEIVED AND CALL WEATHER WHEN IT IS FIXED
      //component.setState({dataReceived: true, statusMsg: "", loader: false})
      component.getWeather();
    }).fail(function(response) {
      component.setState({
        statusMsg:
          "We seemed to have encountered an error. Try a different city or email us with your city request."
      });
    });

    this.setState({ statusMsg: "Loading city data now...", loader: true });
  },

  getWeather: function() {
    var component = this;
    var url = "/api/weather";
    var data = this.state.data;
    $.post(url, data, function(data) {
      console.log(data);
      if (data !== "error") {
        component.setState({
          data: data,
          dataReceived: true,
          statusMsg: "",
          loader: false
        });
      } else {
        component.setState({
          dataReceived: true,
          statusMsg: "We could not find weather data at this moment.",
          loader: false
        });
      }
    });
  },

  declareCity: function(cityChoice) {
    this.setState({ chosenCity: cityChoice }, console.log(this.state));

    var cities = this.state.locations;
    var chosenCity = [];
    cities.forEach(function(city) {
      if (city === cityChoice) {
        console.log(city);
        chosenCity.push(city);
      }
    });

    console.log(chosenCity);
    this.setState({ locations: chosenCity }, this.getSegments(cityChoice));
  },

  destroy: function() {
    this.props.hideMessage();
    $(".add-city-single").fadeOut("slow");
  },

  checkEnter: function(e) {
    console.log(e.keyCode);

    if (e.keyCode === 13) {
      this.geocode();
    }
  },

  render: function() {
    var component = this;

    return (
      <div>
        <Modal
          dialogClassName="addCityModal"
          show={this.props.showMessage}
          backdrop={true}
          keyboard={true}
          onHide={this.destroy}
        >
          <Modal.Header closeButton>
            <h1> City Explorer </h1>
          </Modal.Header>
          <Modal.Body>
            <p> If we do not have a city, you can explore the world here. </p>
            <p>
              {" "}
              We want to add in cities that people will want to represent and
              share,{" "}
            </p>
            <p>
              {" "}
              so if you want to become a cityguide for this city, shoot us an
              email!{" "}
            </p>

            <input
              type="text"
              onChange={this.changeCity}
              value={this.state.city}
              onKeyDown={this.checkEnter}
            />
            <button className="btn filter-btn" onClick={this.geocode}>
              Find City
            </button>

            <div className="location-buttons row">
              {this.state.locations.map(function(city) {
                return (
                  <Location
                    declareCity={component.declareCity}
                    key={city.id}
                    city={city}
                  />
                );
              })}
            </div>

            {this.state.statusMsg ? <p> {this.state.statusMsg} </p> : null}
            {this.state.loader ? <img src="/public/images/loader.gif" /> : null}

            <div className="add-city-single">
              {this.state.dataReceived ? (
                <Single
                  data={this.state.data}
                  weatherContainer={"modal-chart"}
                  addCity={true}
                />
              ) : null}
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.destroy}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = AddCityModal;
