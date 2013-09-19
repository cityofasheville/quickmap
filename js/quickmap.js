var QuickMap = QuickMap || {};
var QuickMap = {
  CR:0,
  agsServerGeocode:'gis.ashevillenc.gov', //ArcGIS  server name for geocoding
  agsServerInstanceNameGeocode:'COA_ArcGIS_Server', //ArcGIS  server instance for geocoding
  geocdingLayerName:'Buncombe_Street_Address', //geocoding service to use.
  mySRID:2264, //your projection id
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
            //Popup text should be in html format.  Showing the Storm Name with the type
            //popupText =  '<dl><h2>Pin: ' + somedata.results[0].attributes.pinnum + '</h2>' + 
            //    '<dt>Address: </dt><dd>' +somedata.results[0].attributes.address + '</dd>' +
            //    '<dt>Tax Value: </dt><dd>' +somedata.results[0].attributes.taxvalue + '</dd>' +
            //    '<dt>Buiding Value: </dt><dd>' +somedata.results[0].attributes.buildingvalue + '</dd>' +
            //    '<dd><a href="' + somedata.results[0].attributes.propcard +'" target="_blank" >Property Card</a>'  + '</dd>' +
            //    '<dd><a href="' + somedata.results[0].attributes.platurl +'" target="_blank" >Plat</a>'  + '</dd>' + 
            //    '<dd><a href="' + somedata.results[0].attributes.deedurl +'" target="_blank" >Deed</a>'  + '</dd>' +
            //   '</dl>';
            popupContentText = ''
            popupHeaderText = '<h3>Found '+somedata.results.length+' records!</h3><select class="form-control">'
            for (var i=0;i<somedata.results.length;i++ ) {
                            popupHeaderText +=  '<option onchange="QuickMap.toggleRec('+i+')" > '+somedata.results[i].attributes.pinnum + '</option>';
            }
            popupContentText += '</select>';


            // '<ul class="pagination">' +
            //               '<li><a href="#" onclick=>&laquo;</a></li>' +
            //               '<li class="active" s><a href="#" >1</a></li>' +
            //               '<li><a href="#">2</a></li>' +
            //               '<li><a href="#">3</a></li>' +
            //               '<li><a href="#">4</a></li>' +
            //               '<li><a href="#">5</a></li>' +
            //               '<li><a href="#">&raquo;</a></li>' +
            //             '</ul>'; 
            
            for (var i=0;i<somedata.results.length;i++ ) {
                tActive='';
                QuickMap.currerec(0);
                if(i==QuickMap.currerec){tActive=' active'}else{tActive=' deactive'};
                popupContentText += '<div id="results'+i+'" class="recod_list'+tActive+'" >'  + somedata.results[i].attributes.pinnum + '</div>';
            };
            
                        //   '<table class="table">' +
                        //      '<thead>' +
                        //         '<tr>' +
                        //           '<th>PIN</th>' +
                        //           '<th>Address</th>' +
                        //           '<th>Tax Value</th>' +
                        //           '<th>Property Card</th>' +
                        //           '<th>Plat</th>' +
                        //           '<th>Deed</th>' +
                        //         '</tr>' +
                        //      '</thead>' +
                        //     '<tbody>' +
                        //       '<tr>' +
                        //         '<td>' + somedata.results[0].attributes.pinnum + '</td>' +
                        //         '<td>' + somedata.results[0].attributes.address + '</td>' +
                        //         '<td>' + somedata.results[0].attributes.taxvalue + '</td>' +
                        //         '<td>' + somedata.results[0].attributes.buildingvalue + '</td>' +
                        //         '<td>' + somedata.results[0].attributes.propcard +'</td>' +
                        //         '<td>' + somedata.results[0].attributes.deedurl +'</td>' +
                        //       '</tr>' +
                        //     '</tbody>' +
                        //    '</table>' +
                        // '</ul>';

            //Add Popup to the map when the mouse was clicked at
             popup = new L.Popup({
              maxWidth: 200,
              maxHeight: 250,
              minHeight: 50,
            });

            popup.setLatLng(eventData.latlng);
            popup.setContent(popupHeaderText+popupContentText);
            map.openPopup(popup);
        }
  },
  toggleRec:function(index){
      alert(index);
  },
  currerec:function(index){
    QuickMap.CR=index;
  },
  getStateplane:function(eventData){
    xStr = eventData.latlng.lng.toFixed(3);
    yStr = eventData.latlng.lat.toFixed(3);

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