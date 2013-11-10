'use strict';

angular.module('footballVisApp')
	.directive('transferFrequency', function() {
		return {
			template: '<transferChart></transferChart>',
			restrict: 'A',
			scope: {
				clubs: '=',
				transferdata: '=',
				filter: '=',
				dataloaded: '=',
			},
			link: function postLink(scope, element, attrs) {

				var margin = {
					top: 40,
					right: 20,
					bottom: 30,
					left: 150
				},
					width = 960 - margin.left - margin.right,
					height = 400 - margin.top - margin.bottom;

				var svg = d3.select("transferChart").append("svg")
					.attr("id", "transferChart")
					.style("width", width + margin.left + margin.right)
					.style("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				var div = d3.select("body").append("div")
					.attr("class", "tooltip")
					.style("opacity", 0);

				scope.$watch('dataloaded', function(newVal, oldVal) {
					d3.entries(scope.dataloaded).forEach(function(val, i) {
						if (!val.value) {
							return;
						}
					})
					svg.selectAll('*').remove();
					if (scope.transferdata) {
						init(scope.transferdata);
					}
				}, true)

				scope.$watch('filter', function(newVal, oldVal) {
					d3.entries(scope.dataloaded).forEach(function(val, i) {
						if (!val.value) {
							return;
						}
					})
					svg.selectAll('*').remove();
					if (scope.transferdata) {
						init(scope.transferdata);
					}
				}, true);

				scope.$watch('clubs', function(newVal, oldVal) {
					d3.entries(scope.dataloaded).forEach(function(val, i) {
						if (!val.value) {
							return;
						}
					})
					svg.selectAll('*').remove();
					if (scope.transferdata) {
						init(scope.transferdata);
					}

				}, true);

				function init(transferdata) {
					height = scope.clubs.length*20 +80

					d3.select("#transferChart")
					.style("height", height)



					var data = []
					var clubCounts = {};
					var minDate = new Date(scope.filter.datepicker.startDate), //getDate(data[0]),
						maxDate = new Date(scope.filter.datepicker.endDate) //getDate(data[data.length - 1]);

						var transferVar = ''
					switch (scope.filter.type) {
						case 'to':
							transferVar = 'transferToClub';
							break;
						case 'from':
							transferVar = 'transferFromClub';
							break;
					}

					scope.clubs.forEach(function(val, i) {
						var thisdata = [];
						if (val.view) {
							transferdata.forEach(function(recval, i) {
								// console.log(recval)
								var thisDate = new Date(recval.transferDate)
								// console.log(recval[transferVar])
								if (recval[transferVar].name == val.name && thisDate > minDate && thisDate < maxDate) {
									thisdata.push(recval)
									if (val.name in clubCounts) {
										clubCounts[val.name] += 1
									} else {
										clubCounts[val.name] = 1
									}
								}
							})
						}
						data = data.concat(thisdata)
						if (!data[data.length - 1]) {
							data.splice(data.length - 1, 1)
						}
					})
					// console.log(data)

					data.sort(function(a, b) {
						if (clubCounts[a[transferVar].name] < clubCounts[b[transferVar].name])
							return 1;
						if (clubCounts[a[transferVar].name] > clubCounts[b[transferVar].name])
							return -1;
						// a must be equal to b
						return 0;
					})

					var testing = d3.nest()
						.key(function(d) {
							return d[transferVar].name
						})
						.key(function(d) {
							return d['transferDate']
						})
						.entries(data, d3.map)
					// console.log(testing)

					if (data.length < 1) {
						return;
					}

					var legendItems = {
						"fee": ['Free', 'Signed', 'Loan', "Disclosed Fee"],
						"position": ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
						"age": ['Under 20', '20 to 30', '30 to 40', 'Over 40']
					}

						function setClass(d) {
							if (scope.filter.view === 'clubs') {
								return d[transferVar].name.toLowerCase().replace(/\s/g, "-")
							}
							if (scope.filter.view === 'age') {
								var age = moment(d.transferDate).diff(d.player.dateOfBirth, 'years')
								switch (true) {
									case (age <20) :
										return 'age-under';
										break;
									case (age >=20 && age <30) :
										return 'age-20';
										break;
									case (age >=30 && age <40):
										return 'age-30'
										break;
									case (age >=40):
										return 'age-over'
										break;
									default:
										return 'age-unknown'
										break;
								}
							}
							if (scope.filter.view === 'position') {
								switch (d.player.position.toLowerCase()) {
									case 'goalkeeper':
										return 'position-goalkeeper'
										break;
									case 'forward':
										return 'position-forward'
										break;
									case 'defender':
										return 'position-defender'
										break;
									case 'midfielder':
										return 'position-midfielder'
										break;
									default:
										return 'position-unknown'
										break;
								}
							}
							if (scope.filter.view === 'fee') {
								switch (d['fee'].toLowerCase()) {
									case 'free':
										return 'fee-free';
										break;
									case 'signed':
										return 'fee-signed';
										break;
									case 'loan':
										return 'fee-loan';
										break;
									default:
										return 'fee-disclosed';
										break;
								}
							}

						}

						function formatCurrency(f) {
							f = d3.format(f);
							return function(d) {
								return f(d).replace(/^([-+−])?/, "$1$$");
							};
						};

					function formatTooltip(d) {
						if (!isNaN(d['fee'])) {
							var fee = "£" + d3.format(",")(d['fee'])
						} else {
							var fee = d['fee']
						}

						return '<br><strong>' + d['player'].name + '</strong> - ' + d.player.position + '<br> ' + d.transferFromClub.name + ' &#8594; ' + d.transferToClub.name + '<br> Fee: ' + fee
					}

					function getDate(d) {
						return new Date(d['transferDate']);
					}

					// console.log(data)

					var formatDate = d3.time.format("%x");

					var x = d3.time.scale()
						.domain([minDate, maxDate]).range([0, width]);

					var y = d3.scale.ordinal()
						.domain(data.map(function(d) {
							return d[transferVar].name
						}))
						.rangePoints([0, height - 80]);

					var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom")
						.ticks(7)
						.tickFormat(formatDate)
						.tickSize(2)
						.innerTickSize(4)

					var yAxis = d3.svg.axis()
						.scale(y)
						.orient("left")
						.tickSize(2)
						.tickFormat(function(d, i) {
							return d + " " + clubCounts[d]
						})

					svg.selectAll("circle")
						.data(data)
						.enter().append("circle")
						.attr("cx", function(d) {
							// return x(getDate(d['values']))
							return x(getDate(d)) //+ margin.left + margin.right;
						})
						.attr("cy", function(d) {
							// return y(d['values']['values']);
							// console.log(d[transferVar].name)
							return y(d[transferVar].name);
						})
						.attr("class", function(d) {
							return setClass(d);
						})
						.style("fill-opacity", 0.7)
					// .style("pointer-events", "none")
					.attr("r", function(d) {
						var size = 5
						return size;
						// return 5;	
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
								var text = "<small>" + moment(d['transferDate']).format('MM/DD/YYYY');
								testing.forEach(function(val, i) {
									if (val['key'] == d[transferVar].name) {
										val.values.forEach(function(val2, j) {
											if (val2['key'] == d['transferDate']) {
												val2.values.forEach(function(val3, k) {
													text += formatTooltip(val3)
												})
											}
										})
									}
								})
								return text
							})
					)

					svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + (height - 70) + ")")
						.call(xAxis);


					svg.append("g")
						.attr("class", "y axis")
						.call(yAxis)
						.append("text")
						.attr("transform", "rotate(-90)")
						.attr("y", 6)
						.attr("dy", ".71em")
						.style("text-anchor", "end")

					var legend = svg.append("g")
						.attr("class", "legend")
						.attr("x", width - 200)
						.attr("y", height)

					legend.selectAll("g").data(legendItems[scope.filter.view])
						.enter()
						.append("g")
						.each(function(d, i) {
							var g = d3.select(this);
							g.append("circle")
								.attr("cx", (i * 200))
								.attr("cy", -30)
								.attr("r", 5)
							.attr("class", function(d) {
								var str = d.split(' ')
								return scope.filter.view + '-' + str[0].toLowerCase()
							})
							g.append("text")
								.attr("x", (i * 200) + 20)
								.attr("y", -25)
								.attr("height", 30)
								.attr("width", 100)
								.attr("class", function(d) {
									var str = d.split(' ')
									return scope.filter.view + '-' + str[0].toLowerCase()
								})
							.text(d);

						});
				}



			}
		};
	});