var boundariesButton = document.getElementById("boundariesButton");
var boundaryButtons = document.getElementById("boundaryButtons");
var extentsButton = document.getElementById("extentsButton");
var extentsButtonButtons = document.getElementById("extentsButtonButtons");
var impButton = document.getElementById("impButton");
var impButtonButtons = document.getElementById("impButtonButtons");
var acc = document.getElementsByClassName("accordion");
var i;

boundariesButton.addEventListener("click", function () {
  boundaryButtons.style.display =
    boundaryButtons.style.display === "none" ? "block" : "none";
  this.classList.toggle("active", boundaryButtons.style.display === "block");
});



GLOBALButton.addEventListener("click", function () {
  GLOBALButtonButtons.style.display =
  GLOBALButtonButtons.style.display === "none" ? "block" : "none";
  this.classList.toggle("active", GLOBALButtonButtons.style.display === "block");
});
LocalButton.addEventListener("click", function () {
  LocalButtonButtons.style.display =
  LocalButtonButtons.style.display === "none" ? "block" : "none";
  this.classList.toggle("active", LocalButtonButtons.style.display === "block");
});
// Add event listener for HistoricFloodButton click
HistoricFloodButton.addEventListener("click", function () {
  HistoricFloodButtonButtons.style.display =
    HistoricFloodButtonButtons.style.display === "none" ? "block" : "none";
  this.classList.toggle("active", HistoricFloodButtonButtons.style.display === "block");
});







extentsButton.addEventListener("click", function () {
  extentsButtonButtons.style.display =
    extentsButtonButtons.style.display === "none" ? "block" : "none";
  this.classList.toggle(
    "active",
    extentsButtonButtons.style.display === "block"
  );
});

impButton.addEventListener("click", function () {
  impButtonButtons.style.display =
    impButtonButtons.style.display === "none" ? "block" : "none";
  this.classList.toggle("active", impButtonButtons.style.display === "block");
});

// Assuming `acc` is a NodeList of elements with the class 'accordion'
var acc = document.querySelectorAll('.accordion');

// Iterate over each accordion element
for (var i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var checkbox = this.querySelector("input[type='checkbox']");
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
    }

    var panel = document.getElementById(this.getAttribute("data-target"));
    if (panel) {
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    }
  });

  var checkbox = acc[i].querySelector("input[type='checkbox']");
  if (checkbox) {
    checkbox.addEventListener("change", function () {
      var panelId = this.parentNode.getAttribute("data-target");
      var panel = document.getElementById(panelId);
      if (panel) {
        var accordion = panel.previousElementSibling;
        if (accordion) {
          accordion.classList.toggle("active", this.checked);
        }
        if (this.checked) {
          panel.style.maxHeight = panel.scrollHeight + "px";
        } else {
          panel.style.maxHeight = null;
        }
      }
    });
  }
}


/////////////////////////////////////////////////MAP///////////////////////////////////

mapboxgl.accessToken =
  "pk.eyJ1IjoiZW5ncmtpIiwiYSI6ImNrc29yeHB2aDBieDEydXFoY240bXExcWoifQ.WS7GVtVGZb4xgHn9dleszQ";
const initialCoordinate = [-45.447303, 30.753574];
const targetCoordinate = [71.5249,34.0151];
const bounds = [
  [61.347656,30.078601], // Southwest coordinates
  [74.399414,36.976227 ] // Northeast coordinates
  //"bbox": [ 69.2376951860001, 31.052467844, 74.1352674840001, 36.914866407 ],    
];
const map = new mapboxgl.Map({
  container: "map",
  zoom: 12,
  center: initialCoordinate,
  pitch: 0,
  bearing: 0,
  antialias: true,
  style: "mapbox://styles/mapbox/satellite-streets-v12",
  //maxBounds: bounds // Set the map's geographical boundaries.

});



map.on("style.load", () => {
  map.setFog({});
  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://styles/mapbox/dark-v11",
    tileSize: 512,
    maxzoom: 20,
  });

  map.setTerrain({ source: "mapbox-dem", exaggeration: 4.5 });
});

setTimeout(() => {
  map.flyTo({ center: targetCoordinate, zoom: 7.5, speed: 0.6 });
}, 1000);
// creating the customn control for the 3d buildings data 
function addBuildingControl(map) {
  let buildingsAdded = false;

  class BuildingControl {
    onAdd(map) {
      const container = document.createElement("div");
      container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

      const button = document.createElement("button");
      button.innerHTML = `<img src="buildingicon.svg" alt="Buildings" style="width: 20px; height: 20px;">`;
      button.style.backgroundColor = "#ffffff"; // Default background color

      button.addEventListener("click", () => {
        const targetCoordinates = [71.5249,34.0151]; // Target coordinates to fly to

        if (buildingsAdded) {
          removeBuildings(map);
          buildingsAdded = false;
          button.style.backgroundColor = "#ffffff"; // Un-highlight the icon
        } else {
          addBuildings(map);
          buildingsAdded = true;
          button.style.backgroundColor = "#007bff"; // Highlight the icon in blue
          // Fly to the target coordinates when buildings are added
          map.flyTo({
            center: targetCoordinates,
            zoom: 15.5,
            pitch: 45,
            bearing: -17.6
          });
        }
      });

      container.appendChild(button);
      return container;
    }
  }

  const buildingControl = new BuildingControl();
  map.addControl(buildingControl, "top-right");
}

function addBuildings(map) {
  // Insert the layer beneath any symbol layer.
  const layers = map.getStyle().layers;
  const labelLayerId = layers.find(
    (layer) => layer.type === "symbol" && layer.layout["text-field"]
  ).id;

  map.addLayer(
    {
      id: "add-3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#aaa",
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "height"],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "min_height"],
        ],
        "fill-extrusion-opacity": 0.6,
      },
    },
    labelLayerId
  );
}

