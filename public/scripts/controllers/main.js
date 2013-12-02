'use strict';

angular.module('footballVisApp')
	.controller('TransferCtrl', function($scope) {

		$scope.clubs = [];

		$scope.chartData = {};

		$scope.currentTransfer = {};

		$scope.currentClub = {};

		$scope.results = [];

		$scope.rumors = [];

		$scope.dataLoaded = {
			"clubs": false,
			"transfers": false,
			"seasons": false,
			"results": false
		};

		$scope.filter = {
			datepicker: {
				startDate: new Date("01/01/2010"),
				endDate: new Date("10/21/2013")
			},
			type: "to",
			view: 'fee',
			league: 'English Premier',
			show: 'all'
		};

		$scope.getHelp = function(){
			$('body').chardinJs('start');
		};

		$scope.selectAllClubs = function() {
			$scope.clubs.forEach(function(val) {
				val.view = true;
			});
		};
		$scope.unselectAllClubs = function() {
			$scope.clubs.forEach(function(val) {
				val.view = false;
			});
		};

		$scope.loadData = function() {
			$scope.dataLoaded.clubs = false;
			$scope.dataLoaded.transfers = false;
			d3.json("/api/leagues/" + $scope.filter.league, function(data) {
				$scope.clubs = data;
				$scope.dataLoaded.clubs = true;
				$scope.selectAllClubs();
				$scope.$apply();
			});
			d3.json("/api/transfers/" +
				$scope.filter.type +
				"/" +
				$scope.filter.league, function(data) {
					$scope.transferdata = data;
					$scope.dataLoaded.transfers = true;
					$scope.$apply();
			});

			d3.json("/api/results/" + $scope.filter.league, function(data){
				$scope.results = data;
				$scope.dataLoaded.results = true;
				$scope.$apply();
			});
		};
		$scope.loadData();
	});