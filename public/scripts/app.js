'use strict';

angular.module('footballVisApp', ['$strap.directives'])
.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});
