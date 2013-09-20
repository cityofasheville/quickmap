String.prototype.isNull = function(replaceValue) {

    if(replaceValue==null){rep='';}else{rep=replaceValue}

    if(this==null || this=='Null'){return rep;}else{return this;}
  };  
var QuickMap = QuickMap || {};
var QuickMap = {

  agsServerGeocode:'gis.ashevillenc.gov', //ArcGIS  server name for geocoding
  agsServerInstanceNameGeocode:'COA_ArcGIS_Server', //ArcGIS  server instance for geocoding
  geocdingLayerName:'Buncombe_Street_Address', //geocoding service to use.
  mySRID:2264, //your projection id
  currentRec:0,
  totalRecs:0,
  identifyLayers:{
    "layerIndex":0,
    fields:[{
        "id":0,
        "name":"pinnum",
        "style":"key", //key,text,url,num
        "label":"PIN"
      }],
  },
  setIdentifyLayers:function(val){QuickMap.identifyLayers=val},
  setTotalRecs:function(val){QuickMap.totalRecs=val;},
  setCurrentRec:function(val){QuickMap.currentRec=val;},
  zoomMap :function(data){
    xStr=data.geometries[0].x;
    yStr=data.geometries[0].y;
    map.setView(new L.LatLng(yStr, xStr), 17);
    var startPt = '[{"type": "Point","coordinates":['+xStr+','+yStr+']}]';
    QuickMap.drawPoints(startPt);
    return '';
  },
  retLayerInfo:function(somedata,eventData){
      if(somedata.results.length > 0) {
            QuickMap.setTotalRecs(somedata.results.length);
            popupContentText = '';
            popupHeaderText = '';
            popupHeaderText = '<h4>Found '+QuickMap.totalRecs+' records!</h4>'

             
             if(QuickMap.totalRecs > 1) {
                popupHeaderText += '<select class="form-control input-sm text-info"  onchange="QuickMap.toggleRec('+QuickMap.totalRecs+',this.value)" >'
                for (var dataIdx=0;dataIdx<QuickMap.totalRecs;dataIdx++ ) {
                  for (var displayIDX=0;displayIDX<QuickMap.identifyLayers.fields.length;displayIDX++ ){
                    if(QuickMap.identifyLayers.fields[displayIDX].style == 'key'){
                      popupHeaderText +=  '<option value="'+dataIdx+'" class="input-sm text-info" >'+somedata.results[dataIdx].attributes[QuickMap.identifyLayers.fields[displayIDX].name]  + '</option>';
                    }
                  }
                }
                popupHeaderText += '</select>';
              }                


            for (var dataIdx=0;dataIdx<QuickMap.totalRecs;dataIdx++ ) {
              tActive='';
              if(dataIdx==0){tActive=' active'}else{tActive=' deactive'};
              popupContentText += '<div id="results'+dataIdx+'" class="record_list'+tActive+'" >';  
              for (var displayIDX=0;displayIDX<QuickMap.identifyLayers.fields.length;displayIDX++ ){
                switch(QuickMap.identifyLayers.fields[displayIDX].style){
                  case "key":
                    popupContentText += '<div><b>'+QuickMap.identifyLayers.fields[displayIDX].label+': </b>' + 
                                        somedata.results[dataIdx].attributes[QuickMap.identifyLayers.fields[displayIDX].name] + '</div>';
                    break;
                  case "text":
                    popupContentText += '<div><b>'+QuickMap.identifyLayers.fields[displayIDX].label+': </b>' + 
                                        somedata.results[dataIdx].attributes[QuickMap.identifyLayers.fields[displayIDX].name] + '</div>';
                    break;
                  case "url":
                    popupContentText += '<div ><a href="' + somedata.results[dataIdx].attributes[QuickMap.identifyLayers.fields[displayIDX].name]  + '" target="_blank" >' +
                                        QuickMap.identifyLayers.fields[displayIDX].label+'</a></div>';
                    break;
                  case "number":
                    popupContentText += '<div ><b>'+QuickMap.identifyLayers.fields[displayIDX].label+': </b>' + 
                                        somedata.results[dataIdx].attributes[QuickMap.identifyLayers.fields[displayIDX].name] + '</div>';
                    break;
                  case "currency":
                    popupContentText += '<div ><b>'+QuickMap.identifyLayers.fields[displayIDX].label+': </b>' + 
                                        '$'+parseInt(somedata.results[dataIdx].attributes[QuickMap.identifyLayers.fields[displayIDX].name]).toFixed(2) + '</div>';
                    break;
                  default: 
                     popupContentText += '<div><b>'+QuickMap.identifyLayers.fields[displayIDX].label+': </b>' + 
                                        somedata.results[dataIdx].attributes[QuickMap.identifyLayers.fields[displayIDX].name] + '</div>';
                    break;
               };                
              }
              popupContentText += '</div>';
            };

           

            //Add Popup to the map when the mouse was clicked at
             popup = new L.Popup({
              maxWidth: 250,
              maxHeight: 250,
              minHeight: 50,
            });

            popup.setLatLng(eventData.latlng);
            popup.setContent(popupHeaderText+popupContentText);
            map.openPopup(popup);
        }
  },
  toggleRec:function(total,index){
      QuickMap.setCurrentRec(index)
       for (var i=0;i<total;i++ ) {$('#results'+i).hide();}
      $('#results'+index).show();
  },
  getStateplane:function(eventData){
    xStr = eventData.latlng.lng.toFixed(8);
    yStr = eventData.latlng.lat.toFixed(8);

    var urlStr = 'http://'+QuickMap.agsServerGeocode+'/'+QuickMap.agsServerInstanceNameGeocode+'/rest/services/Geometry/GeometryServer/project';
    var aPt=JSON.stringify({geometryType:"esriGeometryPoint",geometries : [{"x":xStr,"y":yStr}]});

    var data={f:"json",inSR:4326,outSR:QuickMap.mySRID,geometries:aPt};

     $.ajax({
        url: urlStr,
        dataType: "jsonp",
        data: data,
         crossDomain: true,
         success:function(data){QuickMap.getLayerInfo(data,eventData);},
         error:function(x,t,m){console.log('fail');}//updateResultsFail(t,'Error with transforming to WGS84!')
     });
  },
  getLayerInfo:function(somedata,eventData){
    xStr=somedata.geometries[0].x;
    yStr=somedata.geometries[0].y;
 
    aPt =  JSON.stringify( {"x":xStr,"y":yStr,"spatialReference":{"wkid":QuickMap.mySRID}}) 
    bbox = JSON.stringify(
      {
        "xmin":map.getBounds()._southWest.lng,"ymin":map.getBounds()._southWest.lat,"xmax":map.getBounds()._northEast.lng,"ymax":map.getBounds()._northEast.lat,"spatialReference":{"wkid":4326}
      })
 
    urlStr = 'http://'+QuickMap.agsServerGeocode+'/'+QuickMap.agsServerInstanceNameGeocode+'/rest/services/OpenDataAsheville/bc_parcels/MapServer/identify';
    data={f:"json",sr:QuickMap.mySRID,layers:0,geometry:aPt,imageDisplay:"800,600,96",tolerance:3,mapExtent:bbox,geometryType:"esriGeometryPoint",returnGeometry:false};

       $.ajax({
        url: urlStr,
        dataType: "jsonp",
        data: data,
         crossDomain: true,
         success:function(data){QuickMap.retLayerInfo(data,eventData);},
         error:function(x,t,m){console.log('fail');}
     });

   
  },
  getLatLong:function (someData){
    xStr=someData.x;
    yStr=someData.y;

    var urlStr = 'http://'+QuickMap.agsServerGeocode+'/'+QuickMap.agsServerInstanceNameGeocode+'/rest/services/Geometry/GeometryServer/project';
    var aPt=JSON.stringify({geometryType:"esriGeometryPoint",geometries : [{"x":xStr,"y":yStr}]});

    var data={f:"json",inSR:QuickMap.mySRID,outSR:4326,geometries:aPt};

     $.ajax({
        url: urlStr,
        dataType: "jsonp",
        data: data,
         crossDomain: true,
         success:function(data){QuickMap.zoomMap(data);},
         error:function(x,t,m){console.log('fail');}//updateResultsFail(t,'Error with transforming to WGS84!')
     });
   },
   drawPoints:function(GJfeat){
    QuickMap.clearMap();
    GJfeatObject=JSON.parse(GJfeat);
   var geojsonMarkerOptions = {
      radius: 10,
      fillColor: "#468847",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }
    var HouseIcon = L.icon({
      iconUrl: 'img/houseblack.png',
      iconSize: [40, 40],
      iconAnchor: [0, 0],
    });
    var gjPT = L.geoJson(GJfeatObject, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
      }
    });
    gjPT.addTo(map);
  },
  clearMap:function() {
    for(i in map._layers) {
        if(map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch(e) {
                //do nothing....
            }
        }
    };
  }
} 