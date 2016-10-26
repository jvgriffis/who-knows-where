(function() {

var map = null;
var layersControl = null;

var getMap = function() {

	if (map != null) {
		console.log('map already');
		return Q.resolve(map);
	}

	console.log('new map');
	return Q(true)
	.then(function() {
		map = L.map('map').fitBounds([[ 50, -66 ], [ 24, -126 ]]);
		L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
			subdomains: ['a','b','c','d']
		}).addTo(map);

		var layersControl = L.control.layers();
		layersControl.addTo(map);
		map.getLayersControl = function() { return layersControl; };

		return map;
	});
}

var startup = function() {
	L.Icon.Default.imagePath = '/media/images/leaflet';

	var circle = {
		radius: 5,
		fillColor: "#ff7800",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	}

	getMap()
	.then(function(map) {
		return Q.all([map, AJAX.get('./data/mapzen.geojson')]);
	})
	.spread(function(map, geojson) {
		var mapzen = L.geoJson(geojson, {
			pointToLayer: function(p, ll) {
				return L.circleMarker(ll, circle);
			}
		});

		map.getLayersControl().addOverlay(mapzen, 'Mapzen Results');
		mapzen.addTo(map);

		return Q.all([map, AJAX.get('./data/bing.geojson')]);
	})
	.spread(function(map, geojson) {
		circle.fillColor = '#78ff00';
		var bings = L.geoJson(geojson, {
			pointToLayer: function(p, ll) {
				return L.circleMarker(ll, circle);
			}
		});

		map.getLayersControl().addOverlay(bings, 'Bing Results');
		bings.addTo(map);
	})
	.catch(function(e) {
		console.warn(e);
	});
}

var loadBatch = function() {
}

var doSearch = function() {
}

var routes = {
	'/': startup,
	'/batch_results': loadBatch,
	'/search': doSearch
}

document.addEventListener('DOMContentLoaded', function() {

	var router = Router(routes);
	router.init();

	window.location = '#/';
});

})();
