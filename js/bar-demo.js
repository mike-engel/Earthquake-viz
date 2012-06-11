$(document).ready(function() {
	drawQuakes.LoadData();
});

var quakeData = [],
	url = "http://earthquake.usgs.gov/earthquakes/feed/geojsonp/1.0/week",
	jsonData;

var drawQuakes = {
	LoadData: function() {
		$.ajax({
			url: url,
			dataType: "jsonp",
			jsonp: false,
			jsonpCallback: "eqfeed_callback",
			success: function(data) {
				jsonData = data;
				drawQuakes.Extract(drawQuakes.DrawBars);
			},
			statusCode: {
				404: function() {alert("Data not found. Try retyping the URL")},
				500: function() {alert("You aren't authorized for this data")},
			}
		});
	}, Extract: function(callback) {
		for(i = 0; i < 10; i++) {
			quakeData[i] = jsonData.features[i];
		}
		callback();
	}, DrawBars: function() {
		console.log(quakeData[1].properties.mag);
		var barWidth = 40; //width of each bar
		var width = (barWidth + 8) * quakeData.length; //width of the entire canvas
		var height = 200; //height of the entire canvas
		var padding = 30;
		
		var x = d3.scale.linear().domain([0, quakeData.length]).range([0, width]);
		var y = d3.scale.linear().domain([0, d3.max(quakeData, function(datum) {return datum.properties.mag;})]).
			rangeRound([0, height]);
			
		//add the canvas to the dom	
		var barDemo = d3.select("#bar-demo").
			append("svg:svg").
			attr("width", width).
			attr("height", height + padding);
			
		barDemo.selectAll('rect').
			data(quakeData).
			enter().
			append('svg:rect').
			attr('x', function(datum, index) { return x(index); }).
			attr('y', function(datum) { return height - y(datum.properties.mag); }).
			attr('height', function(datum) {return y(datum.properties.mag); }).
			attr('width', barWidth).
			attr('fill', '#2d578b');
			
		barDemo.selectAll('text').
			data(quakeData).
			enter().
			append("svg:text").
			attr("x", function(datum, index) { return x(index) + barWidth; }).
			attr("y", function(datum) { return height - y(datum.properties.mag); }).
			attr("dx", -barWidth/2).
			attr("dy", "1.5em").
			attr("text-anchor", "middle").
			text(function(datum) { return datum.properties.mag; }).
			attr("fill", "white");
			
		barDemo.selectAll('text.yAxis').
			data(quakeData).
			enter().
			append('svg:text').
			attr('x', function(datum,index) { return x(index) + barWidth; }).
			attr('y', height).
			attr('dx', -barWidth/2).
			attr('text-anchor', 'middle').
			text(function(datum) { return datum.properties.net; }).
			attr('fill', 'black').
			attr('transform', 'translate(0, 18)').
			attr('class', 'yAxis');
	}
}