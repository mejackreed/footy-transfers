'use strict';

angular.module('footballVisApp')
	.controller('TransferCtrl', function($scope) {

		$scope.clubs = [];

		$scope.chartData = {};

		$scope.dataLoaded = {
			"clubs": false,
			"transfers": false,
			"seasons": false
		};

		$scope.filter = {
			datepicker: {
				startDate: new Date("01/01/2010"),
				endDate: new Date("10/21/2013")
			},
			type: "to",
			view: 'fee',
			league: 'English Premier'
		};

		$scope.selectAllClubs = function() {
			$scope.clubs.forEach(function(val, i) {
				val.view = true;
			})
		}
		$scope.unselectAllClubs = function() {
			$scope.clubs.forEach(function(val, i) {
				val.view = false;
			})
		}

		$scope.loadData = function() {
			$scope.dataLoaded.clubs = false;
			$scope.dataLoaded.transfers = false;
			d3.json("/api/leagues/" + $scope.filter.league, function(data) {
				// console.log(data)
				// data.forEach(function(val, i) {
				// 	val.view = true;
				// })
				$scope.clubs = data;
				$scope.dataLoaded.clubs = true;
				$scope.selectAllClubs()
				$scope.$apply();
			})
			// $scope.fulldata;
			d3.json("/api/transfers/" + $scope.filter.type + "/" + $scope.filter.league, function(data) {
				// console.log(data)
				$scope.transferdata = data
				$scope.dataLoaded.transfers = true;
				$scope.$apply();
			})

			// d3.json("data/eplseason.json", function(data) {
			// 	$scope.season = data;
			// 	$scope.dataLoaded.seasons = true;
			// 	$scope.$apply();
			// })
		}
		$scope.loadData()
	});