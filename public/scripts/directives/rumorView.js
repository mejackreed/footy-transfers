'use strict';

var dates = {
	convert: function(d) {
		// Converts the date in d to a date-object. The input can be:
		//   a date object: returned without modification
		//  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
		//   a number     : Interpreted as number of milliseconds
		//                  since 1 Jan 1970 (a timestamp) 
		//   a string     : Any format supported by the javascript engine, like
		//                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
		//  an object     : Interpreted as an object with year, month and date
		//                  attributes.  **NOTE** month is 0-11.
		return (
			d.constructor === Date ? d :
			d.constructor === Array ? new Date(d[0], d[1], d[2]) :
			d.constructor === Number ? new Date(d) :
			d.constructor === String ? new Date(d) :
			typeof d === "object" ? new Date(d.year, d.month, d.date) :
			NaN
		);
	},
	compare: function(a, b) {
		// Compare two dates (could be of any type supported by the convert
		// function above) and returns:
		//  -1 : if a < b
		//   0 : if a = b
		//   1 : if a > b
		// NaN : if a or b is an illegal date
		// NOTE: The code inside isFinite does an assignment (=).
		return (
			isFinite(a = this.convert(a).valueOf()) &&
			isFinite(b = this.convert(b).valueOf()) ?
			(a > b) - (a < b) :
			NaN
		);
	},
	inRange: function(d, start, end) {
		// Checks if date in d is between dates in start and end.
		// Returns a boolean or NaN:
		//    true  : if d is between start and end (inclusive)
		//    false : if d is before start or after end
		//    NaN   : if one or more of the dates is illegal.
		// NOTE: The code inside isFinite does an assignment (=).
		return (
			isFinite(d = this.convert(d).valueOf()) &&
			isFinite(start = this.convert(start).valueOf()) &&
			isFinite(end = this.convert(end).valueOf()) ?
			start <= d && d <= end :
			NaN
		);
	}
}

angular.module('footballVisApp')
	.directive('rumorChart', function() {
		return {
			template: '<rumorChart></rumorChart>',
			restrict: 'A',
			scope: {
				rumors: '=',
				transferdata: '=',
				currenttransfer: '='
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

				var thisPlayerTransfer = [];

				//create initial svg element
				var svg = d3.select("rumorChart").append("svg")
					.attr("id", "rumorChart")
					.style("width", width + margin.left + margin.right)
					.style("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				scope.$watch('currenttransfer', function(newVal, oldVal) {
					svg.selectAll('*').remove();
					if (!$.isEmptyObject(newVal)) {
						scope.rumors = [];
						d3.json("/api/rumors/" + scope.currenttransfer.player.name, function(data) {
							// console.log(data);
							if (data.length > 0) {
								scope.rumors = data;
								scope.$apply();
								d3.json("/api/transfers/player/" + scope.currenttransfer.player._id, function(dataRes){
									thisPlayerTransfer = dataRes;
									init();
								})
								
							}
						})

					}
				}, true)

				function init() {
					var minDate = new Date();
					var maxDate = new Date(1900);
					_.each(scope.rumors, function(val) {
						if (dates.compare(val.date, maxDate) === 1) {
							maxDate = new Date(val.date);
						}
						if (dates.compare(val.date, minDate) === -1) {
							minDate = new Date(val.date);
						}
					})

					// var thisPlayerTransfer = [];
					_.each(thisPlayerTransfer, function(val) {
						if (val.player._id === scope.currenttransfer.player._id) {
							// thisPlayerTransfer.push(val);
							if (dates.compare(val.transferDate, maxDate) === 1) {
								maxDate = new Date(val.transferDate);
							}
							if (dates.compare(val.transferDate, minDate) === -1) {
								minDate = new Date(val.transferDate);
							}
						}
					})

					var rumorCounts = d3.nest()
						.key(function(d) { return d.date; })
						.entries(scope.rumors);

					// console.log(rumorCounts);
					
					var formatDate = d3.time.format("%x");

					function getDate(d) {
						return d3.time.week(new Date(d.date));
					}

					function getTransferDate(d) {
						return new Date(d.transferDate);
					}

					var x = d3.time.scale()
						.domain([minDate, maxDate]).range([0 + margin.left + margin.right, width]);

					var y = d3.scale.linear()
						.domain([10,0])
						.range([0, height - 80]);

					//setting up axes
					var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom")
						.ticks(5)
						.tickFormat(formatDate)
						.tickSize(2)
						.innerTickSize(4)

					var yAxis = d3.svg.axis()
						.scale(y)
						.orient("left")
						.tickSize(2)
						

					//create transfer circles
					svg.selectAll("circle")
						.data(scope.rumors)
						.enter().append("circle")
						.attr("cx", function(d) {
							return x(getDate(d));
						})
						.attr("cy", function(d) {
							// console.log(_.findWhere(rumorCounts, {key: d.date}).values.length)
							return y(_.findWhere(rumorCounts, {key: d.date}).values.length);
						})
					.style("fill-opacity", 0.5)
						.attr("r", function(d) {
							var size = 5;
							return size;
						})
					.style("fill", function(d){
						if (d.sentiment > 0){
							return "#41bb19";
						}
						if (d.sentiment < 0){
							return "#ff3738";
						}
					})
					.on("mouseover", function(d){
						d3.select("#rumor-text")
							.html(function(e){
								// console.log(d)
								var text = ""
								text += formatDate(new Date(d.date)) + "<br>"
								text += d.movingFrom + " -> " + d.movingTo + "<br>";
								text += d.detail
								return text;
							})
					})
					.on("mouseout", function(d){
						d3.select("#rumor-text")
							.html("<br><br><br>");
					})

					// console.log(thisPlayerTransfer)

					svg.selectAll(".transfer-line")
						.data(thisPlayerTransfer)
						.enter()
				    .append("line")
				    .attr("x1", function (d) {
					    return x(getTransferDate(d));
						})
				    .attr("x2", function (d) {
					    return x(getTransferDate(d));
						})
				    .attr("y1", function (d) {
					    return 0;
						})
				    .attr("y2", function (d) {
				    	return 310;
						})
						
						.on("mouseover", function(d){
							d3.select("#transfer-text")
							.html(function(e){
								var text = ""
								text += formatDate(new Date(d.transferDate)) + "<br>"
								text += d.transferFromClub.name + " -> " + d.transferToClub.name + "<br>";
								// console.log(d.fee);
								if (d.fee == "")
									text += d.fee + "<br>";
								else
									text += d.fee
								
								return text;
							})
						})
						.on("mouseout", function(d){
							d3.select("#transfer-text")
								.html("<br><br><br>");
						})
						.style("stroke", "#1570a6")
						.style("stroke-width", 5)
						// .style("stroke-dasharray", ("5, 5"))

					svg.append("text")
						.attr("x", 20)
						.attr("y", 3)
						.text("Rumors/Week")

					//displaying axes
					svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + (height - 70) + ")")
						.call(xAxis);


					svg.append("g")
						.attr("class", "y axis")
						.attr("transform", "translate(20,0)")
						.call(yAxis)
						.append("text")
						.attr("transform", "rotate(-90)")
						.attr("y", 6)
						.attr("dy", ".71em")
						.style("text-anchor", "end")
						.style("cursor", "pointer")

				


				}

			}
		}
	});