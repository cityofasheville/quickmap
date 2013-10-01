
      $('#search').click(function() {
         if ( $('#txtSearch').val()){

             addressStr = $('#txtSearch').val();
             var urlStr = 'http://'+QuickMap.agsServerGeocode+'/'+QuickMap.agsServerInstanceNameGeocode+'/rest/services/'+QuickMap.geocdingLayerName+'/GeocodeServer/findAddressCandidates';
             var data={f:"json",Street:addressStr};

            $.ajax({
              url: urlStr,
              dataType: "jsonp",
              data: data,
              success: function (data) {
                if (data.candidates) {
                  item = data.candidates[0];
                  QuickMap.getLatLong({ label: item.address, value: item.address, x:item.location.x,y:item.location.y } );
                }
              }
            });


         }
      });
      $('#txtSearch').autocomplete({
          source: function (request, response) {
                  //This is for geocoding
             addressStr = $('#txtSearch').val();
             var urlStr = 'http://'+QuickMap.agsServerGeocode+'/'+QuickMap.agsServerInstanceNameGeocode+'/rest/services/'+QuickMap.geocdingLayerName+'/GeocodeServer/findAddressCandidates';
             var data={f:"json",Street:addressStr};

            $.ajax({
              url: urlStr,
              dataType: "jsonp",
              data: data,
              success: function (data) {
                if (data.candidates) {
                  response($.map(data.candidates.slice(0, 14), function (item) {//only display first 10
                    return { label: item.address, value: item.address, x:item.location.x,y:item.location.y } 
                  }));
                }
              }
            });
          },
          minLength: 5,
          select: function (event, ui) {
            this.blur();
            QuickMap.getLatLong(ui.item);
          }
        });
        
        var mapAttr = 'Map data from The City of Asheville , NC',
        mapUrl = 'http://gis.ashevillenc.gov/tiles/basemapbw/{z}/{x}/{y}.png';

        var basemapclr = L.tileLayer(
          mapUrl, 
          {
            maxZoom: 19,
            minZoom: 11,
            tms: true,
            opacity:.25,
            attribution:mapAttr,
        });

        var basemapsld = L.tileLayer(
          mapUrl, 
          {
            maxZoom: 19,
            minZoom: 11,
            tms: true,
            attribution:mapAttr,
        });

        var parcel= L.tileLayer(
          'http://gis.ashevillenc.gov/tiles/bcparcels/{z}/{x}/{y}.png', 
          {
            maxZoom: 19,
            minZoom: 16,
            tms: true,
            attribution:mapAttr,
        });

        var zoning= L.tileLayer(
          'http://gis.ashevillenc.gov/tiles/coazoning/{z}/{x}/{y}.png', 
          {
            maxZoom: 19,
            minZoom: 15,
            tms: true,
            attribution:mapAttr,
        });


        var img2010 = L.tileLayer.wms("http://services.nconemap.com/arcgis/services/Imagery/Orthoimagery_Latest/ImageServer/WMSServer?", {
            layers: 'Orthoimagery_Latest',
            format: 'image/png',
            transparent: true,
            attribution: "Imagery from - North Carolina Center for Geographic Information and Analysis"
        })

       var map = new L.Map(
        'map', 
        {
          fullscreenControl: true,
          layers: [basemapsld,parcel,zoning]
        }).setView([35.593,-82.5488], 14)
   
        map.on('fullscreenchange', function () {
            if (map.isFullscreen()) {
                console.log('entered fullscreen');

            } else {
                console.log('exited fullscreen');
            }
        });



      var bmimg = L.layerGroup([img2010,basemapclr])

      var baseLayers = {
        "Street Map": basemapsld,
        "Imagery":img2010,
        "Street Map And Imagery":bmimg,
      };

      var overlayLayers = {
        "City of Asheville zoning": zoning,
        "BC Parcels": parcel,
      }


      layersControl = new L.control.layers(baseLayers,overlayLayers,{collapsed: false});

      layersControl.addTo(map);

      map.on('enterFullscreen', function(){
        if(window.console) window.console.log('enterFullscreen');
      });
      
      map.on('exitFullscreen', function(){
        if(window.console) window.console.log('exitFullscreen');
      });

      map.removeLayer(zoning);
      map.removeLayer(parcel);
      
      layersControl._update(); 
  
      map.addEventListener('click', onMapClick);
    
      popup = new L.Popup({
        maxWidth: 400,
        zoomAnimation:true,
        closeOnClick:true,
      });

    
    
    QuickMap.identifyConfig={
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
        },
        {
          "id":2,
          "name":"acreage",
          "style":"text", 
          "label":"Acreage"
        },
        {
          "id":3,
          "name":"taxvalue",
          "style":"currency", 
          "label":"Tax Value"
        },        
        {
          "id":4,
          "name":"buildingvalue",
          "style":"currency", 
          "label":"Building Value"
        },        
        {
          "id":5,
          "name":"propcard",
          "style":"url", 
          "label":"Property Card"
        },
        {
          "id":6,
          "name":"platurl",
          "style":"url", 
          "label":"Plat"
        },
        {
          "id":7,
          "name":"deedurl",
          "style":"url", 
          "label":"Deed"
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
  };

    

    function onMapClick(e) {
      QuickMap.getStateplane(e);
    }
    
    function DoTheCheck() {
      if (document.checkform.getfeatureinfo.checked == true)
        {map.addEventListener('click', onMapClick);}
      if (document.checkform.getfeatureinfo.checked == false)
        {map.removeEventListener('click', onMapClick); map.closePopup(popup);}
    }