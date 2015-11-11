
var urlHost = 'http://190.12.101.74/ais/alpi2';

var map;
var view;
var overviewmapCtrol;
var urlTile;
var urlWMS;
var mapFile;
var urlGeoJson = urlHost+'/ws/entidades/listar/4';
var layerLugaresOficiales;

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

var ban_estado_conexion = true;


$( document ).ready( function() { 
    var watchID = navigator.geolocation.watchPosition(onSuccessGPS, onErrorGPS, { timeout: 3000, enableHighAccuracy: true  });
	inicializar(); 
	//navigator.geolocation.getCurrentPosition(onSuccessGPS, onErrorGPS);  
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
		preload: Infinity,
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
		zoom: 12
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

	layerLugaresOficiales = new ol.layer.Vector({
		id: 1,
		type: 'overlay',
		nombre: 'lugaresoficiales',
		titulo: 'Lugares oficiales', 
		mapFile: '', 
		icono: urlHost+'/files/icons_layers/lugaresoficiales.png',
		//icono: urlHost+'/files/icons_layers/peek.svg',
		datasource: 1,
		visible: true,
		source: new ol.source.GeoJSON({
			projection: 'EPSG:3857',
			url: urlGeoJson
		}),
		style: function(feature, resolution) {
			var iconStyle = null;
			iconStyle = [new ol.style.Style({
				image: new ol.style.Icon( ({
				/*anchor: [0.5, 1],
            	scale: 1,
            	anchorXUnits: 'fraction',
            	anchorYUnits: 'fraction',	*/
					anchor: [32, 64],
					anchorXUnits: 'pixels',
					anchorYUnits: 'pixels',
					scale: 0.5,
					opacity: 0.90,				
					src: urlHost+'/files/icons_layers/lugaresoficiales_rubro_'+feature.get('rubro_id')+'.png'
					//src: urlHost+'/files/icons_layers/peek.svg'
				}))
			})];
			return iconStyle;
		}
	});
	
	map.addLayer(layerLugaresOficiales);	
	
	view.setCenter(posInicial);
};

function recorreEntidadesEnMapaPorPixel(pixel){
	map.forEachFeatureAtPixel(pixel, function(feature, layer) {
		if ((layer.get('type') != 'base') && (layer.get('nombre') != 'vectorLyBusqueda') && (layer.get('nombre') != 'vectorLyDibujo')){
			$('#infoEntidadTitulo').html(feature.get('nombre'));
			var copete = feature.get('rubro');
			copete += '<br><i class="fa fa-map-marker marker_info_iconos" style="padding-left: 3px; padding-right: 2px;"></i> '+feature.get('calle')+' '+feature.get('altura');
			copete += '<br><i class="fa fa-flag marker_info_iconos"></i>  a ' + obtenerDistancia(feature.getGeometry().getCoordinates(), posActual);
			$('#infoEntidadCopete').html(copete);
			var htmlDetalle = "";
			htmlDetalle += '<i class="fa fa-phone marker_info_iconos" style="padding-left: 2px;"></i> '+feature.get('telefono')+'<br>';
			htmlDetalle += '<i class="fa fa-envelope marker_info_iconos"></i> '+feature.get('email')+'<br>';
			htmlDetalle += '<i class="fa fa-globe marker_info_iconos" style="padding-left: 2px; margin-bottom: 10px;"></i> '+feature.get('web')+'<br>';
			htmlDetalle += '<div style="white-space: pre-line;">'+feature.get('descripcion')+'</div>';
			$('#divInfoEntidadDetalle').html(htmlDetalle);
			if (bandera_divInfoEntidadDetalle == true){
				verInfoDetallada();
			}
			
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

function obtenerDistancia(coordDesde, coordHasta){
	/* distancia */
	var wgs84Sphere = new ol.Sphere(6378137);
	var distance = wgs84Sphere.haversineDistance(ol.proj.transform(coordDesde, 'EPSG:3857', 'EPSG:4326'),ol.proj.transform(coordHasta, 'EPSG:3857', 'EPSG:4326')); 
	distance = Math.round(distance * 100) / 100;
	if (distance > 1000) {
		distance = (Math.round(distance / 1000 * 100) / 100) +
		' ' + 'km';
	} else {
		distance = (Math.round(distance * 100) / 100) +
		' ' + 'm';
	}
	return distance;
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

function refrescarMapa(){
	var layers = map.getLayers().getArray();
	for(i=0; i < layers.length; i++){
		var ly = layers[i];
		if (ly.get('datasource') == 0){ // WMS interno
			/* puede que updateParams no exista, es por ello el try */
			try {
				ly.getSource().updateParams({time_: (new Date()).getTime()});
			} catch(err) { 
				//console.log(ly.get('nombre'));
				//console.log(err);
			}
			
		} else if (ly.get('datasource') == 1){ // Geojson
			ly.getSource().clear();
			ly.setSource(new ol.source.GeoJSON({
				projection: 'EPSG:3857',
				url: urlGeoJson
			}));
		}
	}
}

function eliminarFiltroLugaresoficiales(){
	var sourceNuevo = new ol.source.GeoJSON({
		projection: 'EPSG:3857',
		url: urlGeoJson
	});
	layerLugaresOficiales.setSource(sourceNuevo);
	
	$('#divFiltradoMsj').hide();
    $('#divResultadoBusqueda').html('');
}