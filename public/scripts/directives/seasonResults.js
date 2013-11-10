'use strict';

angular.module('footballVisApp')
	.directive('seasonResults', function() {
		return {
			template: '<seasonChart></seasonChart>',
			restrict: 'A',
			scope: {
				clubs: '=',
				season: '=',
				filter: '=',
				dataloaded: '=',
			},
			link: function postLink(scope, element, attrs) {
				// console.log(scope.season)

				var margin = {
					top: 40,
					right: 20,
					bottom: 30,
					left: 150
				},
					width = 400 - margin.left - margin.right,
					height = 400 - margin.top - margin.bottom;

				var svg = d3.select("seasonChart").append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				var div = d3.select("body").append("div")
					.attr("class", "tooltip")
					.style("opacity", 0);


				scope.$watch('clubs', function(newVal, oldVal) {
					d3.entries(scope.dataloaded).forEach(function(val, i) {
						if (!val.value) {
							return;
						}
					})
					svg.selectAll('*').remove();
					if (scope.season) {
						init(scope.season);
					}

				}, true);
				// scope.$watch('season', function(newVal, oldVal) {
				// 	d3.entries(scope.dataloaded).forEach(function(val, i) {
				// 		if (!val.value) {
				// 			return;
				// 		}
				// 	})
				// 	svg.selectAll('*').remove();
				// 	if (scope.season) {
				// 		init(scope.season);
				// 	}

				// }, true);
				scope.$watch('dataloaded', function(newVal, oldVal) {
					d3.entries(scope.dataloaded).forEach(function(val, i) {
						if (!val.value) {
							return;
						}
					})
					svg.selectAll('*').remove();
					if (scope.season) {
						init(scope.season);
					}
				}, true)

				scope.$watch('filter', function(newVal, oldVal) {
					d3.entries(scope.dataloaded).forEach(function(val, i) {
						if (!val.value) {
							return;
						}
					})
					svg.selectAll('*').remove();
					if (scope.season) {
						init(scope.season);
					}
				}, true);

				function init(season) {
					var data = season.season.standings
					var x = d3.scale.ordinal()
						.domain(['2012/2013']).range([0, width]);

					var y = d3.scale.linear()
						.domain([1, 20])
						.range([0, height - 10]);

					var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom")
						.ticks(7)
					// .tickFormat(formatDate)
					.tickSize(2)
						.innerTickSize(4)

					var yAxis = d3.svg.axis()
						.scale(y)
						.orient("left")
						.tickSize(2)
						.ticks(10)
						// .tickFormat(function(d, i) {
						// 	return d + " " + clubCounts[d]
						// })

					svg.selectAll("circle")
						.data(data)
						.enter().append("circle")
						.attr("cx", function(d) {
							return x('2012/2013') + 10
						})
						.attr("cy", function(d) {
							return y(d.rank);
						})
						.attr("class", function(d) {
							var text= ''
							scope.clubs.forEach(function(val, i) {
								if (val.id === d.club.id) {
									text = val.name.toLowerCase().replace(/\s/g, "-")
								}
							})
							return text
						})
						.style("fill-opacity", 0.5)
					.attr("r", function(d) {
						var size = 5
						return size;
					})
					.call(d3.helper.tooltip()
						.style({
							padding: '3px',
							font: '12px',
							background: '#fff',
							opacity: '.9',
							border: '0px'
						})
						.text(function(d, i) {
							var text = ''
							scope.clubs.forEach(function(val, i) {
								if (val.id === d.club.id) {
									text = val.name
								}
							})
							return text
						})
					)

					svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(10," + height + ")")
						.call(xAxis);


					svg.append("g")
						.attr("class", "y axis")
						.call(yAxis)
						.append("text")
						.attr("transform", "rotate(-90)")
						.attr("y", 6)
						.attr("dy", ".71em")
						.style("text-anchor", "end")
				}
			}
		}
	})