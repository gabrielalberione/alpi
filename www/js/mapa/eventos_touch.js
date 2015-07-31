$("#swipe_zona_marker").swipe( {
 //Generic swipe handler for all directions
 swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
	if(direction == "down"){
	   $("#marker_detalle").show("slow");
-			   $("#marker_flecha").attr('class', 'fa fa-sort-asc');
+			   $("#marker_flecha").attr('class', 'fa fa-arrow-up');
	   bandera_marker_detalle = true;
   }
	if(direction == "up"){
	   if(bandera_marker_detalle){
		   $("#marker_detalle").hide("slow");
-				   $("#marker_flecha").attr('class', 'fa fa-sort-desc');			   
+				   $("#marker_flecha").attr('class', 'fa fa-arrow-down');			   
	   }else{
		   $("#info_marker").toggle("slow");
	   }
	   bandera_marker_detalle = false;
   }		   
 },
 //Default is 75px, set to 0 for demo so any distance triggers swipe
  threshold:0
});
$("#marker_detalle").swipe( {
 //Generic swipe handler for all directions
 swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
	if(direction == "down"){
	   $("#marker_detalle").show("slow");
-			   $("#marker_flecha").attr('class', 'fa fa-sort-asc');
+			   $("#marker_flecha").attr('class', 'fa fa-arrow-up');
	   bandera_marker_detalle = true;
   }
	if(direction == "up"){
	   if(bandera_marker_detalle){
		   $("#marker_detalle").hide("slow");
-				   $("#marker_flecha").attr('class', 'fa fa-sort-desc');			   
+				   $("#marker_flecha").attr('class', 'fa fa-arrow-down');			   
	   }else{
		   $("#info_marker").toggle("slow");
	   }
	   bandera_marker_detalle = false;
   }		   
 },
 //Default is 75px, set to 0 for demo so any distance triggers swipe
  threshold:0
});