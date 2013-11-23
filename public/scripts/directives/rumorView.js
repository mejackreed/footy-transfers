'use strict';

angular.module('footballVisApp')
	.directive('rumorView', function() {
			return {
				template: '<rumorView></rumorView>',
				restrict: 'A',
				scope: {
					rumors: '=',
					currenttransfer: '='
				},
				link: function postLink(scope, element, attrs) {
					var margin = {
						top: 40,
						right: 20,
						bottom: 30,
						left: 150
					}

					scope.$watch('currenttransfer', function(newVal, oldVal) {
						if (!$.isEmptyObject(newVal)){
							init();
						}
					}, true)

					function init(){
						scope.rumors = [];
						d3.json("/api/rumors/" + scope.currenttransfer.player.name, function(data){
							console.log(data);
							if (data.length > 0){
								scope.rumors = data;
								scope.$apply();
							}
						})

					}

				}
		}
});