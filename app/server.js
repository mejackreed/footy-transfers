'use strict';
/** Module dependencies */

var express = require('express');
var _ = require('lodash');

var app = express();

exports.start = function() {
  require('./config').load(app);

  _.map([
    'home',
    'api'
  //'anotherController'
  ], function (controllerName) {
    var controller = require('./controllers/' + controllerName);
    controller.setup(app);
  });

  require('http')
    .createServer(app)
    .listen(app.get('port'), function(err) {
      console.log(err);
      console.log('Express server listening on port ' + app.get('port'));
    });
};