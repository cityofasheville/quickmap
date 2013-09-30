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
    "tolerance":3,
    layers:[{
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
    "Label":"Water Resuce Point's",
    "fields":[{
      "fieldName":"label",
      "fieldLabel":"Water Resuce Point",
      "type":"key",
    },{
      "fieldName":"access_cond",
      "fieldLabel":"Water Resuce Point",
      "type":"display",
      values:[{
        "value":"Excellent",
        "background":"#006100",
      },{
        "value":"Good",
        "background":"#7AAB00",
      },{
        "value":"Fair",
        "background":"#FFFF00",
      },{
        "value":"Poor",
        "background":"#FF9900",
      },{
        "value":"Out of Service",
        "background":"#A80000",
      }]
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
        flds='';
        for (var i=0;i<QuickMap.dataMapConfig.fields.length;i++){
          flds+=QuickMap.dataMapConfig.fields[i].fieldName+',';
        }
        flds+=flds.substring(0,flds.length-1);
        var urlStr = 'http://'+QuickMap.dataMapConfig.agsServerName+'/'+QuickMap.dataMapConfig.agsServerInstanceName+'/rest/services/'+QuickMap.dataMapConfig.agsServerFolderName+'/'+QuickMap.dataMapConfig.agsServicename+'/MapServer/0/query'
        var data={f:"json",outSR:4326,where:"objectid>0",outFields:flds}
        var selectBox='';
          $.ajax({
          url: urlStr,
          dataType: "jsonp",
          data: data,
           crossDomain: true,
           success:function(data){



            selectBox += '<div class="btn-group">'
            selectBox += '<button type="button" class="btn  btn-primary dropdown-toggle btn-dd-title" data-toggle="dropdown">'
            selectBox +=  QuickMap.dataMapConfig.Label +' <span class="caret"></span>'
            selectBox += '</button>'
            selectBox += '<ul class="dropdown-menu dd-drp" role="menu">'

            for(var dataIdx=0;dataIdx<data.features.length;dataIdx++ ){
              xStr=data.features[dataIdx].geometry.x;
              yStr=data.features[dataIdx].geometry.y;
              geom={geometries: [{x:xStr,y:yStr}]};
              value=JSON.stringify(geom);
              for (var f=0;f<QuickMap.dataMapConfig.fields.length;f++){
                if(QuickMap.dataMapConfig.fields[f].type=='key'){
                  label=data.features[dataIdx].attributes[QuickMap.dataMapConfig.fields[f].fieldName];
                  len=label.length;
                }
                if(QuickMap.dataMapConfig.fields[f].type=='display'){
                  for(var v=0;v<QuickMap.dataMapConfig.fields[f].values.length;v++){
                    if(QuickMap.dataMapConfig.fields[f].values[v].value==data.features[dataIdx].attributes[QuickMap.dataMapConfig.fields[f].fieldName]){
                      var  displaytxt = ''
                      
                      //if(dataIdx != 0){displaytxt = 'display:none'}else{displaytxt = ''}
                      //if(dataIdx % 5 == 0 && dataIdx != 0 ){
                      //  selectBox += '<li class="dd-primary" id="datadrivenlist'+dataIdx % 5+'" style="'+displaytxt+'" ><button class="btn btn-primary bnt-dd"><span class="glyphicon glyphicon-arrow-up"></span></button><li>';
                      //}

                      //if(dataIdx > 4 ){displaytxt = 'display:none'}else{displaytxt = ''}
                      selectBox += '<li class="dd-primary" id="datadrivenlist'+dataIdx % 5+'" style="'+displaytxt+'"  ><button class="btn btn-primary bnt-dd" value=\''+ value  + '\' '+ ' onclick="QuickMap.zoomMap(this.value,16,false)" >'+label+'</button></li>'

                      //if(dataIdx == 4 ){displaytxt = ''}else{displaytxt = 'display:none'}
                      //if(dataIdx % 5 == 4 && dataIdx < data.features.length-1){
                      //  selectBox += '<li class="dd-primary" id="datadrivenlist'+dataIdx % 5+'"  style="'+displaytxt+'"  ><button class="btn btn-primary bnt-dd"><span class="glyphicon glyphicon-arrow-down"></span></button><li>'
                      //}
                    }

                  }
                }
              }
            }
            
            
            selectBox += '  </ul>'
            selectBox += '</div>'

            $('#results').append(selectBox);

           },
           error:function(x,t,m){console.log('fail');}
       });
      }
    }
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
    var jsonLayerObj = []; //declare object
    var jsonlRecsObj = []; //declare object
    var jsonlFeildsObj = []; //declare object    
    QuickMap.setTotalRecs(somedata.results.length);
   

    for(var layerIdx=0;layerIdx<QuickMap.identifyConfig.layers.length;layerIdx++){

      for (var dataIdx=0;dataIdx<QuickMap.totalRecs;dataIdx++ ) {  
          
          for (var displayIDX=0;displayIDX<QuickMap.identifyConfig.layers[layerIdx].fields.length;displayIDX++ ){

            jsonlFeildsObj.push({fieldname:QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].label,
              fieldstyle:QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].style,
              fieldvalue:somedata.results[dataIdx].attributes[QuickMap.identifyConfig.layers[layerIdx].fields[displayIDX].name],});
          }
          jsonlRecsObj.push({recordnum:dataIdx,
            attributes:jsonlFeildsObj})
          jsonlFeildsObj = []
      }
      jsonLayerObj.push({layerid:QuickMap.identifyConfig.layers[layerIdx].layerindex,
        layername:QuickMap.identifyConfig.layers[layerIdx].layerlabel,
        features:jsonlRecsObj})
      jsonlRecsObj = []
    }
    
    popupContentText = '';
    popupHeaderText = '';

       for(var i=0;i<jsonLayerObj.length;i++){
        popupContentText += '<div ><h4>'+jsonLayerObj[i].layername+'</h4></div>'
        reccnt=0;

        for(var f=0;f<jsonLayerObj[i].features.length;f++){
          

          for(var a=0;a<jsonLayerObj[i].features[f].attributes.length;a++){     
          
            name=jsonLayerObj[i].features[f].attributes[a].fieldname;
            val=jsonLayerObj[i].features[f].attributes[a].fieldvalue;
            style=jsonLayerObj[i].features[f].attributes[a].fieldstyle; 
            
            if(val){              
              if(a==0){

                    reccnt+=1;
                    popupContentText += '<div class="media"><a class="pull-left" href="#"><button type="button" class="btn  btn-info">'+reccnt+'</button></a><div class="media-body">'
              }   

              switch(style){
                case'key':
                  popupContentText += '<span><b>'+name+':&nbsp</b></span>'
                  popupContentText += '<b>'+val+'</b></span><br/>'
                  break;
                case'url':
                  popupContentText += '<a href="'+val+'" target="_blank" >'+name+'</a></span><br/>'
                  break;
                case'text':
                  popupContentText += '<span><b>'+name+':&nbsp</b></span>'
                  popupContentText += val+'</span><br/>'
                  break;
                case'number':
                  popupContentText += '<span><b>'+name+':&nbsp</b></span>'
                  popupContentText += val+'</span><br/>'
                  break;
                case'currency':
                  popupContentText += '<span><b>'+name+':&nbsp</b></span>'
                  popupContentText += '$'+val+'</span><br/>'
                  break;                    
                default:
                  popupContentText += '<span><b>'+name+':&nbsp</b></span>'
                  popupContentText += val+'</span>'
                  break;
              }

              
              if(a==jsonLayerObj[i].features[f].attributes.length-1){
                popupContentText += '</div>'
                //popupContentText += '<div class="att-divider"></div>'
              }

            }
          }

        }
       }

      //Add Popup to the map when the mouse was clicked at
       popup = new L.Popup({
        maxWidth: 250,
        minWidth: 200,
        maxHeight: 250,
        minHeight: 50,
        closeOnClick:true,
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
    data={f:"json",sr:QuickMap.mySRID,layers:lyrs,geometry:aPt,imageDisplay:"800,600,96",tolerance:QuickMap.identifyConfig.tolerance,mapExtent:bbox,geometryType:"esriGeometryPoint",returnGeometry:false};

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