function removeBuildings(map) {
  map.removeLayer("add-3d-buildings");
}
// creating a 3d control for the map in mapbox 
// creating a customn control for 3D terrrain
function add3DControl(map) {
  class ThreeDControl {
    constructor() {
      this._button = null;
      this._is3DActive = false;
      this._defaultPitch = 0;
      this._defaultBearing = 0;
    }

    onAdd(map) {
      const tooltipText = "For 3D visualization click here";

      const div = document.createElement("div");
      div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

      // Create button with tooltip and icon
      this._button = document.createElement("button");
      this._button.innerHTML = `<img src="3Dworldicon.svg" alt="threed" style="width: 20px; height: 20px;">`;
      this._button.title = tooltipText;

      // Add event listener to toggle 3D terrain and adjust pitch and bearing
      this._button.addEventListener("click", () => {
        this._is3DActive = !this._is3DActive;
        if (this._is3DActive) {
          map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
          });
          map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 3.5 });
          map.easeTo({
            pitch: 80,
            bearing: 41,
            duration: 1000 // Adjust duration as needed
          });
          this._button.classList.add("active");
          this._button.style.backgroundColor = "#007bff"; // Highlight the icon in blue
        } else {
          map.removeSource('mapbox-dem');
          map.setTerrain(null);
          map.easeTo({
            pitch: this._defaultPitch,
            bearing: this._defaultBearing,
            duration: 1000 // Adjust duration as needed
          });
          this._button.classList.remove("active");
          this._button.style.backgroundColor = "#ffffff"; // Un-highlight the icon
        }
      });

      div.appendChild(this._button);

      return div;
    }
  }

  const threeDControl = new ThreeDControl();
  map.addControl(threeDControl, "top-right");
  
  // Store default pitch and bearing values
  map.once('load', () => {
    threeDControl._defaultPitch = map.getPitch();
    threeDControl._defaultBearing = map.getBearing();
  });
}
// creating the functionality to change basemap as leaflet in the mapbox gl js 
// creating a class for a control of style switcher basemap
class MapboxStyleSwitcherControl {
  constructor(styles) {
      this.styles = styles || MapboxStyleSwitcherControl.DEFAULT_STYLES;
  }
  getDefaultPosition() {
      const defaultPosition = "top-right";
      return defaultPosition;
  }
  onAdd(map) {
      this.controlContainer = document.createElement("div");
      this.controlContainer.classList.add("mapboxgl-ctrl");
      this.controlContainer.classList.add("mapboxgl-ctrl-group");
      const mapStyleContainer = document.createElement("div");
      const styleButton = document.createElement("button");
      mapStyleContainer.classList.add("mapboxgl-style-list");
      for (const style of this.styles) {
          const styleElement = document.createElement("button");
          styleElement.innerText = style.title;
          styleElement.classList.add(style.title.replace(/[^a-z0-9-]/gi, '_'));
          styleElement.dataset.uri = JSON.stringify(style.uri);
          styleElement.addEventListener("click", event => {
              const srcElement = event.srcElement;
              map.setStyle(JSON.parse(srcElement.dataset.uri));
              mapStyleContainer.style.display = "none";
              styleButton.style.display = "block";
              const elms = mapStyleContainer.getElementsByClassName("active");
              while (elms[0]) {
                  elms[0].classList.remove("active");
              }
              srcElement.classList.add("active");
          });
          if (style.title === MapboxStyleSwitcherControl.DEFAULT_STYLE) {
              styleElement.classList.add("active");
          }
          mapStyleContainer.appendChild(styleElement);
      }
      styleButton.classList.add("mapboxgl-ctrl-icon");
      styleButton.classList.add("mapboxgl-style-switcher");
      styleButton.addEventListener("click", () => {
          styleButton.style.display = "none";
          mapStyleContainer.style.display = "block";
      });
      document.addEventListener("click", event => {
          if (!this.controlContainer.contains(event.target)) {
              mapStyleContainer.style.display = "none";
              styleButton.style.display = "block";
          }
      });
      this.controlContainer.appendChild(styleButton);
      this.controlContainer.appendChild(mapStyleContainer);
      return this.controlContainer;
  }
  onRemove() {
      return;
  }
}
MapboxStyleSwitcherControl.DEFAULT_STYLE = "Satellite";
MapboxStyleSwitcherControl.DEFAULT_STYLES = [
  { title: "Dark", uri: "mapbox://styles/mapbox/dark-v11" },
  { title: "Light", uri: "mapbox://styles/mapbox/light-v11" },
  { title: "Outdoors", uri: "mapbox://styles/mapbox/outdoors-v12" },
  { title: "Satellite", uri: "mapbox://styles/mapbox/satellite-streets-v12" },
  { title: "Streets", uri: "mapbox://styles/mapbox/streets-v10" }
];
map.addControl(new mapboxgl.ScaleControl());
//adding the fullscreen control to the map
map.addControl(new mapboxgl.FullscreenControl());
// adding the layer swither control to the map
map.addControl(new MapboxStyleSwitcherControl());
//adding the navigation controls to the mapbox map 
const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');
///////////////////////////////////////////LAYER CONTROL/////////////////////////////////
// creating a map on load for customn controls 
  map.on('load',() => {;
    addBuildingControl(map);
    add3DControl(map);
    
});

//adding styles onto map
map.on('style.load', () => {
  addAdditionalSourceAndLayer()
  map.setFog({}); // Set the default atmosphere style
});
// Initialize Chart.js graph
// Assuming `map` is your Mapbox GL JS map instance and `kpkrain` is your GeoJSON data

// Initialize Chart.js graph
let myChart;
const years2 = [2010, 2015, 2020, 2023];
const ctx = document.getElementById('myChart').getContext('2d');

// Function to create or update the chart
function updateChart(data) {
    if (myChart) {
        myChart.data.datasets[0].data = data;
        myChart.update();
    } else {
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years2,
                datasets: [{
                    fill: false,
                    lineTension: 0,
                    backgroundColor: "rgba(0,0,255,1.0)",
                    borderColor: "rgba(0,0,255,0.1)",
                    data: data
                }]
            },
            options: {
                legend: { display: false },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 2000, // Set the max value to 2000
                            stepSize: 500 // Optional: Set the step size for the ticks
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Precipitation',
                            fontSize: 16
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Years',
                            fontSize: 16
                        }
                    }]
                }
            }
        });
    }
}

// Function to show the info control
function showInfoControl() {
    document.getElementById('features').style.display = 'block';
}

// Function to hide the info control
function hideInfoControl() {
    document.getElementById('features').style.display = 'none';
}

// Initialize Chart.js graph for NDVI
let ndviChart;
const ndviYears = [2010, 2015, 2020, 2023];
const ndviCtx = document.getElementById('ndvi-myChart').getContext('2d');

// Function to create or update the NDVI chart
function updateNDVIChart(data) {
    if (ndviChart) {
        ndviChart.data.datasets[0].data = data;
        ndviChart.update();
    } else {
        ndviChart = new Chart(ndviCtx, {
            type: 'line',
            data: {
                labels: ndviYears,
                datasets: [{
                    fill: false,
                    lineTension: 0,
                    backgroundColor: "rgba(0,255,0,1.0)", // Green color for line
                    borderColor: "rgba(0,255,0,0.1)",
                    data: data
                }]
            },
            options: {
                legend: { display: false },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'NDVI Values',
                            fontSize: 16
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Years',
                            fontSize: 16
                        }
                    }]
                }
            }
        });
    }
}
// Function to show the NDVI info control
function showNDVIInfoControl() {
  document.getElementById('ndvi-features').style.display = 'block';
}

