var _ = require("underscore");
var defaults = require("./default.js");
var config = require("./" + (process.env.NODE_ENV || "development") + ".js");
module.exports = _.extend({}, defaults, config);