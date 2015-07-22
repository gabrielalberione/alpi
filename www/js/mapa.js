var map;
var view;
var overviewmapCtrol;
var urlTile;
var urlWMS;
var mapFile;

var posActual = [-6115346.57498699, -4155607.5112465755];
var posInicial = [-6115346.57498699, -4155607.5112465755];
var featurePosActual;

var opClick = 0;

var sourceLyBusqueda; // source utilizado para el layer medir distancia y area
var vectorLyBusqueda; // ly utilizado para medir distancia y area
var drawInteraction; // interacion para dibujar
var measureTooltip; // tooltip

var sourceLyDibujo; // source utilizado para el layer dibujar
var vectorLyDibujo; // ly utilizado para dibujar

var cantCapasBases = 0; // cantidad de capas bases que existen
var osm = null; // OpenStreetMap
var mapQuest = null; // mapQuest
var bingMapsSatelital = null;
var bingMaps = null;

$( document ).ready( function() { 
	inicializar(); 
	//navigator.geolocation.getCurrentPosition(onSuccessGPS, onErrorGPS);  
    var watchID = navigator.geolocation.watchPosition(onSuccessGPS, onErrorGPS, { timeout: 3000, enableHighAccuracy: true  });
});
$( window ).resize( function() { 
	$('#map').css("height", $( window ).height());
	map.updateSize();
});

function inicializar(){
	
	$('#map').css("height", $( window ).height());
	
	urlTile = "";
	urlWMS = "";
	mapFile = "";
		
	osm = new ol.layer.Tile({
		id: 'base_'+1,
		name: 'osm',
		type: 'base',
		title: 'Open Street Map',
		visible: true,
		source: new ol.source.OSM()
	});
	
	bingMaps = new ol.layer.Tile({
		id: 'base_'+2,
		name: 'bingMaps',
		type: 'base',
		title: 'Bing Maps',
		visible: false,
		source: new ol.source.BingMaps({
			key: 'AiWOEQkUaequRY_hR9K9vBorMmutTibMfX6YMe4QPZj78A_7yaA-IiOPjngEO-Zb',
			imagerySet: 'Road'})
	});
	
	bingMapsSatelital = new ol.layer.Tile({
		id: 'base_'+3,
		name: 'bingMapsSatelital',
		type: 'base',
		title: 'Bing Satelital',
		visible: false,
		source: new ol.source.BingMaps({
			key: 'AiWOEQkUaequRY_hR9K9vBorMmutTibMfX6YMe4QPZj78A_7yaA-IiOPjngEO-Zb',
			imagerySet:'AerialWithLabels'})
	});
	
	mapQuest = new ol.layer.Tile({
		id: 'base_'+4,
		name: 'watercolor',
		type: 'base',
		title: 'Map Quest',
		visible: false,
		source: new ol.source.MapQuest({layer: 'osm'})
	});
	
	var layersBases = [osm, bingMaps, bingMapsSatelital, mapQuest];
	cantCapasBases = layersBases.length;
	/* END crea los mapas bases */
	
	view = new ol.View({
		center: posInicial,
		zoom: 13
	});
	/**/
	
	map = new ol.Map({
		target: 'map',
		layers: layersBases,
		view: view
	});
	
	map.on('click', function(evt) {
		displayFeatureInfo(evt.pixel);
	});
	
	view.setCenter(posInicial);
};

/* PARAMETROS deben estar en 4326 */
function puntoGPS(xparam, yparam){	
	var pos3857 = ol.proj.transform([xparam, yparam],'EPSG:4326','EPSG:3857');
	var xAnt = posActual[0];
	var yAnt = posActual[1];
	var x = pos3857[0];
	var y = pos3857[1];
	
	posActual[0] = x;
	posActual[1] = y;
	
	if (featurePosActual == null){
		featurePosActual = new ol.Feature({
			geometry: new ol.geom.Point([x,y]),
			nombre: 'Mi posición',
			icono: 'mi_ballon.png'
		});
	
		featuresOverlay = new ol.FeatureOverlay({
			map: map,
			features: [featurePosActual]
		});
		
		var iconStyle = new ol.style.Style({
			image: new ol.style.Icon(({
				opacity: 0.75,
				src: urlFiles+'iconos/mi_ballon.png'
			}))
		});
		
		featurePosActual.setStyle(iconStyle);
	} else {
		featurePosActual.setGeometry(new ol.geom.Point([x,y]));
	}

}

function centrarMiPosicion(){
    view.setCenter([posActual[0],posActual[1]]);
}