// Function to hide the NDVI info control
function hideNDVIInfoControl() {
  document.getElementById('ndvi-features').style.display = 'none';
}
function addAdditionalSourceAndLayer() {
  //adding the 2023 ndvi 
  // Add the source for NDVI data
map.addSource('kpndvigeo', {
  type: 'geojson',
  data: kpndvi
});

// Add the layer for NDVI data
map.addLayer({
  'id': 'kpndvigeo',
  'type': 'fill',
  'source': 'kpndvigeo',
  'paint': {
      'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'ndvi2023'],
          0.076129, '#FF0000', // Red
          0.211877, '#FFA500', // Orange
          0.298609, '#FFFF00', // Yellow
          0.393425, '#00FF00', // Green
          0.507914, '#006400'  // Dark Green
      ],
      'fill-outline-color': 'black', // Black outline color
      'fill-opacity': 0.8 // Adjust transparency if needed
  },
  'layout': {
      'visibility': 'none' // Initially hide the layer
  }
});
  //adding the precipitation for 2010 geojson
  map.addSource('kppreci', {
    type: 'geojson',
    data: kpkrain
});
  map.addLayer({
    'id': 'kppreci',
    'type': 'fill',
    'source': 'kppreci',
    layout: {
      visibility: "none",
    },
    'paint': {
        'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'precipitat'],
            459.45, '#B6B605', // Light blue  
            509.6, '#05B67B',
            509.600001, '#05C2B7',
            640.51, '#06E1D5',
            640.510001, '#08FAED', // Dark blue
            949.58, '#0492FB',
            949.580001, '#257FF1',
            1206.97, '#075ECC',
            1206.970001, '#0229A5',
            1531.49, '#021F7E',
            // Add more ranges and colors if needed
        ],
        'fill-outline-color': 'black', // Black outline color
        'fill-opacity': 0.8, // Adjust transparency if needed
    }
});
//adding the precipitation for 2015 geojson
map.addSource('kppreci2', {
  type: 'geojson',
  data: kpkrain
});
map.addLayer({
  'id': 'kppreci2',
  'type': 'fill',
  'source': 'kppreci2',
  layout: {
    visibility: "none",
  },
  'paint': {
      'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'precipit_1'],

          362.45, '#B6B605', // Light blue  #E0F7FA,#81D4FA,#42A5F5,#1976D2,#0D47A1,#0A2376,#0A2376,#000052                  
          571.65, '#05B67B',
          571.650001, '#05C2B7',
          774.25, '#06E1D5',
          774.250001, '#08FAED', // Dark blue
          982.27, '#0492FB',
          982.270001, '#257FF1',
          1218.66, '#075ECC',
          1218.660001, '#0229A5',
          1759.07, '#021F7E',
          // Add more ranges and colors if needed
      ],
      'fill-outline-color': 'black', // Black outline color
      'fill-opacity': 0.8, // Adjust transparency if needed
  }
});
//adding the precipitation for 2020 geojson
map.addSource('kppreci3', {
  type: 'geojson',
  data: kpkrain
});
map.addLayer({
  'id': 'kppreci3',
  'type': 'fill',
  'source': 'kppreci3',
  layout: {
    visibility: "none",
  },
  'paint': {
      'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'precipit_2'],
          
          405.71, '#B6B605', // Light blue
          575.54, '#05B67B',
          575.540001, '#05C2B7',
          839.71, '#06E1D5',
          839.710001, '#08FAED', // Dark blue
          1033.55, '#0492FB',
          1033.550001, '#257FF1',
          1407.35, '#075ECC',
          1407.350001, '#0229A5',
          1755.38, '#021F7E',
          // Add more ranges and colors if needed
      ],
      'fill-outline-color': 'black', // Black outline color
      'fill-opacity': 0.8, // Adjust transparency if needed
  }
});
//adding the precipitation for 2023 geojson
map.addSource('kppreci4', {
  type: 'geojson',
  data: kpkrain
});
map.addLayer({
  'id': 'kppreci4',
  'type': 'fill',
  'source': 'kppreci4',
  layout: {
    visibility: "none",
  },
  'paint': {
      'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'Precipit_3'],
          294.95, '#B6B605', // Light blue
          371.16, '#05B67B',
          371.160001, '#05C2B7',
          473.86, '#06E1D5',
          473.860001, '#08FAED', // Dark blue
          635.01, '#0492FB',
          635.010001, '#257FF1',
          874.13, '#075ECC',
          874.130001, '#0229A5',
          1425.71, '#021F7E',
          // Add more ranges and colors if needed
      ],
      'fill-outline-color': 'black', // Black outline color
      'fill-opacity': 0.8, // Adjust transparency if needed
  }
});

    // National Boundary
    map.addSource("nationalBoundary", {
      type: "vector",
      scheme: "tms",
      tiles: [
        `http://172.18.1.4:8080/geoserver/gwc/service/tms/1.0.0/abdul_sattar:National_Boundary@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
    });
  
    map.addLayer({
      id: "nationalBoundary",
      type: "line",
      source: "nationalBoundary",
      "source-layer": "National_Boundary",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-opacity": 0.8,
        "line-color": "yellow",
        "line-width": 3,
      },
    });
  
    const nationalButton = document.getElementById("nationalButton");
    const nationalCheckbox = document.getElementById("nationalCheckbox");
  
    nationalButton.addEventListener("click", function () {
      const isVisible = nationalCheckbox.checked;
      map.setLayoutProperty(
        "nationalBoundary",
        "visibility",
        isVisible ? "visible" : "none"
      );
    });
  
    // Provincial Boundary
    map.addSource("provincialBoundary", {
      type: "vector",
      scheme: "tms",
      tiles: [
        `http://172.18.1.4:8080/geoserver/gwc/service/tms/1.0.0/abdul_sattar:Provincial_Boundary@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
    });
  
    map.addLayer({
      id: "provincialBoundary",
      type: "line",
      source: "provincialBoundary",
      "source-layer": "Provincial_Boundary",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-opacity": 0.8,
        "line-color": "#ccff15",
        "line-width": 1.8,
      },
    });
  
    const provincialButton = document.getElementById("provincialButton");
    const provincialCheckbox = document.getElementById("provincialCheckbox");
  
    provincialButton.addEventListener("click", function () {
      const isVisible = provincialCheckbox.checked;
      map.setLayoutProperty(
        "provincialBoundary",
        "visibility",
        isVisible ? "visible" : "none"
      );
    });
  
  
  
  
  
  
    //DISTRICT BOUNDARY
    map.addSource("districtBoundary", {
      type: "vector",
      scheme: "tms",
      tiles: [
        `http://172.18.1.4:8080/geoserver/gwc/service/tms/1.0.0/abdul_sattar:District_Boundary@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
    });
  
    map.addLayer({
      id: "districtBoundary",
      type: "line",
      source: "districtBoundary",
      "source-layer": "District_Boundary",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-opacity": 0.8,
        "line-color": "#FF7C00 ",
        "line-width": 1,
      },
      'filter': ['any', ['==', 'PROVINCE', 'KHYBER PAKHTUNKHWA'], ['==', 'PROVINCE', 'FATA']]
     
    });
  
    map.addLayer({
      id: "districtBoundary_label",
      type: "symbol",
      source: "districtBoundary", // ID of the tile source created above
      "source-layer": "District_Boundary",
      minzoom: 6,
      layout: {
        visibility: "none",
        "text-field": "{DISTRICT}", // Field from the data containing label text
        "text-letter-spacing": 0.1,
        "text-size": 12, // Adjust text size
        "text-offset": [0, 0], // Adjust label offset
        "text-anchor": "center", // Positioning of the label
      },
      paint: {
        "text-color": "white",
        "text-halo-color": "#000000", // Color of the text outline
        "text-halo-width": 1,
      },
    });
  
    const districtButton = document.getElementById("districtButton");
    const districtCheckbox = document.getElementById("districtCheckbox");
  
    districtButton.addEventListener("click", function () {
      const isVisible = districtCheckbox.checked;
      map.setLayoutProperty(
        "districtBoundary",
        "visibility",
        isVisible ? "visible" : "none"
      );
      map.setLayoutProperty(
        "districtBoundary_label",
        "visibility",
        isVisible ? "visible" : "none"
      );
    });
  
    //TEHSIL BOUNDARY
    map.addSource("tehsilBoundary", {
      type: "vector",
      scheme: "tms",
      tiles: [
        `http://172.18.1.4:8080/geoserver/gwc/service/tms/1.0.0/abdul_sattar:Tehsil_Boundary@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
    });
  
    map.addLayer({
      id: "TehsilBoundaryLine",
      type: "line",
      source: "tehsilBoundary",
      "source-layer": "Tehsil_Boundary",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-opacity": 0.5,
        "line-color": "white",
        "line-width": 0.5,
      },
      'filter': ['any', ['==', 'PROVINCE', 'KHYBER PAKHTUNKHWA'], ['==', 'PROVINCE', 'FATA']]
    });
  
    map.on("click", "TehsilBoundary", function (e) {
      var features = e.features;
  
      if (!features || features.length === 0) {
        return;
      }
  
      var feature = features[0].properties;
      var popupContent = `<div class="popup-content"><b>TEHSIL:</b> ${feature.TEHSIL}</div>`;
  
      new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
    });
  
    map.on("mouseenter", "TehsilBoundary", function () {
      map.getCanvas().style.cursor = "pointer";
    });
  
    map.on("mouseleave", "TehsilBoundary", function () {
      map.getCanvas().style.cursor = "";
    });
  
    const tehsilButton = document.getElementById("tehsilButton");
    const tehsilCheckbox = document.getElementById("tehsilCheckbox");
  
    tehsilButton.addEventListener("click", function () {
      const isVisible = tehsilCheckbox.checked;
  
      map.setLayoutProperty(
        "TehsilBoundaryLine",
        "visibility",
        isVisible ? "visible" : "none"
      );
    });
  
    ////////////////////////////////EXTENTS2022
    map.addSource("EXTENTS2022", {
      type: "vector",
      scheme: "tms",
      tiles: [
        `http://172.18.1.4:8080/geoserver/gwc/service/tms/1.0.0/abdul_sattar:river_2022_extent@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
    });
  
    map.addLayer({
      id: "EXTENTS2022",
      type: "fill",
      source: "EXTENTS2022",
      "source-layer": "river_2022_extent",
      layout: {
        visibility: "none",
      },
      paint: {
        "fill-opacity": 1,
        "fill-color": "cyan",
      },
      
    });
  
    const ext_22 = document.getElementById("ext_22");
    const ext_22Checkbox = document.getElementById("ext_22Checkbox");
  
    ext_22.addEventListener("click", function () {
      const isVisible = ext_22Checkbox.checked;
      map.setLayoutProperty(
        "EXTENTS2022",
        "visibility",
        isVisible ? "visible" : "none"
      );
    });
  
    //////////////////////////////////2023
    map.addSource("EXTENTS2023", {
      type: "vector",
      scheme: "tms",
      tiles: [
        `http://172.18.1.4:8080/geoserver/gwc/service/tms/1.0.0/abdul_sattar:extent_2023_flood@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
    });
  
    map.addLayer({
      id: "EXTENTS2023",
      type: "fill",
      source: "EXTENTS2023",
      "source-layer": "extent_2023_flood",
      layout: {
        visibility: "none",
      },
      paint: {
        "fill-opacity": 0.5,
        "fill-color": "#FB44FB ",
      },
    });
  
    const ext_23 = document.getElementById("ext_23");
    const ext_23Checkbox = document.getElementById("ext_23Checkbox");
  
    ext_23.addEventListener("click", function () {
      const isVisible = ext_23Checkbox.checked;
      map.setLayoutProperty(
        "EXTENTS2023",
        "visibility",
        isVisible ? "visible" : "none"
      );
    });
  
    
    //////////////////////////////////2024
    map.addSource("EXTENTS2024", {
      type: "vector",
      scheme: "tms",
      tiles: [
        `http://172.18.1.4:8080/geoserver/gwc/service/tms/1.0.0/abdul_sattar:extent_2024_low@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
    });
  
    map.addLayer({
      id: "EXTENTS2024",
      type: "fill",
      source: "EXTENTS2024",
      "source-layer": "extent_2024_low",
      layout: {
        visibility: "none",
      },
      paint: {
        "fill-opacity": 0.5,
        "fill-color": "#FEFE00 ",
      },
    });
  
    const ext_24 = document.getElementById("ext_24");
    const ext_24Checkbox = document.getElementById("ext_24Checkbox");
  
    ext_24.addEventListener("click", function () {
      const isVisible = ext_24Checkbox.checked;
      map.setLayoutProperty(
        "EXTENTS2024",
        "visibility",
        isVisible ? "visible" : "none"
      );
    });
  
    //////////////////////////////////HOTSPOTS
    map.addSource("HOTSPOTS", {
      type: "vector",
      scheme: "tms",
      tiles: [
        `http://172.18.1.4:8080/geoserver/gwc/service/tms/1.0.0/abdul_sattar:flood_Hotspot_Area@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
    });
  
    map.addLayer({
      id: "HOTSPOTS",
      type: "line",
      source: "HOTSPOTS",
      "source-layer": "flood_Hotspot_Area",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-opacity": 1,
        "line-color": "red",
        "line-width": 8,
      },
      
    });
  
    function toggleOpacity() {
      const currentOpacity = map.getPaintProperty("HOTSPOTS", "line-opacity");
      const newOpacity = currentOpacity === 0 ? 0.5 : 0;
      map.setPaintProperty("HOTSPOTS", "line-opacity", newOpacity);
    }
    const intervalId = window.setInterval(toggleOpacity, 700);
  
    const htspts = document.getElementById("htspts");
    const htsptsCheckbox = document.getElementById("htsptsCheckbox");
  
    htspts.addEventListener("click", function () {
      const isVisible = htsptsCheckbox.checked;
      map.setLayoutProperty(
        "HOTSPOTS",
        "visibility",
        isVisible ? "visible" : "none"
      );
      if (isVisible) {
        map.moveLayer("HOTSPOTS");
      }
    });
  
    //////////////////////////////////HOSPITALS////////////////////////////////////////////////////////////////////////////////////////
    // Add hospitals source and layer
map.addSource("hospitals", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:Health_facilities@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "hospitals",
  type: "circle",
  source: "hospitals",
  "source-layer": "Health_facilities",
  layout: {
    visibility: "none",
  },
  paint: {
    "circle-opacity": 0.6,
    "circle-color": "pink",
  },
});

