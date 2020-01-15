"use strict";

var React = require("react");
var ReactDOM = require("react-dom");

var Main = require("./Main.js");
var SideBar = require("./Sidebar.js");
var Single = require("./Single.js");
var Header = require("./Header.js");
var UserHeader = require("./UserHeader.js");
//GET PROPS

var data = JSON.parse(document.getElementById("data").innerHTML);

var user = JSON.parse(document.getElementById("user").innerHTML);

var pageType = document.getElementById("pageType").innerHTML;

var similarCities = document.getElementById("similarCities").innerHTML;

var headerHolder = document.getElementById("header-react-holder");
var sidebarHolder = document.getElementById("sidebar-react-holder");
var mainHolder = document.getElementById("main-react-holder");
var singleHolder = document.getElementById("single-react-holder");

if (user !== "none") {
  ReactDOM.render(
    <UserHeader data={data} user={user} type={pageType} />,
    headerHolder
  );
} else {
  ReactDOM.render(<Header data={data} type={pageType} />, headerHolder);
}

if (similarCities) {
  ReactDOM.render(
    <SideBar data={data} similarCities={JSON.parse(similarCities)} />,
    sidebarHolder
  );
} else {
  ReactDOM.render(<SideBar data={data} />, sidebarHolder);
}

if (mainHolder) {
  ReactDOM.render(<Main data={data} />, mainHolder);
} else if (singleHolder) {
  ReactDOM.render(
    <Single data={data} weatherContainer={"chart"} />,
    singleHolder
  );
}
