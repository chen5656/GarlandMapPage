require([
  "esri/Map",
  "esri/WebMap",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/widgets/Search",
  "esri/core/watchUtils",
  "esri/geometry/support/webMercatorUtils",
  "dojo/domReady!"
], function (Map, WebMap, MapView, SceneView, Search, watchUtils, webMercatorUtils) {
  var jsMaps = [{
      "ID": 0,
      "name": "Light Gray Canvas",
      "container": "map0",
      "map": new Map({
        basemap: "gray"
      }),
      "webmapID": "8b3d38c0819547faa83f7b7aca80bd76"
    }, {
      "ID": 1,
      "name": "Open Street",
      "container": "map1",
      "map": new Map({
        basemap: "osm"
      }),
      "webmapID": "b834a68d7a484c5fb473d4ba90d35e71"
    }, {
      "ID": 2,
      "name": "Scene View",
      "container": "map2",
      "map": new Map({
        basemap: "satellite"
      }),
      "basemap": "satellite"
    }, {
      "ID": 3,
      "name": "World Imagery",
      "container": "map3",
      "map": new Map({
        basemap: "satellite"
      }),
      "webmapID": "86de95d4e0244cba80f0fa2c9403a7b2"
    }, {
      "ID": 4,
      "name": "GDC Zoning",
      "container": "map4",
      "map": new WebMap({
        portalItem: { // autocasts as new PortalItem()
          id: "dd27dad8f96842b5b7def9d7f8f2b293"
        }
      }),
      "webmapID": "dd27dad8f96842b5b7def9d7f8f2b293"
    },

  ];

  function overrideMapZoom(event) {
    // Stop mouse wheel event from zooming the map
    event.stopPropagation();
    // Force the window to scroll
    var doc = document.documentElement;
    var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    window.scroll(0, top + event.deltaY);
  }

  function removeViewsScroll() {
    for (var i = 0; i < views.length; i++) {
      views[i].on("mouse-wheel", overrideMapZoom);
    }
  }

  function setExtents(extent, currentView) {
    if (extent) {
      for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view !== currentView) {
          view.goTo({
            target: extent
          });

        }
      }
    }
  }

  function setWatches() {
    for (var i = 0; i < views.length; i++) {
      var view = views[i];
      watchUtils.whenFalse(view, "interacting", function (newVal, oldVal, prop, targetView) {
        if (targetView.ready && !newVal) {
          watchUtils.whenFalseOnce(targetView, "updating", function (newVal, oldVal, prop, targetView) {
            //console.log(arguments + " 1");
            setExtents(targetView.extent, targetView);
          });

          watchUtils.whenOnce(targetView, "updating", function (newVal, oldVal, prop, targetView) {
            //console.log(arguments + " 4");
            setExtents(targetView.extent, targetView);
          });
        }
      });
    }
  }
  var defaultCenter = [-96.636269, 32.91676];
  var defaultZoom = 11;
  var defaultCamera = {
    position: [-96.661335, 32.758493, 5000],
    tilt: 80
  };
  var views = [];

  views.push(new MapView({
    container: jsMaps[0].container,
    map: jsMaps[0].map,
    center: defaultCenter,
    zoom: defaultZoom,
    constraints: {
      rotationEnabled: false
    }
  }));
  views.push(new MapView({
    container: jsMaps[1].container,
    map: jsMaps[1].map,
    center: defaultCenter,
    zoom: defaultZoom,
    constraints: {
      rotationEnabled: false
    }
  }));
  views.push(new SceneView({
    container: jsMaps[2].container,
    map: jsMaps[2].map,
    center: defaultCenter,
    zoom: defaultZoom,
    camera: defaultCamera
  }));
  views.push(new MapView({
    container: jsMaps[3].container,
    map: jsMaps[3].map,
    center: defaultCenter,
    zoom: defaultZoom,
    constraints: {
      rotationEnabled: false
    }
  }));
  views.push(new MapView({
    container: jsMaps[4].container,
    map: jsMaps[4].map,
    center: defaultCenter,
    zoom: defaultZoom,
    constraints: {
      rotationEnabled: false
    }
  }));

  var search = new Search({
    container: "search"
  });
  search.watch("selectedResult", function (result) {
    if (result) {
      setExtents(result.extent);
    }
  });




  // $("#showMap1").on("click",  function (){
  //  var url="https://maps.garlandtx.gov/maps/leaflet/?";
  //url += "lat=32.91676";
  //url += "&long=-96.636269";
  // url += "&zoom=12";
  //   url += "&basemap=Streets";
  //url += "&mapLayer = ";

  //  window.open(url, '_blank');
  //  });

  function getURL(mapID, isMapView) {
    var url = "";
    if (isMapView == true) {
      url = "https://www.arcgis.com/home/" + "webmap" + "/viewer.html?";
      url += "webmap" + "=" + jsMaps[mapID].webmapID;
      url += "&";
    } else {
      url = "https://maps.garlandtx.gov/maps/sceneview/";
      url += "?basemap=" + jsMaps[mapID].basemap;
      url += "&";
    }

    var gExtent = webMercatorUtils.webMercatorToGeographic(views[mapID].extent);
    url += "extent=" + gExtent.xmin + "," + gExtent.ymin + "," + gExtent.xmax + "," + gExtent.ymax;
    return url;
  }
  $("#showMap1").on("click", function () {
    var url = getURL(1, true);
    window.open(url, '_blank');
  });
  $("#showMap2").on("click", function () {
    var url = getURL(2, false); //"http://garland.maps.arcgis.com/home/webscene/viewer.html?webscene="+jsMaps[2].webmapID;
    window.open(url, '_blank');
  });
  $("#showMap3").on("click", function () {
    var url = getURL(3, true);
    window.open(url, '_blank');
  });
  $("#showMap4").on("click", function () {
    var url = getURL(4, true);
    window.open(url, '_blank');
  });

  $(document).ready(function () {

    setWatches(views);
    // Prevent panning on page scroll
    removeViewsScroll();
  });

});