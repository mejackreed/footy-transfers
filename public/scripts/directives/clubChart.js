'use strict';

angular.module('footballVisApp')
	.directive('clubChart', function() {
		return {
			template: '<clubChart></clubChart>',
			restrict: 'A',
			scope: {
				clubs: '=',
				transferdata: '=',
				filter: '=',
				dataloaded: '=',
				chartdata: '=',
				currenttransfer: '=',
				results: '=',
				currentclub: '='
			},
			link: function postLink(scope, element, attrs) {

				//setup sizes
				var margin = {
					top: 10,
					right: 10,
					bottom: 10,
					left: 10
				},
					width = 500 - margin.left - margin.right,
					height = 400 - margin.top - margin.bottom;

				//create initial svg element
				var svg = d3.select("clubChart").append("svg")
					.attr("id", "clubChart")
					.style("width", width + margin.left + margin.right)
					.style("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				scope.$watch('currentclub', function(newVal, oldVal) {
					svg.selectAll('*').remove();
					// console.log(newVal)
					if (newVal.length > 0) {
						init()

					}

				}, true);

				//drawing the graph (data has already been checked that it has loaded)
				function init() {
					// console.log(scope.clubs)

					var clubResults = [];

					var currentResults = _.sortBy(scope.results, function(val) {
						return val.endYear;
					});
					_.each(currentResults, function(val) {
						_.each(val.clubResults, function(club) {
							if (club.club.name === scope.currentclub) {
								clubResults.push({
									startYear: val.startYear,
									endYear: val.endYear,
									club: club
								});
							}
						});
					});

					// clubResults = _.sortBy(clubResults, function(val){
					// 	return val.club.rank
					// })

					// console.log(clubResults)

					// height = scope.clubs.length * 20 + 80

					// d3.select("#transferChart")
					// 	.style("height", height)
					var transferVar = '',
						transferVarOpp = '';
					switch (scope.filter.type) {
						case 'to':
							transferVar = 'transferToClub';
							transferVarOpp = 'transferFromClub';
							break;
						case 'from':
							transferVar = 'transferFromClub';
							transferVarOpp = 'transferToClub';
							break;
					}


					var data = []

					var transferData = [];
					_.each(scope.transferdata, function(val){
						if (val.transferToClub.name === scope.currentclub || val.transferFromClub.name === scope.currentclub){
							transferData.push(val)
						}
					})

					var transferCounts = d3.nest()
						.key(function(d) { return new Date(d.transferDate).getFullYear(); }).sortKeys(d3.ascending)
						.entries(transferData)

					// transferCounts = transferCounts.sort(function(val){
					// 	return parseInt(val.key)
					// })
					console.log(transferCounts)

					var clubCounts = {};
					var minDate = new Date(clubResults[0].startYear).setUTCFullYear(clubResults[0].startYear), //getDate(data[0]),
						maxDate = new Date(clubResults[clubResults.length - 1].endYear).setUTCFullYear(clubResults[clubResults.length - 1].endYear) //getDate(data[data.length - 1]);

					

					//filtering the transfer data by selected clubs, by date range

					var formatDate = d3.time.format("%Y");

					var x = d3.scale.ordinal()
						.domain(transferCounts.map(function(d) {
							return d.key
						}))
						.rangePoints([30, width - margin.right - margin.left]);

					var y = d3.scale.linear()
						.domain([1,20])
						.range([0, height - 80]);

					var y2 = d3.scale.linear()
						.domain([d3.max(transferCounts, function(d){
							return d.values.length
						}),0])
						.range([0, height - 80]);

						console.log(y2.domain())

						console.log(transferCounts.map(function(d){
							return d.values.length;
						}))

					//setting up axes
					var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom")
						.tickValues([2000,2005,2010,2013])
						.tickSize(1)
						.innerTickSize(4)

					var yAxis = d3.svg.axis()
						.scale(y)
						.ticks(20)
						.orient("left")
						.tickSize(1)
					
					var y2Axis = d3.svg.axis()
						.scale(y2)
						.orient("right")
						.tickSize(1)

					var line = d3.svg.line()
						.x(function(d, i) {
							return x(d.startYear);
						})
						.y(function(d) {
							return y(d.club.rank);
						})

					var line2 = d3.svg.line()
						.x(function(d, i) {
							return x(d.key);
						})
						.y(function(d) {
							return y2(d.values.length);
						})

					//create transfer circles
					svg.append("path")
						.datum(clubResults)
						.attr("class", "line")
						.attr("d", line);

					svg.append("path")
						.datum(transferCounts)
						.attr("class", "line")
						.attr("d", line2)

					svg.selectAll(".y1")
						.data(clubResults)
						.enter().append("circle")
						.attr("cx", function(d) {
							return x(d.startYear);
						})
						.attr("cy", function(d) {
							return y(d.club.rank)
						})
					.style("fill-opacity", 1)
						.attr("r", function(d) {
							var size = 10;
							return size;
						})
						.attr("fill", function(d) {
							if (d.club.rank <= 4) {
								return '#ff3738';
							} else {
								return '#000';
							}
						})
					.on("mouseover", function(d){
						d3.select('#info-rank')
							.html(d.startYear + " finishes #" + d.club.rank)
					})

						svg.selectAll(".y2")
							.data(transferCounts)
							.enter()
							.append("circle")
							.attr("cx", function(d) {
								return x(d.key);
							})
							.attr("cy", function(d) {
								return y2(d.values.length)
							})
							.style("fill-opacity", 1)
							.attr("r", function(d) {
								var size = 5;
								return size;
							})
							.attr("fill", function(d) {
								return "#41bb19";
							})
							.on("mouseover", function(d){
								d3.select('#info-transfers')
									.html(d.key + " - " + d.values.length + " transfers")
							})


					//displaying axes
					svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + (height - 80) + ")")
						.call(xAxis);


					svg.append("g")
						.attr("class", "y axis")
						.attr("transform", "translate(20,0)")
						.call(yAxis)
						.append("text")
						.attr("y", 6)
						.attr("dy", ".71em")
						.style("text-anchor", "end")
						.style("cursor", "pointer")

					svg.append("g")
						.attr("class", "y2 axis")
						.attr("transform", "translate(" + (width - margin.right) + ",0)")
						.call(y2Axis)
						.append("text")
						.attr("y", 6)
						.attr("dy", ".71em")


					// d3.select("g").selectAll("text")
					// 	.filter(function(d) {
					// 		return typeof(d) === "string"
					// 	})
					// 	.on("mouseover", function(d) {
					// 		d3.selectAll("circle").filter(function(e) {
					// 			if (e.transferToClub) {
					// 				return e[transferVarOpp].name === d
					// 			}
					// 		}).transition().duration(200).attr("r", 10)


					// 	})
					// 	.on("mouseout", function(d) {
					// 		d3.selectAll("circle").filter(function(e) {
					// 			if (e.transferToClub) {
					// 				return e[transferVarOpp].name === d
					// 			}
					// 		}).transition().duration(200).attr("r", 5)
					// 	})
					// 	.call(d3.helper.tooltip()
					// 		.style({
					// 			padding: '3px',
					// 			font: '12px',
					// 			background: '#fff',
					// 			opacity: '.85',
					// 			border: '0px',
					// 			width: '30px'
					// 		})
					// 		.text(function(d, i) {
					// 			return createResults(d);
					// 		})
					// )
					// 	.on("click", function(d) {
					// 		scope.$apply(function() {
					// 			scope.currentclub = d;
					// 			// console.log(scope.currenttransfer)
					// 		});
					// 		$('#club-modal').modal('show');
					// 	});

					// svg.append("text")
					// 	.attr("x", -100)
					// 	.attr("y", -20)
					// 	.text("Club | Transfers")

					// //sets up legend
					// var legend = svg.append("g")
					// 	.attr("class", "legend")
					// 	.attr("x", width - 200)
					// 	.attr("y", height)

					// legend.selectAll("g").data(legendItems[scope.filter.view])
					// 	.enter()
					// 	.append("g")
					// 	.each(function(d, i) {
					// 		var g = d3.select(this);
					// 		g.append("circle")
					// 			.attr("cx", (i * (width / legendItems[scope.filter.view].length)) + 40)
					// 			.attr("cy", -30)
					// 			.attr("r", function(d) {
					// 				return (scope.chartdata[d] / data.length) * (15 - 3) + 3
					// 			})
					// 			.attr("class", function(d) {
					// 				var str = d.split(' ')
					// 				return scope.filter.view + '-' + str[0].toLowerCase()
					// 			})
					// 			.call(d3.helper.tooltip()
					// 				.style({
					// 					padding: '3px',
					// 					font: '12px',
					// 					background: '#fff',
					// 					opacity: '.9',
					// 					border: '0px'
					// 				})
					// 				.text(function(d, i) {
					// 					var text = "<small><strong>" + d + ":</strong> " + scope.chartdata[d] + " transfers (" + Math.round(100 * scope.chartdata[d] / data.length) + "%)</small>"
					// 					return text
					// 				})
					// 		)
					// 		g.append("text")
					// 			.attr("x", (i * (width / legendItems[scope.filter.view].length)) + 60)
					// 			.attr("y", -25)
					// 			.attr("height", 30)
					// 			.attr("width", 100)
					// 			.attr("class", function(d) {
					// 				var str = d.split(' ')
					// 				return scope.filter.view + '-' + str[0].toLowerCase()
					// 			})
					// 			.text(d)
					// 			.call(d3.helper.tooltip()
					// 				.style({
					// 					padding: '3px',
					// 					font: '12px',
					// 					background: '#fff',
					// 					opacity: '.9',
					// 					border: '0px'
					// 				})
					// 				.text(function(d, i) {
					// 					var text = "<small><strong>" + d + ":</strong> " + scope.chartdata[d] + " transfers (" + Math.round(100 * scope.chartdata[d] / data.length) + "%)</small>"
					// 					return text
					// 				})
					// 		)
					// 			.on("mouseover", function(d) {
					// 				d3.selectAll('.' + $(this).attr("class") + ".transfer")
					// 					.transition().duration(200).attr("r", 10);
					// 			})
					// 			.on("mouseout", function(d) {
					// 				d3.selectAll('.' + $(this).attr("class") + ".transfer")
					// 					.transition().duration(200).attr("r", 5);
					// 			})
					// 	});

				}
			}
		};
	});