"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var City = new Schema({
  info: Object,
  scores: Object,
  cost: Object,
  description: Object,

  running: {
    runnerCount: Number,
    segments: Array,
    runners: Array,
    tips: Array
  },

  riding: {
    riderCount: Number,
    segments: Array,
    riders: Array,
    tips: Array
  },

  guides: Array,

  strava: {
    id: String,
    token: String,
    email: String,
    details: Object
  }
});

module.exports = mongoose.model("City", City);
