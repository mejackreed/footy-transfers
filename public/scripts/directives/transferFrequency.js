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
				chartdata: '=',
				currenttransfer: '=',
				results: '=',
				currentclub: '='
			},
			link: function postLink(scope, element, attrs) {

				//setup sizes
				var margin = {
					top: 40,
					right: 20,
					bottom: 30,
					left: 150
				},
					width = 960 - margin.left - margin.right,
					height = 400 - margin.top - margin.bottom;

				//create initial svg element
				var svg = d3.select("transferChart").append("svg")
					.attr("id", "transferChart")
					.style("width", width + margin.left + margin.right)
					.style("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				//setup tooltip
				// var tooltipDiv = d3.select("body").append("div")
				// 	.attr("id", "tooltip")
				// 	.attr("class", "tooltip")
				// 	.style("opacity", 0);

				//watch for data being loaded and filters changing
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

				//drawing the graph (data has already been checked that it has loaded)
				function init(transferdata) {

					height = scope.clubs.length * 20 + 80

					d3.select("#transferChart")
						.style("height", height)



					var data = []
					var clubCounts = {};
					var minDate = new Date(scope.filter.datepicker.startDate), //getDate(data[0]),
						maxDate = new Date(scope.filter.datepicker.endDate) //getDate(data[data.length - 1]);

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

					//filtering the transfer data by selected clubs, by date range
					scope.clubs.forEach(function(val, i) {
						var thisdata = [];
						if (val.view) {
							transferdata.forEach(function(recval, i) {
								var thisDate = new Date(recval.transferDate)
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
						//filter data by search terms
						if (scope.filter.searchValue) {
							data = _.filter(data, function(val) {
								var str = ""
								str += val.player.name
								str += val.player.nation
								str += val.player.position
								str += val.transferToClub.name
								str += val.transferFromClub.name
								str += val.fee
								return (str.indexOf(scope.filter.searchValue) !== -1)
							})
						}
						if (!data[data.length - 1]) {
							data.splice(data.length - 1, 1)
						}
					})

					if (scope.filter.show !== 'all'){
						data = _.filter(data, function(val){
						if (scope.filter.show === 'interleague'){
							return (_.where(scope.clubs, {"name" : val[transferVarOpp].name}).length === 1)
						}
						if (scope.filter.show === 'outerleague'){
							return (_.where(scope.clubs, {"name" : val[transferVarOpp].name}).length === 0)
						}
					})
					}
					

					//sorting the transfer data by club number of transfers
					data.sort(function(a, b) {
						if (clubCounts[a[transferVar].name] < clubCounts[b[transferVar].name])
							return 1;
						if (clubCounts[a[transferVar].name] > clubCounts[b[transferVar].name])
							return -1;
						// a must be equal to b
						return 0;
					})

					//nesting transfers for transfer display on days with multiple transfers
					var nestedTransfers = d3.nest()
						.key(function(d) {
							return d[transferVar].name
						})
						.key(function(d) {
							return d['transferDate']
						})
						.entries(data, d3.map)

					if (data.length < 1) {
						return;
					}

					var currentResults = [];

					var formatYear = d3.time.format('%Y');

					_.each(scope.results, function(val){
						if (val.startYear >= formatYear(minDate) && val.endYear <= formatYear(maxDate)){
							currentResults.push(val)
						}
					})

					//building legend items and categories
					var legendItems = {
						"fee": ['Free', 'Signed', 'Loan', "Disclosed Fee"],
						"position": ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
						"age": ['Under 20', '20 to 30', '30 to 40', 'Over 40'],
						"nation": ["Italy", "England", "France", "Germany", "Spain", "Other"]
					}

					scope.chartdata = {};


					_.each(legendItems[scope.filter.view], function(val) {
						scope.chartdata[val] = 0;
					});

					//returns correct legend class and counts legend items
					function setClass(d) {
						if (scope.filter.view === 'clubs') {
							return d[transferVar].name.toLowerCase().replace(/\s/g, "-")
						}
						if (scope.filter.view === 'nation') {
							switch (d.player.nation.toLowerCase()) {
								case 'england':
									scope.chartdata["England"] += 1;
									return 'nation-england'
									break;
								case 'france':
									scope.chartdata["France"] += 1;
									return 'nation-france'
									break;
								case 'germany':
									scope.chartdata["Germany"] += 1;
									return 'nation-germany'
									break;
								case 'italy':
									scope.chartdata["Italy"] += 1;
									return 'nation-italy'
									break;
								case 'spain':
									scope.chartdata["Spain"] += 1;
									return 'nation-spain'
									break;
								default:
									scope.chartdata["Other"] += 1;
									return 'nation-other'
									break;
							}
						}
						if (scope.filter.view === 'age') {
							var age = moment(d.transferDate).diff(d.player.dateOfBirth, 'years')
							switch (true) {
								case (age < 20):
									scope.chartdata['Under 20'] += 1;
									return 'age-under';
									break;
								case (age >= 20 && age < 30):
									scope.chartdata['20 to 30'] += 1;
									return 'age-20';
									break;
								case (age >= 30 && age < 40):
									scope.chartdata['30 to 40'] += 1;
									return 'age-30'
									break;
								case (age >= 40):
									scope.chartdata['Over 40'] += 1;
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
									scope.chartdata['Goalkeeper'] += 1;
									return 'position-goalkeeper'
									break;
								case 'forward':
									scope.chartdata['Forward'] += 1;
									return 'position-forward'
									break;
								case 'defender':
									scope.chartdata['Defender'] += 1;
									return 'position-defender'
									break;
								case 'midfielder':
									scope.chartdata['Midfielder'] += 1;
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
									scope.chartdata['Free'] += 1;
									return 'fee-free';
									break;
								case 'signed':
									scope.chartdata['Signed'] += 1;
									return 'fee-signed';
									break;
								case 'loan':
									scope.chartdata['Loan'] += 1;
									return 'fee-loan';
									break;
								default:
									scope.chartdata['Disclosed Fee'] += 1;
									return 'fee-disclosed';
									break;
							}
						}
					}

					function createResults(thisClub){
						var text = "<strong>Season</strong> - Rank<br>";
						currentResults = _.sortBy(currentResults, function(val){
							return val.endYear;
						});
						_.each(currentResults, function(val){
							_.each(val.clubResults, function(club){
								if (club.club.name === thisClub){
									var thisText;
									text += "<strong>" + val.startYear + " - " + val.endYear + "</strong>";
									text += " - " + club.rank + "<br>";
								}
							});
						});
						return text;
					}

					function formatTooltip(d) {
						if (!isNaN(d['fee'])) {
							var fee = "£" + d3.format(",")(d['fee'])
						} else {
							var fee = d['fee']
						}
						return '<br><strong>' + d['player'].name + '</strong> - ' + d.player.position + ' - ' + d.player.nation + '<br> ' + d.transferFromClub.name + ' &#8594; ' + d.transferToClub.name + '<br> Fee: ' + fee
					}

					function getDate(d) {
						return new Date(d['transferDate']);
					}

					var formatDate = d3.time.format("%x");

					var x = d3.time.scale()
						.domain([minDate, maxDate]).range([0, width]);

					var y = d3.scale.ordinal()
						.domain(data.map(function(d) {
							return d[transferVar].name
						}))
						.rangePoints([0, height - 80]);

					//setting up axes
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
							return d + " | " + clubCounts[d]
						})

					//create transfer circles
					svg.selectAll("circle")
						.data(data)
						.enter().append("circle")
						.attr("cx", function(d) {
							return x(getDate(d));
						})
						.attr("cy", function(d) {
							return y(d[transferVar].name);
						})
						.attr("class", function(d) {
							return setClass(d) + " transfer"
						})
						.style("fill-opacity", 0.7)
						.attr("r", function(d) {
							var size = 5;
							return size;
						})
						.on("mouseover", function(d) {
							d3.select("g").selectAll("text")
								.filter(function(e) {
									return e === d.transferToClub.name || e === d.transferFromClub.name;
								})
								.attr("fill", "#428bca")
							// d3.select(this)
							// 	.transition().duration(200)
							// 	.attr("r", 8);
							d3.selectAll("circle").filter(function(e) {
								if (e.player) {
									return e.player._id === d.player._id
								}
							}).transition().duration(200).attr("r", 10)
							// d3.select(this)
							if (_.where(scope.clubs, {"name": d[transferVarOpp].name} ).length > 0){
								svg.append("line")
									.attr("x1", this.cx.baseVal.value)
									.attr("x2", this.cx.baseVal.value)
									.attr("y1", y(d[transferVarOpp].name))
									.attr("y2", this.cy.baseVal.value)
									.attr("class", "transfer-line")
									.style("stroke", "black")
	 								.attr("stroke-width", 1)


							}
								
						})
						.on("mouseout", function(d) {
							d3.selectAll(".transfer-line").remove()
							d3.select("g").selectAll("text")
								.filter(function(e) {
									return e === d.transferToClub.name || e === d.transferFromClub.name;
								})
								.attr("fill", "#333")
							// d3.select(this);
							// 	.transition().duration(200)
							// 	.attr("r", 5);
							d3.selectAll("circle").filter(function(e) {
								if (e.player) {
									return e.player._id === d.player._id
								}
							}).transition().duration(200).attr("r", 5)
						})
						.on("click", function(d) {
							scope.$apply(function() {
								scope.currenttransfer = d;
								// console.log(scope.currenttransfer)
							});
							$('#rumor-modal').modal('show')
						})
						.call(d3.helper.tooltip()
							.style({
								padding: '3px',
								font: '12px',
								background: '#fff',
								opacity: '.85',
								border: '0px'
							})
							.text(function(d, i) {
								var text = "<small>" + moment(d['transferDate']).format('MM/DD/YYYY');
								nestedTransfers.forEach(function(val, i) {
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

					//displaying axes
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
						.style("cursor", "pointer")

					d3.select("g").selectAll("text")
						.filter(function(d) {
							return typeof(d) === "string"
						})
						.on("mouseover", function(d) {
							d3.selectAll("circle").filter(function(e) {
								if (e.transferToClub) {
									return e[transferVarOpp].name === d
								}
							}).transition().duration(200).attr("r", 10)


						})
						.on("mouseout", function(d) {
							d3.selectAll("circle").filter(function(e) {
								if (e.transferToClub) {
									return e[transferVarOpp].name === d
								}
							}).transition().duration(200).attr("r", 5)
						})
						.call(d3.helper.tooltip()
							.style({
								padding: '3px',
								font: '12px',
								background: '#fff',
								opacity: '.85',
								border: '0px',
								width: '30px'
							})
							.text(function(d, i) {
								return createResults(d);
							})
						)
						.on("click", function(d) {
							scope.$apply(function() {
								scope.currentclub = d;
								// console.log(scope.currenttransfer)
							});
							$('#club-modal').modal('show');
						});

					svg.append("text")
						.attr("x", -100)
						.attr("y", -20)
						.text("Club | Transfers")

					//sets up legend
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
								.attr("cx", (i * (width / legendItems[scope.filter.view].length)) + 40)
								.attr("cy", -30)
								.attr("r", function(d) {
									return (scope.chartdata[d] / data.length) * (15 - 3) + 3
								})
								.attr("class", function(d) {
									var str = d.split(' ')
									return 'legend-' + scope.filter.view + '-' + str[0].toLowerCase() // so they could be treated differently from circles on the graph
								})
								.call(d3.helper.tooltip()
									.style({
										padding: '3px',
										font: '12px',
										background: '#fff',
										opacity: '.85',
										border: '0px'
									})
									.text(function(d, i) {
										var text = "<small><strong>" + d + ":</strong> " + scope.chartdata[d] + " transfers (" + Math.round(100 * scope.chartdata[d] / data.length) + "%)</small>"
										return text
									})
							)
							g.append("text")
								.attr("x", (i * (width / legendItems[scope.filter.view].length)) + 60)
								.attr("y", -25)
								.attr("height", 30)
								.attr("width", 100)
								.attr("class", function(d) {
									var str = d.split(' ')
									return scope.filter.view + '-' + str[0].toLowerCase()
								})
								.text(d)
								.call(d3.helper.tooltip()
									.style({
										padding: '3px',
										font: '12px',
										background: '#fff',
										opacity: '.85',
										border: '0px'
									})
									.text(function(d, i) {
										var text = "<small><strong>" + d + ":</strong> " + scope.chartdata[d] + " transfers (" + Math.round(100 * scope.chartdata[d] / data.length) + "%)</small>"
										return text
									})
								)
								.on("click", function() {
									console.log(scope.filter.view);
									console.log(d);
									var dString = d.toLowerCase();
									// if (scope.filter.view == 'nation') {
									// 	// if d.startsWith
									// }
									if (scope.filter.view == 'age') {
										if (dString[0] == 'u')
											dString = 'under'
										else if (dString[0] == '2')
											dString = '20'
										else if (dString[0] == '3')
											dString = '30'
										else if (dString[0] == '4')
											dString = '40'
									}
									// else if (scope.filter.view == 'position') {

									// } 
									else if (scope.filter.view == 'fee') {
										if (dString[0] == 'd')
											dString = 'disclosed';
									}

									var typeInView = dString.toLowerCase();									
									var targetType = scope.filter.view + "-" + typeInView;
									console.log(targetType);
									svg.selectAll('circle.' + targetType)
										.classed("disappear", function(cd, ind) {
											if (this.classList.contains("disappear"))
												return false;
											else
												return true;
										});
								})
								
								.on("mouseover", function(d) {
									d3.selectAll('.' + $(this).attr("class") + ".transfer")
										.transition().duration(200).attr("r", 10);
								})
								.on("mouseout", function(d) {
									d3.selectAll('.' + $(this).attr("class") + ".transfer")										
										.transition().duration(200).attr("r", 5);
								})
						});

				}
			}
		};
	});