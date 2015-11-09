var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
		document.addEventListener('focusout', function(e) {window.scrollTo(0, 0)});
		navigator.geolocation.getCurrentPosition(onSuccess, onError);  
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
		document.addEventListener('offline', onDeviceOffline, false);
		document.addEventListener('online', onDeviceOnline, false);		
		if((navigator.network.connection.type).toUpperCase() != "NONE" &&
		   (navigator.network.connection.type).toUpperCase() != "UNKNOWN") {
			this.onDeviceOnline();
		}else{
			this.onDeviceOffline();
		}
		navigator.splashscreen.hide();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }		
};

// cuando devuelve la pos el gps
var onSuccessGPS = function(position) {    
   /* alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');*/
	var divEstado = document.getElementById("estado_gps");
	divEstado.setAttribute('style', 'display:none;');	    
    puntoGPS(position.coords.longitude, position.coords.latitude);	
};

// onError Callback receives a PositionError object
//
function onErrorGPS(error) {
	if(error.code == 3){
		var divEstado = document.getElementById("estado_gps");
		divEstado.setAttribute('style', 'display:block;');	
	}
  /* alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n'); */
}

function onSuccess(position) {
	  // your callback here 
}

function onError(error) { 
  // your callback here
}

function verificiarConexion(){
	if((navigator.network.connection.type).toUpperCase() != "NONE" &&
	   (navigator.network.connection.type).toUpperCase() != "UNKNOWN") {
		onDeviceOnline();
		if(!ban_estado_conexion){
			refrescarMapa();
			cargarComboBusqueda();
		}
		ban_estado_conexion = true;	   
	}else{
		onDeviceOffline();
		ban_estado_conexion = false;
	}
}

function onDeviceOffline(){
	//console.log("esta offline");	
	var divEstado = document.getElementById("estado_conexion");
	divEstado.setAttribute('style', 'display:block;');	
}

function onDeviceOnline(){
	//console.log("esta online");
	var divEstado = document.getElementById("estado_conexion");
	divEstado.setAttribute('style', 'display:none;');	
}

