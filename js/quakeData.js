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
	chartType = 'azimuthal',
	drawQuakes = {
		LoadData: function () {
			console.log("starting ajax...");
			$.ajax({
				url: url,
				dataType: "jsonp",
				jsonp: false,
				jsonpCallback: "eqfeed_callback",
				success: function (data) {
					console.log("ajax success!");
					jsonData = data;
					switch (chartType) {
						case 'azimuthal':
							drawQuakes.Extract(drawQuakes.DrawAzimuthal);
							$('#mag-scale').show(500);
						break;
						case 'mercator':
							drawQuakes.Extract(drawQuakes.DrawMercator);
							$('#mag-scale').show(500);
						break;
						case 'bars':
							drawQuakes.Extract(drawQuakes.DrawBars);
							$('#mag-scale').hide(500);
						break;
					}
					drawQuakes.TimeStamp();
					//setTimeout(drawQuakes.RefreshData, 300000); //this will refresh the data every 5 minutes
				},
				statusCode: {
					404: function () { alert("Data not found. Try retyping the URL"); },
					500: function () { alert("You aren't authorized for this data"); }
				}
			});
		},
		Extract: function (callback) {
			console.log('extracting data');
			var barCount = Math.floor(1004 / (barWidth + barGutter));
			for (i = 0; i < barCount; i++) {
				quakeData[i] = jsonData.features[i];
			}
			callback();
		},
		DrawBars: function () {
			console.log('drawing bars...');
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
				
			console.log('bars complete');
			
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
			console.log('refreshing data...');
			$.ajax({
				url: url,
				dataType: "jsonp",
				jsonp: false,
				jsonpCallback: "eqfeed_callback",
				success: function (data) {
					console.log('refresh data success!');
					jsonData = data;
					switch (chartType) {
						case 'azimuthal':
							drawQuakes.Extract(drawQuakes.RedrawAzimuthal);
						break;
						case 'mercator':
							drawQuakes.Extract(drawQuakes.RedrawMercator);
						break;
						case 'bars':
							drawQuakes.Extract(drawQuakes.RedrawBars);
						break;
					}
					drawQuakes.TimeStamp();
					setTimeout(drawQuakes.RefreshData, 300000); //this will refresh the data every 5 minutes
				},
				statusCode: {
					404: function () { alert("Data not found. Try retyping the URL"); },
					500: function () { alert("You aren't authorized for this data"); }
				}
			});
		},
		RedrawBars: function () {
			console.log('redrawing bars...');
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
				
			console.log('redraw complete');
		}, DrawAzimuthal: function () {
			console.log('drawing projection...');
			var feature,
				quakeFeatures;
			
			var projection = d3.geo.azimuthal()
				.scale(380)
				.origin([-100,42])
				.mode("orthographic")
				.translate([512, 400]);
				
			var scale = {
				orthographic: 380,
				stereographic:  380,
				gnumonic: 380,
				equidistant: 380 / Math.Pi * 2,
				equalarea: 380 / Math.SQRT2
			};
				
			var circle = d3.geo.greatCircle()
				.origin(projection.origin());
				
			var path = d3.geo.path()
				.projection(projection);
				
			var quakes = d3.geo.path()
				.projection(projection);
				
			var svg = d3.select('#bar-demo')
				.append('svg:svg')
				.attr('width', 1024)
				.attr('height', 800)
				.on('mousedown', mousedown);
				
			d3.json("js/world-countries.json", function(collection) {
				console.log("drawing countries...");
				feature = svg.insert("svg:g", '#quakes').attr('id', 'countries').selectAll(".countries")
					.data(collection.features)
					.enter().insert("svg:path", '.quakes')
					.attr("d", clip)
					.attr('class', 'countries');
				
				feature.append("svg:title")
				  .text(function(d) { return d.properties.name; });
				  
				console.log('countries complete!');
			});
			
			console.log("drawing quakes...");
			quakeFeatures = svg.append("svg:g").attr('id', 'quakes').selectAll('.quakes')
				.data(quakeData)
				.enter()
				.insert('path', 'path')
				.attr('class', 'quakes')
				.attr('mag', function (d) { return d.properties.mag; })
				.attr('location', function (d) { return d.properties.place; })
				.attr('time', function (d) { var epochTime = d.properties.time; var date = new Date(epochTime * 1000); var localTime = date.toLocaleString(); return localTime; }) //NOTE: IN EPOCH
				.attr('felt', function (d) { return d.properties.felt; })
				.attr('tsunami', function (d) { return d.properties.tsunami; })
				.attr('d', clipQ);
			
			d3.select(window)
				.on("mousemove", mousemove)
				.on("mouseup", mouseup);
			
			var m0,
				o0;
			
			function mousedown() {
				m0 = [d3.event.pageX, d3.event.pageY];
				o0 = projection.origin();
				d3.event.preventDefault();
			}
			
			function mousemove() {
				if (m0) {
					var m1 = [d3.event.pageX, d3.event.pageY],
						o1 = [o0[0] + (m0[0] - m1[0]) / 8, o0[1] + (m1[1] - m0[1]) / 8];
					projection.origin(o1);
					circle.origin(o1);
					refresh();
				}
			}
			
			function mouseup() {
				if (m0) {
					mousemove();
					m0 = null;
				}
			}
			
			function refresh(duration) {
				(duration ? feature.transition().duration(duration) : feature).attr("d", clip);
				(duration ? quakeFeatures.transition().duration(duration) : quakeFeatures).attr("d", clipQ);
			}
			
			function clip(d) {
				return path(circle.clip(d));
			}
			
			function clipQ(d) {
				var qData = d;
				quakes.pointRadius( function () { return d.properties.mag * 10; });
				return quakes(circle.clip(d));
			}
			
			svg.selectAll('.quakes')
				.data(quakeData)
				.on('mouseover', function (d, i) {
					d3.select(this)
						.transition()
						.duration(150)
						.style('fill', '#de5d1d')
						.style('stroke', '#bd5917');
				})
				.on('mouseout', function (d, i) {
					d3.select(this)
						.transition()
						.duration(150)
						.style('fill', '#DED71D')
						.style('stroke', '#BDB717');
				});
			
			console.log('projection complete');
		}, DrawMercator: function() {
		
		}
	};

$(document).ready(function () {
	drawQuakes.LoadData();
	
	$( '.projection-type' ).change(function () {
		chartType = $( 'select option:selected' ).attr('value');
		$( '#bar-demo' ).empty();
		console.log('redrawing...')
		drawQuakes.LoadData();
	});
	
	/*
$('.quakes').hover(function () {
		console.log("quake hover");
		$(this).animate({'fill': 'red'}, 200);
	}, function () {
		$(this).animate({'fill': '#DED71D'}, 200);
	})
*/
});