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
  title:"Quick Map",
  identifyConfig:{
    "service":"bc_parcels",
    "layers":[{
      "layerindex":0,
      "layerlabel":"Parcels",
      fields:[{
          "id":0,
          "name":"pinnum",
          "style":"key", 
          "label":"PIN"
        },
        {
          "id":1,
          "name":"owner",
          "style":"text", 
          "label":"Owner"
        }],
      },
      {
      "layerindex":1,
      "layerlabel":"Zoning",
      fields:[{
        "id":0,
        "name":"districts",
        "style":"key", //key,text,url,num
        "label":"Zonning District"
      },
      {
        "id":1,
        "name":"Acreage",
        "style":"text", //key,text,url,num
        "label":"Acreage"
      }],
    }],
  },
  dataMapConfig:{
    "agsServerName":"gis.ashevillenc.gov",
    "agsServerInstanceName":"COA_ArcGIS_Server",
    "agsServerFolderName":"OpenDataAsheville",
    "agsServicename":"coa_water_rescue_points",
    "agsLayerIndex":0,
    "fields":[{
      "fieldName":"label",
      "fieldLabel":"Water Resuce Point",
    }],
  },
  dataDriveMap:false,
  //setdataDriveMap:function(val){}},
  getlist:function(){
    if(QuickMap.dataDriveMap){
      
      var urlStr = 'http://'+QuickMap.dataMapConfig.agsServerName+'/'+QuickMap.dataMapConfig.agsServerInstanceName+'/rest/services/'+QuickMap.dataMapConfig.agsServerFolderName+'/'+QuickMap.dataMapConfig.agsServicename+'/MapServer/'+QuickMap.dataMapConfig.agsLayerIndex;      
      var data={f:"json"};

       $.ajax({
          url: urlStr,
          dataType: "jsonp",
          data: data,
           crossDomain: true,
           success:function(data){QuickMap.buildList(data);},
           error:function(x,t,m){console.log('fail');}
       });
      
    };
  },
  buildList:function(somedata){
    //alert(somedata.fields.length);
    for(var idx=0;idx<somedata.fields.length;idx++){
      if(somedata.fields[idx].name == QuickMap.dataMapConfig.fields[0].fieldName ){
        //alert(somedata.fields[idx].name)
        var urlStr = 'http://'+QuickMap.dataMapConfig.agsServerName+'/'+QuickMap.dataMapConfig.agsServerInstanceName+'/rest/services/'+QuickMap.dataMapConfig.agsServerFolderName+'/'+QuickMap.dataMapConfig.agsServicename+'/MapServer/0/query'
        var data={f:"json",outSR:4326,where:"objectid>0",outFields:QuickMap.dataMapConfig.fields[0].fieldName}
        var selectBox='';
          $.ajax({
          url: urlStr,
          dataType: "jsonp",
          data: data,
           crossDomain: true,
           success:function(data){
            
            selectBox += '<label class="text-info" for="mapsearch">Choose the '+QuickMap.dataMapConfig.fields[0].fieldLabel+'</label>';
            selectBox += '<select id="mapsearch" class="form-control input-sm text-info"  onchange="QuickMap.zoomMap(this.value,15,false)" >';
            
            for(var dataIdx=0;dataIdx<data.features.length;dataIdx++ ){
              
               xStr=data.features[dataIdx].geometry.x;
               yStr=data.features[dataIdx].geometry.y;
               geom={geometries: [{x:xStr,y:yStr}]};
               value=JSON.stringify(geom);
               
               label=data.features[dataIdx].attributes[QuickMap.dataMapConfig.fields[0].fieldName]
               len=label.length;
               //make Pulldown common mind width;
               for(i=len;i<100;i++){
                label+='&nbsp;';
               }

               selectBox +=  '<option value=\''+ value  + '\' class="input-sm text-info" >'+ label+ '</option>';
            }
            selectBox += '</select>';
             $('#results').append(selectBox);
           },
           error:function(x,t,m){console.log('fail');}
       });
      }
    }
    //JSON.stringify(somedata)
  },
  setIdentifyConfig:function(val){QuickMap.identifyConfig=val},
  setTotalRecs:function(val){QuickMap.totalRecs=val;},
  setCurrentRec:function(val){QuickMap.currentRec=val;},
  zoomMap :function(data,zlevel,isDrawPts){

    if(typeof(data) =='string'){var obj = JSON.parse(data);}else{var obj = data}
    
    xStr=obj.geometries[0].x;
    yStr=obj.geometries[0].y;
    map.setView(new L.LatLng(yStr, xStr), zlevel);
    var startPt = '[{"type": "Point","coordinates":['+xStr+','+yStr+']}]';
    if(isDrawPts){QuickMap.drawPoints(startPt);}
    return '';
  },
  retLayerInfo:function(somedata,eventData){
      
      popupContentText = '';
      popupHeaderText = '';



      //if records exist
      if(somedata.results.length > 0) {

        QuickMap.setTotalRecs(somedata.results.length);
        popupHeaderText += '<h5><span class="badge pull-left badge-info">'+QuickMap.totalRecs+' </span>&nbsp;items found!</h5>'

        //loop layers
        popupHeaderText += '<select class="form-control input-sm text-info"  onchange="QuickMap.toggleRec('+QuickMap.totalRecs+',this.value,\'layers\')" >'
        for(var layerIdx=0;layerIdx<QuickMap.identifyConfig.layers.length;layerIdx++){
          popupHeaderText +=  '<option value="'+ QuickMap.identifyConfig.layers[layerIdx].layerindex+'" class="input-sm text-info" >'+ QuickMap.identifyConfig.layers[layerIdx].layerlabel + '</option>';        
          //for (var displayIDX=0;displayIDX<QuickMap.identifyConfig.layers[layerIdx].fields.length;displayIDX++ ){
            //popupHeaderText += QuickMap.identifyConfig.layers[layerIdx].layerindex
            //popupHeaderText += QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].name +'<br/>'
          //}
          
        };
        popupHeaderText += '</select><br />';        

        //make sure layer indexes match and we are on the correct layer.
        //if(somedata.results[0].layerIdx == QuickMap.identifyConfig.layers[0].layerindex){
        
        //popupHeaderText += '<h5><span class="badge pull-left badge-info">'+QuickMap.totalRecs+' </span> ' +somedata.results[0].layerName + '</h5>'

        //setup header pulldown if there is a key set only when more than record returned            
        if(QuickMap.totalRecs > 1) {
          //setup header if its a key make it a pulldown
          popupHeaderText += '<span>&nbsp;&nbsp</span><select class="form-control input-sm text-info"  onchange="QuickMap.toggleRec('+QuickMap.totalRecs+',this.value,\'results\')" >'
          //loop records
          for (var dataIdx=0;dataIdx<QuickMap.totalRecs;dataIdx++ ) {
            //loop Fields for identifing from configuration
            for (var displayIDX=0;displayIDX<QuickMap.identifyConfig.layers[0].fields.length;displayIDX++ ){
              //if field is the key make the option
              if(QuickMap.identifyConfig.layers[0].fields[displayIDX].style == 'key'){
                popupHeaderText +=  '<span>&nbsp;&nbsp</span><option value="'+dataIdx+'" class="input-sm text-info" >'+somedata.results[dataIdx].attributes[QuickMap.identifyConfig.layers[0].fields[displayIDX].name]  + '</option>';
              }
            } //loop Fields
          }//loop records
          popupHeaderText += '<span>&nbsp;&nbsp</span></select><br />';
        }//if recs


        //setup header pulldown if there is a key set.  loop records
        for (var dataIdx=0;dataIdx<QuickMap.totalRecs;dataIdx++ ) {
          tActive='';
          //set intial  active record. when multiple records returned
          //this is the first record
          if(dataIdx==0){tActive=' active'}else{tActive=' deactive'};
          popupContentText += '<div id="results'+dataIdx+'" class="record_list'+tActive+'" >';
          //index
          popupContentText += '<div>'+(dataIdx+1)+' of '+QuickMap.totalRecs+'</div>';
          
          for(var layerIdx=0;layerIdx<QuickMap.identifyConfig.layers.length;layerIdx++){
            //loop all the fields
            lActive='';
            if(layerIdx==0){lActive=' active'}else{lActive=' deactive'};
            if (QuickMap.identifyConfig.layers[layerIdx].layerindex == somedata.results[dataIdx].layerId ){
              popupContentText += '<div id="layers'+layerIdx+'" class="layer_list'+lActive+'" >';
              for (var displayIDX=0;displayIDX<QuickMap.identifyConfig.layers[layerIdx].fields.length;displayIDX++ ){
                //format fields from confuiguration
                if(somedata.results[dataIdx].attributes[QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].name]){
                switch(QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].style){
                  case "key":
                    popupContentText += '<div>&nbsp;&nbsp;<b>'+QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].label+': </b>' + 
                                        somedata.results[dataIdx].attributes[QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].name] + '</div>';
                    break;
                  case "text":
                    popupContentText += '<div>&nbsp;&nbsp;<b>'+QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].label+': </b>' + 
                                        somedata.results[dataIdx].attributes[QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].name] + '</div>';
                    break;
                  case "url":
                    popupContentText += '<div >&nbsp;&nbsp;<a href="' + somedata.results[dataIdx].attributes[QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].name]  + '" target="_blank" >' +
                                        QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].label+'</a></div>';
                    break;
                  case "number":
                    popupContentText += '<div >&nbsp;&nbsp;<b>'+QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].label+': </b>' + 
                                        somedata.results[dataIdx].attributes[QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].name] + '</div>';
                    break;
                  case "currency":
                    popupContentText += '<div >&nbsp;&nbsp;<b>'+QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].label+': </b>' + 
                                        '$'+parseInt(somedata.results[dataIdx].attributes[QuickMap.identifyConfig.layers[0].fields[displayIDX].name]).toFixed(2) + '</div>';
                    break;
                  default: 
                     popupContentText += '<div&nbsp;&nbsp;><b>'+QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].label+': </b>' + 
                                        somedata.results[dataIdx].attributes[QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].name] + '</div>';
                    break;
                };//format fields
                }
              }//loop fields
              popupContentText += '</div>';
            }
          }//loop layers
          popupContentText += '</div>';
        };//loop records
      }else{
        popupHeaderText = '<h4>Nothing found!</h4>'
      }

      //Add Popup to the map when the mouse was clicked at
       popup = new L.Popup({
        maxWidth: 250,
        minWidth: 200,
        maxHeight: 250,
        minHeight: 50,
      });

      popup.setLatLng(eventData.latlng);
      popup.setContent(popupHeaderText+popupContentText);
      map.openPopup(popup);
        
  },
  toggleRec:function(total,index,type){
      QuickMap.setCurrentRec(index)
       for (var i=0;i<total;i++ ) {$('#'+type+i).hide();}
      $('#'+type+index).show();
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
  getIdentifyLayerList:function(){
    lyr='';
    for(var layerIDX=0;layerIDX<QuickMap.identifyConfig.layers.length;layerIDX++){
      lyr += QuickMap.identifyConfig.layers[layerIDX].layerindex;
      lyr += ',';
    };
    ret=lyr.substring(0, lyr.length-1);
    return ret
  },
  getIdentifyService:function(){
    srv=QuickMap.identifyConfig.service;
    ret=srv;
    return ret
  },
  getLayerInfo:function(somedata,eventData){
    xStr=somedata.geometries[0].x;
    yStr=somedata.geometries[0].y;
    lyrs='all:'+QuickMap.getIdentifyLayerList();

    aPt =  JSON.stringify( {"x":xStr,"y":yStr,"spatialReference":{"wkid":QuickMap.mySRID}}) 
    bbox = JSON.stringify(
      {
        "xmin":map.getBounds()._southWest.lng,"ymin":map.getBounds()._southWest.lat,"xmax":map.getBounds()._northEast.lng,"ymax":map.getBounds()._northEast.lat,"spatialReference":{"wkid":4326}
      })
   
    identifyService=QuickMap.getIdentifyService();
    urlStr = 'http://'+QuickMap.agsServerGeocode+'/'+QuickMap.agsServerInstanceNameGeocode+'/rest/services/OpenDataAsheville/'+identifyService+'/MapServer/identify';
    data={f:"json",sr:QuickMap.mySRID,layers:lyrs,geometry:aPt,imageDisplay:"800,600,96",tolerance:3,mapExtent:bbox,geometryType:"esriGeometryPoint",returnGeometry:false};

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
         success:function(data){QuickMap.zoomMap(data,17,true);},
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