const hosp = document.getElementById("hosp");
const hospCheckbox = document.getElementById("hospCheckbox");

hosp.addEventListener("click", function () {
  const isVisible = hospCheckbox.checked;
  map.setLayoutProperty(
    "hospitals",
    "visibility",
    isVisible ? "visible" : "none"
  );
});

// Add click event listener for hospitals layer
map.on('click', 'hospitals', function (e) {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['hospitals']
  });

  if (!features.length) {
    return;
  }

  const feature = features[0];

  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(
      `<strong>Category:</strong> ${feature.properties.Category}<br>
      <strong>Name:</strong> ${feature.properties.Name}<br>
      <strong>Tehsil:</strong> ${feature.properties.Tehsil}<br>
      <strong>District:</strong> ${feature.properties.District}<br>
      <strong>Province:</strong> ${feature.properties.Province}<br>
      <strong>Functional:</strong> ${feature.properties.Functional}<br>`
    )
    .addTo(map);
});

map.on('mouseenter', 'hospitals', function () {
  map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'hospitals', function () {
  map.getCanvas().style.cursor = '';
});
    //////////////////////////////////SCHOOLS////////////////////////////////////////////////////////////////////////////////////////////////
    map.addSource("schools", {
      type: "vector",
      scheme: "tms",
      tiles: [
        `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:Schools@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
    });
    
    map.addLayer({
      id: "schools",
      type: "circle",
      source: "schools",
      "source-layer": "Schools",
      layout: {
        visibility: "none",
      },
      paint: {
        "circle-opacity": 0.6,
        "circle-color": "#810008",
      },
    });
    
    const schl = document.getElementById("schl");
    const schlCheckbox = document.getElementById("schlCheckbox");
    
    schl.addEventListener("click", function () {
      const isVisible = schlCheckbox.checked;
      map.setLayoutProperty(
        "schools",
        "visibility",
        isVisible ? "visible" : "none"
      );
    });
    
    // Add click event listener for schools layer
    map.on('click', 'schools', function (e) {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['schools']
      });
    
      if (!features.length) {
        return;
      }
    
      const feature = features[0];
    
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
          `<strong>School Name:</strong> ${feature.properties.Schoolname}<br>
          <strong>Country:</strong> ${feature.properties.Country}<br>
          <strong>District:</strong> ${feature.properties.district}<br>
          <strong>Province:</strong> ${feature.properties.province}<br>
          <strong>Tehsil:</strong> ${feature.properties.TEHSIL}<br>
          <strong>Emiscode:</strong> ${feature.properties.Emiscode}<br>
          <strong>Gender:</strong> ${feature.properties.Gender}<br>
          <strong>Level:</strong> ${feature.properties.Level}<br>
          <strong>Boys:</strong> ${feature.properties.Boys}<br>
          <strong>Girls:</strong> ${feature.properties.Girls}<br>
          <strong>Teachers:</strong> ${feature.properties.Teachers}`
        )
        .addTo(map);
    });
    
    map.on('mouseenter', 'schools', function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'schools', function () {
      map.getCanvas().style.cursor = '';
    });
  
    //////////////////////////////////Settlements/////////////////////////////////////////////////////////////////////////////////////////////////////
    map.addSource("settlements", {
      type: "vector",
      scheme: "tms",
      tiles: [
        `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:Settlements@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
    });
    
    map.addLayer({
      id: "settlements",
      type: "circle",
      source: "settlements",
      "source-layer": "Settlements",
      layout: {
        visibility: "none",
      },
      paint: {
        "circle-opacity": 0.6,
        "circle-color": "green",
      },
    });
    
    const sett = document.getElementById("sett");
    const settCheckbox = document.getElementById("settCheckbox");
    
    sett.addEventListener("click", function () {
      const isVisible = settCheckbox.checked;
      map.setLayoutProperty(
        "settlements",
        "visibility",
        isVisible ? "visible" : "none"
      );
    });
    
    // Add a click event listener for the 'settlements' layer
    map.on('click', 'settlements', function (e) {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['settlements']
      });
    
      if (!features.length) {
        return;
      }
    
      const feature = features[0];
    
      // Create the popup
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
          `<strong>Name:</strong> ${feature.properties.FULL_NAME1}<br>
          <strong>District:</strong> ${feature.properties.DISTRICT}<br>
          <strong>Tehsil:</strong> ${feature.properties.TEHSIL}`
        )
        .addTo(map);
    });
    
    // Change the cursor to a pointer when the mouse is over the settlements layer
    map.on('mouseenter', 'settlements', function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    // Change it back to a pointer when it leaves
    map.on('mouseleave', 'settlements', function () {
      map.getCanvas().style.cursor = '';
    });
    
    //////////////////////////////////Airports///////////////////////////////////////////////////////////////////////////////////////////
   // Add airports source and layer
map.addSource("airports", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:airports@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "airports",
  type: "circle",
  source: "airports",
  "source-layer": "airports",
  layout: {
    visibility: "none",
  },
  paint: {
    "circle-opacity": 0.6,
    "circle-color": "white",
  },
});

