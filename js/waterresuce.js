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


        var basemapsld = L.tileLayer(
          mapUrl, 
          {
            maxZoom: 19,
            minZoom: 11,
            tms: true,
            attribution:mapAttr,
        });


        var img2010 = L.tileLayer.wms("http://services.nconemap.com/arcgis/services/Imagery/Orthoimagery_Latest/ImageServer/WMSServer?", {
            layers: 'Orthoimagery_Latest',
            format: 'image/png',
            transparent: true,
            attribution: "Imagery from - North Carolina Center for Geographic Information and Analysis"
        })

      var bmimg = L.layerGroup([img2010])

      var baseLayers = {
        "Street Map": basemapsld,
        "Imagery":img2010,
      };



       var wr= L.tileLayer(
          'http://gis.ashevillenc.gov/tiles/waterrescue/{z}/{x}/{y}.png', 
          {
            maxZoom: 19,
            minZoom: 14,
            tms: true,
            attribution:mapAttr,
        });

      var overlayLayers = {
        "Water Rescue Points": wr,
      }


       var map = new L.Map(
        'map', 
        {
          fullscreenControl: true,
          layers: [basemapsld,wr]
        }).setView([35.593,-82.5488], 14)
   
        map.on('fullscreenchange', function () {
            if (map.isFullscreen()) {
                console.log('entered fullscreen');

            } else {
                console.log('exited fullscreen');
            }
        });


      map.addEventListener('click', onMapClick);

      var baseLayers = {
        "Street Map": basemapsld,
        "Imagery": img2010,
      };

      QuickMap.dataDriveMap=true;
      QuickMap.getlist();

      layersControl = new L.control.layers(baseLayers,overlayLayers,{collapsed: false});

      layersControl.addTo(map);
      layersControl._update(); 

      map.on('enterFullscreen', function(){
        if(window.console) window.console.log('enterFullscreen');
      });
      
      map.on('exitFullscreen', function(){
        if(window.console) window.console.log('exitFullscreen');
      });
    
   QuickMap.identifyConfig={
    "service":"coa_water_rescue_points",
    "tolerance":10,
    layers:[{
      "layerindex":0,
      "layerlabel":"Water Rescue Point",
      fields:[{
          "id":0,
          "name":"Label",
          "style":"key", 
          "label":"Name"
        },
        {
          "id":1,
          "name":"Elevation",
          "style":"number", 
          "label":"Elevation"
        },
        {
          "id":2,
          "name":"Address",
          "style":"text", 
          "label":"Address"
        },
        {
          "id":3,
          "name":"River_Side",
          "style":"text", 
          "label":"River Side"
        },
        {
          "id":4,
          "name":"access_cond",
          "style":"currency", 
          "label":"Access Condition"
        },
        {
          "id":5,
          "name":"Type_Access",
          "style":"text", 
          "label":"Access From"
        },
        {
          "id":5,
          "name":"Sign",
          "style":"text", 
          "label":"Sign"
        },
        {
          "id":5,
          "name":"Access_Cond",
          "style":"text", 
          "label":"Access Condition"
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
var legend = L.control({position: 'bottomright'});

function getColor(d) {
    return d == 'Excellent' ? 'rgb(0,97,0)' :
           d == 'Good'  ? 'rgb(122,171,0)' :
           d == 'Poor'  ? 'rgb(255,153,0)':
           d == 'Fair'  ? 'rgb(255,255,0)' :
           d == 'Out of Service'   ? 'rgb(168,0,0)' :
           d == 0   ? '#fff' :
                      '#fff';
}

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = ['Excellent', 'Good', 'Poor', 'Fair','Out of Service'],
        labels = [];

    div.innerHTML +='<h4>Access Condition</h4>' 
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' + (grades[i] == 0 ? '&nbsp;' : grades[i]  )  + '<br /><div class="wr-sep">&nbsp;</div>'
    }

    return div;
};

legend.addTo(map)