$(document).ready(function() {
	
	/*
var url = "http://earthquake.usgs.gov/earthquakes/feed/geojsonp/1.0/week",
		jsonData;
	$('#bar-demo').html('media/loading.gif').ajax({
		url: url,
		dataType: "jsonp",
		jsonp: false,
		jsonpCallback: "eqfeed_callback",
		success: function(data) {
			alert("Data Received!");
			jsonData = data;
			extract(drawBars);
		},
		statusCode: {
			404: function() {alert("Data not found. Try retyping the URL")},
			500: function() {alert("You aren't authorized for this data")},
		}
	});
*/

});

/* JSON STRUCTURE

{
	"type":"FeatureCollection",
	"features":[
		{
			"type":"Feature",
			"properties":{
				"mag":1.8,
				"place":"60km NW of Ester, Alaska",
				"time":1339446557,
				"tz":-480,
				"url":"/earthquakeseventpageak10490679",
				"felt":null,
				"cdi":null,
				"mmi":null,
				"alert":null,
				"status":"AUTOMATIC",
				"tsunami":null,
				"sig":"50",
				"net":"ak",
				"code":"10490679",
				"ids":",ak10490679,",
				"sources":",ak,",
				"types":",general-link,general-link,geoserve,nearby-cities,origin,"
			},
			"geometry":{
				"type":"Point",
				"coordinates":[-149.0674,65.1622,5.8]
			},
			"id":"ak10490679"
		}
	]
}

*/