'use strict';

angular.module('footballVisApp')
  .directive('forceGraph', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the forceGraph directive');
      }
    };
  });
