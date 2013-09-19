var QuickMap = QuickMap || {};
var QuickMap = {
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
            popupText =  '<center><b>Pin: ' + somedata.results[0].attributes.pinnum + '</b>' + 
                '<br>Address: ' +somedata.results[0].attributes.address + 
                '<br>Tax Value: ' +somedata.results[0].attributes.taxvalue + 
                '<br>Buiding Value: ' +somedata.results[0].attributes.buildingvalue + 
                '<br><a href="' + somedata.results[0].attributes.propcard +'" target="_blank" >Property Card</a>'  +
                '<br><a href="' + somedata.results[0].attributes.platurl +'" target="_blank" >Plat</a>'  +
                '<br><a href="' + somedata.results[0].attributes.deedurl +'" target="_blank" >Deed</a>'  +
                '</center>';

            //Add Popup to the map when the mouse was clicked at
            var popup = L.popup()
              .setLatLng(eventData.latlng)
              .setContent(popupText)
              .openOn(map);
          }
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