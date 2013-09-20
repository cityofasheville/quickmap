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
      "field":{
        "name":"pinnum",
        "style":"key", //key,text,url,num
      },
    }],
  },
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
                    if(somedata.results[dataIdx].attributes[QuickMap.identifyLayers.fields[displayIDX].field.style] = 'key'){
                      popupHeaderText +=  '<option value="'+dataIdx+'" class="input-sm text-info" >'+somedata.results[dataIdx].attributes[QuickMap.identifyLayers.fields[displayIDX].field.name]  + '</option>';
                    }
                  }
                }
                popupHeaderText += '</select>';
              }                


            for (var dataIdx=0;dataIdx<somedata.results.length;dataIdx++ ){
 
              for (var displayIDX=0;displayIDX<QuickMap.identifyLayers.fields.length;displayIDX++ ){
                tActive='';
                if(dataIdx==0){tActive=' active'}else{tActive=' deactive'};
                popupContentText += '<div id="results'+dataIdx+'" class="record_list'+tActive+'" >';
                popupContentText += '<div ><b>PIN: </b>' + somedata.results[dataIdx].attributes[QuickMap.identifyLayers.fields[displayIDX].field.name] + '</div>';
                popupContentText += '</div>';

              }

              //popupContentText += QuickMap.identifyLayers.fields[i].field.name;
              //popupContentText += QuickMap.identifyLayers.fields[i].field.style;  //["name"] + '-' + QuickMap.identifyLayers.fields[i].name.field.style
            };




            // if(somedata.results.length > 1) {
            //   popupHeaderText += '<select class="form-control input-sm text-info"  onchange="QuickMap.toggleRec('+somedata.results.length+',this.value)" >'
            //   for (var i=0;i<somedata.results.length;i++ ) {
            //     popupHeaderText +=  '<option value="'+i+'" class="input-sm text-info" >'+somedata.results[i].attributes.pinnum + '</option>';
            //   }
            //   popupHeaderText += '</select>';
            // }
            
            // for (var i=0;i<somedata.results.length;i++ ) {
            //     tActive='';
            //     if(i==0){tActive=' active'}else{tActive=' deactive'};
            //     //popupContentText += '<div id="results'+i+'" class="record_list'+tActive+'" >' + somedata.results[i].attributes.pinnum + '</div>';
            //     popupContentText += '<div id="results'+i+'" class="record_list'+tActive+'" >';
            //     popupContentText += '<div ><b>PIN: </b>' + somedata.results[i].attributes.pinnum + '</div>';
            //     popupContentText += '<div ><b>Owner: </b>' + somedata.results[i].attributes.owner + '</div>';                
            //     //popupContentText += '<div ><b>Address: </b>' + somedata.results[i].attributes.address + '</div>';
            //     addressmaker = ' ';
            //     addressmaker += somedata.results[i].attributes.housenumber.isNull(' ') + ' ';
            //     addressmaker = addressmaker.replace('  ',' ')
            //     addressmaker += somedata.results[i].attributes.numbersuffix.isNull(' ') + ' ';
            //     addressmaker = addressmaker.replace('  ',' ')
            //     addressmaker += somedata.results[i].attributes.direction.isNull(' ') + ' ';
            //     addressmaker = addressmaker.replace('  ',' ')
            //     addressmaker += somedata.results[i].attributes.streetname.isNull(' ') + ' ';
            //     addressmaker = addressmaker.replace('  ',' ')
            //     addressmaker += somedata.results[i].attributes.streettype.isNull(' ') + ' ';
            //     addressmaker = addressmaker.replace('  ',' ')

            //     popupContentText += '<div ><b>Address: </b>' + 
            //                           addressmaker +
            //                         '</div>';
                    
            //     popupContentText += '<div ><b>Acreage: </b>' + somedata.results[i].attributes.acreage + '</div>';
            //     popupContentText += '<div ><b>Tax value: </b>' + somedata.results[i].attributes.taxvalue  + '</div>';
            //     popupContentText += '<div ><b>Buidling value: </b>' + somedata.results[i].attributes.buildingvalue  + '</div>';
            //     popupContentText += '<div ><a href="' + somedata.results[i].attributes.propcard  + '" target="_blank" >Property Card</a></div>';
            //     popupContentText += '<div ><a href="' + somedata.results[i].attributes.platurl  + '" target="_blank" >Plat</a></div>';
            //     popupContentText += '<div ><a href="' + somedata.results[i].attributes.deedurl  + '" target="_blank" >Deed</a></div>';
            //     popupContentText += '</div>';
            //};
            

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
    data={f:"json",sr:QuickMap.mySRID,layers:0,geometry:aPt,imageDisplay:"800,600,96",tolerance:3,mapExtent:bbox,geometryType:"esriGeometryPoint"};

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