const arprts = document.getElementById("arprts");
const arprtsCheckbox = document.getElementById("arprtsCheckbox");

arprts.addEventListener("click", function () {
  const isVisible = arprtsCheckbox.checked;
  map.setLayoutProperty(
    "airports",
    "visibility",
    isVisible ? "visible" : "none"
  );
});

// Add click event listener for airports layer
map.on('click', 'airports', function (e) {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['airports']
  });

  if (!features.length) {
    return;
  }

  const feature = features[0];

  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(
      `<strong>City:</strong> ${feature.properties.City}<br>
      <strong>ICAO:</strong> ${feature.properties.ICAO}<br>
      <strong>IATA:</strong> ${feature.properties.IATA}<br>
      <strong>Usage:</strong> ${feature.properties.Usage}<br>
      <strong>Lat:</strong> ${feature.properties.Lat}<br>
      <strong>Long:</strong> ${feature.properties.Long}<br>
      <strong>Type:</strong> ${feature.properties.Type}<br>
      <strong>Name:</strong> ${feature.properties.Name}`
    )
    .addTo(map);
});

map.on('mouseenter', 'airports', function () {
  map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'airports', function () {
  map.getCanvas().style.cursor = '';
});
    //////////////////////////////////RoadsNetwork/////////////////////////////////////////////////////////////////////////////////////////
    // Add the source for the road_net layer
map.addSource("road_net", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:Roads@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

// Add the road_net layer with the specified styling
map.addLayer({
  id: "road_net",
  type: "line",
  source: "road_net",
  "source-layer": "Roads",
  layout: {
    visibility: "none",
  },
  paint: {
    "line-opacity": 1,
    "line-color": "#FF0000", // Red color
    "line-width": 3, // Good width for better visibility
  },
});

// Add event listener for visibility toggle
const roadnet = document.getElementById("road_net");
const roadnetCheckbox = document.getElementById("road_netCheckbox");

roadnet.addEventListener("click", function () {
  const isVisible = roadnetCheckbox.checked;
  map.setLayoutProperty(
    "road_net",
    "visibility",
    isVisible ? "visible" : "none"
  );
});
    //////////////////////////////////TEHSILS
    // Add source for the imp_thsils layer (dams)
// Add vector tile source and layer
map.on('load', function() {
  map.addSource("imp_thsils", {
      type: "vector",
      scheme: "tms",
      tiles: [
          `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:dams@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
  });

  map.addLayer({
      id: 'imp_thsils',
      type: 'circle',
      source: 'imp_thsils',
      "source-layer": 'dams',
      paint: {
          'circle-radius': 5,
          'circle-color': '#0000FF'
      },
      layout: {
          'visibility': 'none'
      }
  });

  // Add event listener for the toggle button
  document.getElementById('thsls').addEventListener('click', function() {
      const checkbox = document.getElementById('thslsCheckbox');
      const visibility = checkbox.checked ? 'visible' : 'none';
      map.setLayoutProperty('imp_thsils', 'visibility', visibility);
  });

  // Add popup on click
  map.on('click', 'imp_thsils', function(e) {
      const properties = e.features[0].properties;
      const coordinates = e.features[0].geometry.coordinates.slice();

      const popupContent = `
          <h3>${properties.name_of_da}</h3>
          <p><strong>Height:</strong> ${properties.height}</p>
          <p><strong>Storage Capacity:</strong> ${properties.Storage_Ca}</p>
          <p><strong>Location:</strong> ${properties.location}</p>
          <p><strong>Year of Construction:</strong> ${properties.year_of_co}</p>
          <p><strong>Province:</strong> ${properties.province}</p>
          <p><strong>Coordinates:</strong> [${properties.lon}, ${properties.lat}]</p>
      `;

      new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the 'imp_thsils' layer
  map.on('mouseenter', 'imp_thsils', function() {
      map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to default when it leaves
  map.on('mouseleave', 'imp_thsils', function() {
      map.getCanvas().style.cursor = '';
  });
});
//-----------------------GIBS Flood layer-----------------------------------------------------------------------------------------//
//adding the GIBS Layer Layer
map.addSource('dyn_flood', {
  type: 'raster',
  tiles: [
    'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&LAYERS=OPERA_L3_Dynamic_Surface_Water_Extent-HLS_Provisional&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&TIME='
  ],
  tileSize: 256
});
map.addLayer({
  id: 'dyn_flood',
  type: 'raster',
  source: 'dyn_flood',
  paint: { 'raster-opacity': 0.7 },
  layout: { visibility: 'none' }
}, );
map.addSource('flood2day', {
  type: 'raster',
  tiles: [
    'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&LAYERS=MODIS_Combined_Flood_2-Day&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&TIME='
  ],
  tileSize: 256
});
map.addLayer({
  id: 'flood2d',
  type: 'raster',
  source: 'flood2day',
  paint: { 'raster-opacity': 0.7 },
  layout: { visibility: 'none' }
}, );
map.addSource('flood3day', {
  type: 'raster',
  tiles: [
    'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&LAYERS=MODIS_Combined_Flood_3-Day&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&TIME='
  ],
  tileSize: 256
});
map.addLayer({
  id: 'flood3d',
  type: 'raster',
  source: 'flood3day',
  paint: { 'raster-opacity': 0.7 },
  layout: { visibility: 'none' }
}, );
map.addSource('floodsumm13', {
  type: 'raster',
  tiles: [
    'https://ows.globalfloods.eu/glofas-ows/ows.py?SERVICE=WMS&REQUEST=GetMap&LAYERS=sumAL41EGE&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&TIME='
  ],
  tileSize: 256
});
map.addLayer({
  id: 'floodsumm13l',
  type: 'raster',
  source: 'floodsumm13',
  paint: { 'raster-opacity': 0.7 },
  layout: { visibility: 'none' }
}, );
//-----------------------------------adding the localy calculated layer from syndicate------------------------------------------------------//
//adding the KPK Geology data calculated
map.addSource("kpgeology", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:KPKGeology@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "kpgeology",
  type: "fill",
  source: "kpgeology",
  "source-layer": "KPKGeology",
  layout: {
    visibility: "none",
  },
  paint: {
    "fill-opacity": 0.7,
    // Use a data-driven approach for fill color based on the "GLG" property
    "fill-color": [
      "match",
      ["get", "GLG"],
      "Ts", "#9b0f01",
      "Trms", "#ba1f02",
      "Tr", "#d33205",
      "TKim", "#e6480c",
      "Ti", "#f46516",
      "S", "#fc8625",
      "Q", "#fea732",
      "C", "#f7c13a",
      "Pzl", "#e7d739",
      "Pzi", "#cfeb34",
      "Pz", "#b3f836",
      "PTr", "#94ff46",
      "Pg", "#6afd65",
      "pC", "#40f689",
      "N", "#20eaac",
      "Mz", "#18d9c8",
      "Mi", "#23c2e5",
      "Ks", "#37a7fa",
      "KJs", "#458bfd",
      "JTr", "#476fe7",
      "Jms", "#4452c0",
      "Cs", "#3c3287",
      "CMi", "#30123b",
      /* Add default color if GLG does not match any of the above */
      "#ffffff"
    ]
  }
});

//adding the kpk soil layer
map.addSource("kpsoil", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:KPKSoilprojected@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

console.log("kpsoil source added");

// Add layer with console.log() to check if it's added
map.addLayer({
  id: "kpsoil",
  type: "fill",
  source: "kpsoil",
  "source-layer": "KPKSoilprojected",
  layout: {
    visibility: "none",
  },
  paint: {
    "fill-opacity": 0.7,
    "fill-color": [
      "match",
      ["get", "DOMSOI"],
      "Be", "#d7191c",
      "GL", "#ea643f",
      "I", "#fdae61",
      "Jc", "#fed790",
      "Rc", "#ffffbf",
      "Xh", "#d5eeb2",
      "Yh", "#abdda4",
      "Yk", "#6bb0af",
      /* Add default color if DOMSOI does not match any of the above */
      "#ffffff"
    ]
  }
});
//---------------adding the historic flood events---------------------------------------------------------------------//

  //adding the flooding event of 2010 basically 27th July 2010
map.addSource("27july2010", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:27_jul_2010@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "27july2010",
  type: "fill",
  source: "27july2010",
  "source-layer": "27_jul_2010",
  layout: {
    visibility: "none",
  },

  paint: {
    "fill-opacity": 0.9,
    // Use a data-driven approach for fill color based on the "GLG" property
    "fill-color": "#8A7A76",
    "fill-outline-color": "red", // Outline color
    "fill-outline-width": 3 // Adjust thickness of the outline
  }
});
//adding the flooding event of  basically 23rd August 2012
map.addSource("23rdAugust2012", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:23_Aug_2012@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "23rdAugust2012",
  type: "fill",
  source: "23rdAugust2012",
  "source-layer": "23_Aug_2012",
  layout: {
    visibility: "none",
  },

  paint: {
    "fill-opacity": 0.9,
    // Use a data-driven approach for fill color based on the "GLG" property
    "fill-color": "#F8E906",
    "fill-outline-color": "black", // Outline color
    "fill-outline-width": 3 // Adjust thickness of the outline
  }
});

//adding the flooding event of  basically 16th September 2012
map.addSource("16thSeptember2012", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:16_Sep_2012@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "16thSeptember2012",
  type: "fill",
  source: "16thSeptember2012",
  "source-layer": "16_Sep_2012",
  layout: {
    visibility: "none",
  },

  paint: {
    "fill-opacity": 0.9,
    // Use a data-driven approach for fill color based on the "GLG" property
    "fill-color": "#74FF00",
    "fill-outline-color": "white", // Outline color
    "fill-outline-width": 3 // Adjust thickness of the outline
  }
});

//adding the flooding event of  basically 1st August 2013
map.addSource("1stAugust2013", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:1_Aug_2013@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "1stAugust2013",
  type: "fill",
  source: "1stAugust2013",
  "source-layer": "1_Aug_2013",
  layout: {
    visibility: "none",
  },

  paint: {
    "fill-opacity": 0.9,
    // Use a data-driven approach for fill color based on the "GLG" property
    "fill-color": "#00FFE0",
    "fill-outline-color": "purple", // Outline color
    "fill-outline-width": 3 // Adjust thickness of the outline
  }
});

//adding the flooding event of  basically 7th August 2013
map.addSource("7thAugust2013", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:7_Aug_2013@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "7thAugust2013",
  type: "fill",
  source: "7thAugust2013",
  "source-layer": "7_Aug_2013",
  layout: {
    visibility: "none",
  },

  paint: {
    "fill-opacity": 0.9,
    // Use a data-driven approach for fill color based on the "GLG" property
    "fill-color": "#9300FF",
    "fill-outline-color": "grey", // Outline color
    "fill-outline-width": 3 // Adjust thickness of the outline
  }
});

//adding the flooding event of  basically 1st September 2014
map.addSource("1stSeptember2014", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:1_Sep_2014@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "1stSeptember2014",
  type: "fill",
  source: "1stSeptember2014",
  "source-layer": "1_Sep_2014",
  layout: {
    visibility: "none",
  },

  paint: {
    "fill-opacity": 0.9,
    // Use a data-driven approach for fill color based on the "GLG" property
    "fill-color": "#0046FF",
    "fill-outline-color": "blue", // Outline color
    "fill-outline-width": 3 // Adjust thickness of the outline
  }
});

//adding the flooding event of  basically 15th July 2015
map.addSource("15thJuly2015", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:15_Jul_2015@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "15thJuly2015",
  type: "fill",
  source: "15thJuly2015",
  "source-layer": "15_Jul_2015",
  layout: {
    visibility: "none",
  },

  paint: {
    "fill-opacity": 0.9,
    // Use a data-driven approach for fill color based on the "GLG" property
    "fill-color": "#FF00FF",
    "fill-outline-color": "brown", // Outline color
    "fill-outline-width": 3 // Adjust thickness of the outline
  }
});

//adding the flooding event of  basically 12th March 2016
map.addSource("12thMarch2016", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:12_Mar_2016@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "12thMarch2016",
  type: "fill",
  source: "12thMarch2016",
  "source-layer": "12_Mar_2016",
  layout: {
    visibility: "none",
  },

  paint: {
    "fill-opacity": 0.9,
    // Use a data-driven approach for fill color based on the "GLG" property
    "fill-color": "#3D715E",
    "fill-outline-color": "green", // Outline color
    "fill-outline-width": 3 // Adjust thickness of the outline
  }
});

//adding the flooding event of  basically 3rd July 2018
map.addSource("3rdJuly2018", {
  type: "vector",
  scheme: "tms",
  tiles: [
    `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:3_Jul_2018@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
  ],
});

map.addLayer({
  id: "3rdJuly2018",
  type: "fill",
  source: "3rdJuly2018",
  "source-layer": "3_Jul_2018",
  layout: {
    visibility: "none",
  },

  paint: {
    "fill-opacity": 0.9,
    // Use a data-driven approach for fill color based on the "GLG" property
    "fill-color": "#162C8E",
    "fill-outline-color": "orange", // Outline color
    "fill-outline-width": 3 // Adjust thickness of the outline
  }
});
//adding the KPK LULC layer
map.addSource('kplulc', {
  type: 'raster',
  tiles: [
    'http://172.18.1.39:8080/geoserver/KPSyndicate/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=KPKLULC&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&TIME='
  ],
  tileSize: 256
});
map.addLayer({
  id: 'kplulc',
  type: 'raster',
  source: 'kplulc',
  paint: { 'raster-opacity': 0.7 },
  layout: { visibility: 'none' }
}, );
//adding the KPK Distance From River layer
map.addSource('distriver', {
  type: 'raster',
  tiles: [
    'http://172.18.1.39:8080/geoserver/KPSyndicate/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=Distance_RiverKPK&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&TIME='
  ],
  tileSize: 256
});
map.addLayer({
  id: 'distriver',
  type: 'raster',
  source: 'distriver',
  paint: { 'raster-opacity': 0.7 },
  layout: { visibility: 'none' }
}, );

//adding the KPK TPI layer
map.addSource('kptpi', {
  type: 'raster',
  tiles: [
    'http://172.18.1.39:8080/geoserver/KPSyndicate/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=tpi_wajahat&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&TIME='
  ],
  tileSize: 256
});
map.addLayer({
  id: 'kptpi',
  type: 'raster',
  source: 'kptpi',
  paint: { 'raster-opacity': 0.7 },
  layout: { visibility: 'none' }
}, );
//adding the KPK Drainage Density layer
map.addSource('kpdrainage', {
  type: 'raster',
  tiles: [
    'http://172.18.1.39:8080/geoserver/KPSyndicate/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=KPKDrainage_DensityPRJ50&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&TIME='
  ],
  tileSize: 256
});
map.addLayer({
  id: 'kpdrainage',
  type: 'raster',
  source: 'kpdrainage',
  paint: { 'raster-opacity': 0.7 },
  layout: { visibility: 'none' }
}, );
//adding the KPK Slope layer
map.addSource('kpslope', {
  type: 'raster',
  tiles: [
    'http://172.18.1.39:8080/geoserver/KPSyndicate/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=KPKSlope&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&TIME='
  ],
  tileSize: 256
});
map.addLayer({
  id: 'kpslope',
  type: 'raster',
  source: 'kpslope',
  paint: { 'raster-opacity': 0.7 },
  layout: { visibility: 'none' }
}, );
}
// Function to show popup with attribute properties
// Define an array of layer IDs
var layerIDs = ["27july2010", "23rdAugust2012", "16thSeptember2012", "1stAugust2013", "7thAugust2013", "1stSeptember2014", "15thJuly2015", "12thMarch2016", "3rdJuly2018"];

// Loop through each layer ID and add popup function and cursor change event listeners
layerIDs.forEach(function(layerID) {
  map.on('click', layerID, function (e) {
    var feature = e.features[0];
    var popupContent = `
      <h3>Attribute Details</h3>
      <table>
          <tr><th>Attribute</th><th>Value</th></tr>
          <tr><td>Shape_Area</td><td>${feature.properties.Shape_Area}</td></tr>
          <tr><td>Shape_Leng</td><td>${feature.properties.Shape_Leng}</td></tr>
      </table>`;
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(popupContent)
      .addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the layer
  map.on('mouseenter', layerID, function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to default when it leaves
  map.on('mouseleave', layerID, function () {
    map.getCanvas().style.cursor = '';
  });
});
// the popup function for kpk geology
map.on('click', 'kpgeology', function (e) {
  var feature = e.features[0];
  var popupContent = `
    <h3>Geology Details</h3>
    <table>
        <tr><th>Attribute</th><th>Value</th></tr>
        <tr><td>Area</td><td>${feature.properties.AREA}</td></tr>
        <tr><td>Perimeter</td><td>${feature.properties.PERIMETER}</td></tr>
        <tr><td>GLG</td><td>${feature.properties.GLG}</td></tr>
    </table>
  `;
  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(popupContent)
    .addTo(map);
});
// Change the cursor to a pointer when the mouse is over the kpgeology layer.
map.on('mouseenter', 'kpgeology', function () {
  map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'kpgeology', function () {
  map.getCanvas().style.cursor = '';
});

//adding functionality for kpksoil
// Add popup functionality
map.on('click', 'kpsoil', function (e) {
  var feature = e.features[0];
  var popupContent = `
    <h3>Soil Details</h3>
    <table>
        <tr><th>Attribute</th><th>Value</th></tr>
        <tr><td>SNUM</td><td>${feature.properties.SNUM}</td></tr>
        <tr><td>DOMSOI</td><td>${feature.properties.DOMSOI}</td></tr>
        <tr><td>SQKM</td><td>${feature.properties.SQKM}</td></tr>
    </table>
  `;
  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(popupContent)
    .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the kpsoil layer.
map.on('mouseenter', 'kpsoil', function () {
  map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'kpsoil', function () {
  map.getCanvas().style.cursor = '';
});

// Add event listener to the checkbox for dynamic surface water extent
const dyn_floodCheckbox = document.getElementById("dyn_flood");
dyn_floodCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('dyn_flood', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('dyn_flood', 'visibility', 'none');
    }
    
});
// Add event listener to the checkbox for flood 2 day layer
const flood2dCheckbox = document.getElementById("flood2d");
flood2dCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('flood2d', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('flood2d', 'visibility', 'none');
    }
    
});
// Add event listener to the checkbox for flood 3 day layer
const flood3dCheckbox = document.getElementById("flood3d");
flood3dCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('flood3d', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('flood3d', 'visibility', 'none');
    }
    
});
// Add event listener to the checkbox for Flood summary for days 1-3 layer
const floodsumm13Checkbox = document.getElementById("floodsumm13l");
floodsumm13Checkbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('floodsumm13l', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('floodsumm13l', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for KPKGeology layer
const KPKGeologyCheckbox = document.getElementById("kpgeology");
KPKGeologyCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('kpgeology', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('kpgeology', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for KPKSoil layer
const KPKSoilCheckbox = document.getElementById("kpsoil");
KPKSoilCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('kpsoil', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('kpsoil', 'visibility', 'none');
    }
    
});
// Add event listener to the checkbox for 27_jul_2010 layer
const july2010floodCheckbox = document.getElementById("27july2010");
july2010floodCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('27july2010', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('27july2010', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for 23rdAugust2012 layer
const August2012floodCheckbox = document.getElementById("23rdAugust2012");
August2012floodCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('23rdAugust2012', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('23rdAugust2012', 'visibility', 'none');
    }
    
});
// Add event listener to the checkbox for 16thSeptember2012 layer
const September2012floodCheckbox = document.getElementById("16thSeptember2012");
September2012floodCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('16thSeptember2012', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('16thSeptember2012', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for 1stAugust2013 layer
const oneAugust2013floodCheckbox = document.getElementById("1stAugust2013");
oneAugust2013floodCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('1stAugust2013', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('1stAugust2013', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for 7thAugust2013 layer
const sevenAugust2013floodCheckbox = document.getElementById("7thAugust2013");
sevenAugust2013floodCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('7thAugust2013', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('7thAugust2013', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for 1stSeptember2014 layer
const September2014floodCheckbox = document.getElementById("1stSeptember2014");
September2014floodCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('1stSeptember2014', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('1stSeptember2014', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for 15th July 2015 layer
const July2015floodCheckbox = document.getElementById("15thJuly2015");
July2015floodCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('15thJuly2015', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('15thJuly2015', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for 12th March 2016 layer
const March2016floodCheckbox = document.getElementById("12thMarch2016");
March2016floodCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('12thMarch2016', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('12thMarch2016', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for 3rd July 2018 layer
const July2018floodCheckbox = document.getElementById("3rdJuly2018");
July2018floodCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('3rdJuly2018', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('3rdJuly2018', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for KPK LULC layer
const KPKLULCCheckbox = document.getElementById("kplulc");
KPKLULCCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('kplulc', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('kplulc', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for KPK Distance from river layer
const DistanceriverCheckbox = document.getElementById("distriver");
DistanceriverCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('distriver', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('distriver', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for KPK TPI layer
const KPTPICheckbox = document.getElementById("kptpi");
KPTPICheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('kptpi', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('kptpi', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for KPK Drainage Density layer
const KPDDCheckbox = document.getElementById("kpdrainage");
KPDDCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('kpdrainage', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('kpdrainage', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for KPK Slope layer
const KPSlopeCheckbox = document.getElementById("kpslope");
KPSlopeCheckbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('kpslope', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('kpslope', 'visibility', 'none');
    }
    
});
// Toggling the NDVI info control and layer visibility
const KPNDVI2010Checkbox = document.getElementById("kpndvigeo");
KPNDVI2010Checkbox.addEventListener("change", function () {
    const isChecked = this.checked;
    if (isChecked) {
        map.setLayoutProperty('kpndvigeo', 'visibility', 'visible');
        showNDVIInfoControl();
    } else {
        map.setLayoutProperty('kpndvigeo', 'visibility', 'none');
        hideNDVIInfoControl();
    }
});
// Add mousemove event listener to update the NDVI info control
map.on('mousemove', 'kpndvigeo', (event) => {
  const features = map.queryRenderedFeatures(event.point, {
      layers: ['kpndvigeo']
  });

  if (features.length) {
      const properties = features[0].properties;
      const data = [
          properties.ndvi2010,
          properties.ndvi2015,
          properties.ndvi2020,
          properties.ndvi2023
      ];
      document.getElementById('ndvi-pd').innerHTML = `<h3>${properties.DISTRICT}</h3><p><strong><em>Temporal analysis of NDVI for KPK</strong></em></p>`;
      updateNDVIChart(data);
  } else {
      document.getElementById('ndvi-pd').innerHTML = `<p>Hover over a region to see NDVI temporal trends</p>`;
      if (ndviChart) {
          ndviChart.destroy();
          ndviChart = null;
      }
  }
});
// Toggling the info control and layer visibility
const KPpreci2010Checkbox = document.getElementById("kppreci");
KPpreci2010Checkbox.addEventListener("change", function () {
    const isChecked = this.checked;
    if (isChecked) {
        map.setLayoutProperty('kppreci', 'visibility', 'visible');
        showInfoControl();
    } else {
        map.setLayoutProperty('kppreci', 'visibility', 'none');
        hideInfoControl();
    }
});


// Add mousemove event listener to update the info control
map.on('mousemove', 'kppreci', (event) => {
    const features = map.queryRenderedFeatures(event.point, {
        layers: ['kppreci']
    });

    if (features.length) {
        const properties = features[0].properties;
        const data = [
            properties.precipitat,
            properties.precipit_1,
            properties.precipit_2,
            properties.Precipit_3
        ];
        document.getElementById('pd').innerHTML = `<h3>${properties.DISTRICT}</h3><p><strong><em> Yearly Averaged Precipitation mm/year</strong></em></p>`;
        updateChart(data);
    } else {
        document.getElementById('pd').innerHTML = `<p>Hover over a district to show temporal trend</p>`;
        if (myChart) {
            myChart.destroy();
            myChart = null;
        }
    }
});
// Add event listener to the checkbox for KPK 2015 precipitation  layer
const KPpreci2015Checkbox = document.getElementById("kppreci2");
KPpreci2015Checkbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('kppreci2', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('kppreci2', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for KPK 2020 precipitation  layer
const KPpreci2020Checkbox = document.getElementById("kppreci3");
KPpreci2020Checkbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('kppreci3', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('kppreci3', 'visibility', 'none');
    }
    
});

// Add event listener to the checkbox for KPK 2023 precipitation  layer
const KPpreci2023Checkbox = document.getElementById("kppreci4");
KPpreci2023Checkbox.addEventListener("change", function() {
    const isChecked = this.checked;
    // Toggle visibility of the layer based on checkbox status
    if (isChecked) {
        map.setLayoutProperty('kppreci4', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('kppreci4', 'visibility', 'none');
    }
    
});
//time slider for precipitation functionality 
const layers = ['kppreci', 'kppreci2', 'kppreci3', 'kppreci4'];
const years = [2010, 2015, 2020, 2023];
let currentIndex = 0;
let intervalId;
let isPlaying = false;

function playAnimation() {
    intervalId = setInterval(() => {
        map.setLayoutProperty(layers[currentIndex], 'visibility', 'visible');
        document.getElementById('year-slider').value = years[currentIndex];
        currentIndex++;
        if (currentIndex >= layers.length) {
            currentIndex = 0;
        }
        map.setLayoutProperty(layers[currentIndex], 'visibility', 'none');
    }, 2000); // Adjust the interval as needed (in milliseconds)
}

function pauseAnimation() {
    clearInterval(intervalId);
}

document.getElementById('play-button').addEventListener('click', () => {
    if (!isPlaying) {
        playAnimation();
        isPlaying = true;
        document.getElementById('play-button').innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        pauseAnimation();
        isPlaying = false;
        document.getElementById('play-button').innerHTML = '<i class="fas fa-play"></i>';
    }
});

document.getElementById('year-slider').addEventListener('input', (event) => {
    const year = parseInt(event.target.value);
    const index = years.indexOf(year);
    if (index !== -1) {
        currentIndex = index;
        map.setLayoutProperty(layers[currentIndex], 'visibility', 'visible');
        pauseAnimation();
        isPlaying = false;
        document.getElementById('play-button').innerHTML = '<i class="fas fa-play"></i>';
    }
});
document.getElementById('remove-button').addEventListener('click', () => {
  pauseAnimation();
  isPlaying = false;
  document.getElementById('play-button').innerHTML = '<i class="fas fa-play"></i>';
  layers.forEach(layer => {
      map.setLayoutProperty(layer, 'visibility', 'none');
  });
});
/*
function createAndAddMarker(feature) {
  const coordinates = feature.geometry.coordinates.slice();
  const properties = feature.properties;

  const el = document.createElement('div');
  const width = 10; // Adjust as needed
  const height = 10; // Adjust as needed
  el.className = 'marker';
  el.style.backgroundImage = `url(images/dam-icon.png)`;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.backgroundSize = '100%';

  el.addEventListener('click', () => {
      window.alert(properties.message || "No message provided");
  });

  // Add marker to the map
  new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(map);
}

// Add vector tile source and layer
map.on('load', function() {
  map.addSource("imp_thsils", {
      type: "vector",
      scheme: "tms",
      tiles: [
          `http://172.18.1.39:8080/geoserver/gwc/service/tms/1.0.0/KPSyndicate:dams@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
  });

  map.addLayer({
      id: 'imp_thsils',
      type: 'symbol',
      source: 'imp_thsils',
      "source-layer": 'dams',
      layout: { 
          'icon-image': 'custom-marker', // Assuming you have a custom marker icon
          'visibility': 'visible',
          'icon-allow-overlap': true
      }
  });

  // Fetch features from the source and add markers
  map.on('data', function(e) {
      if (e.sourceId === 'imp_thsils' && e.isSourceLoaded) {
          const features = map.querySourceFeatures('imp_thsils', {
              sourceLayer: 'dams'
          });

          features.forEach(feature => {
              createAndAddMarker(feature);
          });
      }
  });

  // Change the cursor to a pointer when the mouse is over the 'imp_thsils' layer
  map.on('mouseenter', 'imp_thsils', function() {
      map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to default when it leaves
  map.on('mouseleave', 'imp_thsils', function() {
      map.getCanvas().style.cursor = '';
  });
});
*/
 