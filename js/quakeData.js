var quakeData = [], i,
	url = "http://earthquake.usgs.gov/earthquakes/feed/geojsonp/1.0/week",
	jsonData,
	barWidth = 40, //width of each bar
	barGutter = 8, //width of gutter between bars
	width = 1024, //width of the entire canvas
	height = 510, //height of the entire canvas
	padding = 30,
	x,
	y,
	barDemo,
	drawQuakes = {
		LoadData: function () {
			$.ajax({
				url: url,
				dataType: "jsonp",
				jsonp: false,
				jsonpCallback: "eqfeed_callback",
				success: function (data) {
					jsonData = data;
					drawQuakes.Extract(drawQuakes.DrawBars);
					drawQuakes.TimeStamp();
					setTimeout(drawQuakes.RefreshData, 300000); //this will refresh the data every 5 minutes
				},
				statusCode: {
					404: function () { alert("Data not found. Try retyping the URL"); },
					500: function () { alert("You aren't authorized for this data"); }
				}
			});
		},
		Extract: function (callback) {
			var barCount = Math.floor(1004 / (barWidth + barGutter));
			for (i = 0; i < barCount; i++) {
				quakeData[i] = jsonData.features[i];
			}
			callback();
		},
		DrawBars: function () {
			x = d3.scale.linear().domain([0, quakeData.length]).range([0, width - 10]);
			y = d3.scale.linear().domain([0, 10]).rangeRound([0, height]);
			barDemo = d3.select("#bar-demo")
				.append("svg:svg")
				.attr("width", width)
				.attr("height", height + padding)
				.append('g')
				.attr('transform', 'translate(20, 10)');
				
			barDemo.selectAll('.hLine')
				.data(y.ticks(9))
				.enter()
				.append('line')
				.attr('class', 'hLine')
				.attr('x1', 0)
				.attr('x2', width)
				.attr('y1', function (datum, index) { return height - y(index); })
				.attr('y2', function (datum, index) { return height - y(index); })
				.style('stroke', '#cccccc')
				.attr('transform', 'translate(0,.5)');
				
			barDemo.selectAll('.rule')
				.data(y.ticks(9))
				.enter()
				.append('text')
				.attr('class', 'rule')
				.attr('x', 0)
				.attr('y', function (datum, index) { return height - y(index); })
				.attr('dx', -13)
				.attr('dy', 5)
				.attr('text-anchor', 'middle')
				.text(String);
				
			barDemo.selectAll('.rect')
				.data(quakeData)
				.enter()
				.append('svg:rect')
				.attr('x', function (datum, index) { return x(index); })
				.attr('y', function (datum) { return height - y(datum.properties.mag); })
				.attr('height', function (datum) {return y(datum.properties.mag); })
				.attr('width', barWidth)
				.attr('class', 'rect')
				.attr('fill', '#2d578b')
				.attr('onmouseover', 'DoSomething()');
				
			barDemo.selectAll('.barLabel')
				.data(quakeData)
				.enter()
				.append("svg:text")
				.attr("x", function (datum, index) { return x(index) + barWidth; })
				.attr("y", function (datum) { return height - y(datum.properties.mag); })
				.attr("dx", -barWidth / 2)
				.attr("dy", "1.5em")
				.attr("text-anchor", "middle")
				.text(function (datum) { return datum.properties.mag; })
				.attr("fill", "white")
				.attr('class', 'barLabel');
				
			barDemo.selectAll('.yAxis')
				.data(quakeData)
				.enter()
				.append('svg:text')
				.attr('x', function (datum, index) { return x(index) + barWidth; })
				.attr('y', height)
				.attr('dx', -barWidth / 2)
				.attr('text-anchor', 'middle')
				.text(function (datum) { return datum.properties.net; })
				.attr('fill', 'black')
				.attr('transform', 'translate(0, 18)')
				.attr('class', 'yAxis');
			
		},
		TimeStamp: function () {
			var epochTime = quakeData[0].properties.time,
				date = new Date(epochTime * 1000),
				localTime = date.toLocaleString(),
				now = new Date(),
				hour = now.getHours(),
				minute = now.getMinutes(),
				second = now.getSeconds();
				
			if (hour < 10) {
				hour = "0" + hour;
			}
			if (minute < 10) {
				minute = "0" + minute;
			}
			if (second < 10) {
				second = "0" + second;
			}
				
			$('#last-quake-time').text(localTime);
			$('#data-timestamp span').text(hour + ":" + minute + ":" + second);
		},
		RefreshData: function () {
			$.ajax({
				url: url,
				dataType: "jsonp",
				jsonp: false,
				jsonpCallback: "eqfeed_callback",
				success: function (data) {
					jsonData = data;
					drawQuakes.Extract(drawQuakes.RedrawBars);
					drawQuakes.TimeStamp();
					setTimeout(drawQuakes.RefreshData, 120000); //this will refresh the data every 5 minutes
				},
				statusCode: {
					404: function () { alert("Data not found. Try retyping the URL"); },
					500: function () { alert("You aren't authorized for this data"); }
				}
			});
		},
		RedrawBars: function () {
			var rect = barDemo.selectAll(".rect")
					.data(quakeData, function (datum) { return datum.properties.time; }),
				text = barDemo.selectAll("text.barLabel")
					.data(quakeData, function (datum) { return datum.properties.time; }),
				yAxis = barDemo.selectAll("text.yAxis")
					.data(quakeData, function (datum) { return datum.properties.time; });
				
			rect.enter()
				.insert("rect", "rect")
				.attr('x', function (datum, idx) { return x(idx - 1); }) //swapped + and -. Revert back if it's broken!
				.attr('y', function (datum) { return height - y(datum.properties.mag); })
				.attr('width', barWidth)
				.attr('height', function (datum) { return y(datum.properties.mag); })
				.attr('fill', '#2d578b')
				.attr('class', 'rect')
				.transition()
				.duration(1000)
				.attr('x', function (datum, idx) { return x(idx); });
				
			rect.transition()
				.duration(1000)
				.attr('x', function (datum, idx) { return x(idx); });
				
			rect.exit()
				.transition()
				.duration(1000)
				.attr('x', function (datum, idx) { return x(idx + 1); })
				.remove();
				
			text.enter()
				.append("text")
				.attr('x', function (datum, idx) { return x(idx - 1) + barWidth; })
				.attr('y', function (datum) { return height - y(datum.properties.mag); })
				.attr('dx', -barWidth / 2)
				.attr('dy', "1.5em")
				.attr('text-anchor', 'middle')
				.attr('fill', 'white')
				.attr('class', 'barLabel')
				.text(function (datum) { return datum.properties.mag; })
				.transition()
				.duration(1000)
				.attr('x', function (datum, idx) { return x(idx) + barWidth; });
				
			text.transition()
				.duration(1000)
				.attr('x', function (datum, idx) { return x(idx) + barWidth; });
				
			text.exit()
				.transition()
				.duration(1000)
				.attr('x', function (datum, idx) { return x(idx + 1) + barWidth; })
				.remove();
				
			yAxis.enter()
				.append("text")
				.attr('x', function (datum, idx) { return x(idx - 1) + barWidth; })
				.attr('y', height)
				.attr('dx', -barWidth / 2)
				.attr('text-anchor', 'middle')
				.attr('fill', 'black')
				.attr('transform', 'translate(0, 18)')
				.attr('class', 'yAxis')
				.text(function (datum) { return datum.properties.net; })
				.transition()
				.duration(1000)
				.attr('x', function (datum, idx) { return x(idx) + barWidth; });
				
			yAxis.transition()
				.duration(1000)
				.attr('x', function (datum, idx) { return x(idx) + barWidth; });
				
			yAxis.exit()
				.transition()
				.duration(1000)
				.attr('x', function (datum, idx) { return x(idx + 1) + barWidth; })
				.remove();
		}
	};

$(document).ready(function () {
	drawQuakes.LoadData();
});