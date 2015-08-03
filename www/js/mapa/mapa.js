
var urlHost = 'http://190.12.101.74/ais/alpi';

var map;
var view;
var overviewmapCtrol;
var urlTile;
var urlWMS;
var mapFile;
var urlGeoJson = urlHost+'/ws/entidades/listar/4';

var posActual = [-6506141.183454158, -4110246.2464916063];
var posInicial = [-6506141.183454158, -4110246.2464916063];
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
	
	var layersBases = [osm];
	cantCapasBases = layersBases.length;
	/* END crea los mapas bases */
	
	view = new ol.View({
		center: posInicial,
		zoom: 11
	});
	/**/
	
	map = new ol.Map({
		target: 'map',		
		layers: layersBases,
		view: view
	});
	
	map.on('singleclick', function(evt) {
		$("#divInfoEntidad").hide();
		/* verifica si hay entidades en layers tipo vector GeoJSON */
		recorreEntidadesEnMapaPorPixel(evt.pixel);
	});

	var vectorLayer = new ol.layer.Vector({
		id: 1,
		type: 'overlay',
		nombre: 'lugaresoficiales',
		titulo: 'Lugares oficiales', 
		mapFile: '', 
		icono: urlHost+'/files/icons_layers/lugaresoficiales.png',
		datasource: 1,
		visible: true,
		source: new ol.source.GeoJSON({
			projection: 'EPSG:3857',
			url: urlGeoJson
		}),
		style: function(feature, resolution) {
			var iconStyle = null;
			if (true){ //(feature.get('icono') != null){
				iconStyle = [new ol.style.Style({
					image: new ol.style.Icon( ({
						anchor: [16, 32],
						anchorXUnits: 'pixels',
						anchorYUnits: 'pixels',
						opacity: 0.75,
						src: urlHost+'/files/icons_layers/lugaresoficiales.png'
					}))
				})];
			}
			return iconStyle;
		}
	});
	
	map.addLayer(vectorLayer);	
	
	view.setCenter(posInicial);
};

function recorreEntidadesEnMapaPorPixel(pixel){
	map.forEachFeatureAtPixel(pixel, function(feature, layer) {
		if ((layer.get('type') != 'base') && (layer.get('nombre') != 'vectorLyBusqueda') && (layer.get('nombre') != 'vectorLyDibujo')){
			$('#infoEntidadTitulo').html(feature.get('nombre'));
			$('#infoEntidadCopete').html(feature.get('rubro')+'<br><i class="fa fa-map-marker"></i> '+feature.get('calle')+' '+feature.get('altura'));
			var htmlDetalle = "";
			htmlDetalle += '<i class="fa fa-phone"></i> '+feature.get('telefono')+'<br>';
			htmlDetalle += '<i class="fa fa-envelope"></i> '+feature.get('email')+'<br>';
			htmlDetalle += '<i class="fa fa-globe"></i> '+feature.get('web')+'<br>';
			htmlDetalle += feature.get('descripcion')+'<br>';
			$('#divInfoEntidadDetalle').html(htmlDetalle);
			
			var ms = feature.get('Multimedias');
			$('#infoEntidadImg').attr('src','./img/sinimagen.png');
			$('#infoEntidadImgA').attr('href',"javascript:imageAlert('./img/sinimagen.png')");
			if (typeof ms[0] != 'undefined'){
				var m = ms[0];
				var urlimg = feature.get('MultimediasUrl')+m.Multimedia.codigo;
				$('#infoEntidadImg').attr('src',urlimg);	
				$('#infoEntidadImgA').attr('href',"javascript:imageAlert('"+urlimg+"')");		
			}
			$("#divInfoEntidad").show(500);
		}
	});
}

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
		/**
		featurePosActual = new ol.Overlay({
			position: [x,y],
			element: $('<div class="marker"><div class="dot"></div><div class="pulse"></div></div>')
		});
		map.addOverlay(featurePosActual);
		/**/
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
				anchor: [15, 15],
				anchorXUnits: 'pixels',
				anchorYUnits: 'pixels',
				opacity: 0.75,
				src: 'iconos/miposicion.png'
			}))
		});
		
		featurePosActual.setStyle(iconStyle);
		/**/
	} else {
		//featurePosActual.setPosition([x,y]);
		featurePosActual.setGeometry(new ol.geom.Point([x,y]));
	}
}

function centrarMiPosicion(){
    view.setCenter([posActual[0],posActual[1]]);
}

function ubicarEnMapa(x,y){
	$("#divInfoEntidad").hide();
	
	/* efecto, centrar en mapa */
	var pan = ol.animation.pan({
		duration: 1000,
		source: view.getCenter()
	});
	map.beforeRender(pan);
	if (view.getZoom() < 16){
		view.setZoom(16);
	}
	/**/
	view.setCenter([x,y]);
	/* END efecto */
	var s = setInterval(function(){ recorreEntidadesEnMapaPorPixel(map.getPixelFromCoordinate([x,y])); clearInterval(s); }, 1200);
	
}