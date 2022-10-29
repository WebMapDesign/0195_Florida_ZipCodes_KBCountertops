let arrayIds = [];
let arrayZipcodes = [];
let arrayAreas = [];
let arrayCities = [];
let arrayServiced = [];

for (let i = 0; i < geojsonZipcodes["features"].length; i++) {
  arrayIds.push(geojsonZipcodes["features"][i]["properties"]["ID"]);
  arrayZipcodes.push(geojsonZipcodes["features"][i]["properties"]["ZCTA5CE20"]);
  arrayAreas.push(geojsonZipcodes["features"][i]["properties"]["STORE"]);
  arrayCities.push(geojsonZipcodes["features"][i]["properties"]["CITY"]);
  arrayServiced.push(geojsonZipcodes["features"][i]["properties"]["SERVICED"]);
}

let divNewTable = document.getElementById("table-data");
document.getElementById("table-data").style.height = "auto";
const tableHeaders = ["ZIP CODE", "STORE", "CITY"];

let tableZipcodes = document.createElement("table");
tableZipcodes.id = "table-zipcodes";
let tr = tableZipcodes.insertRow(-1);

for (let i = 0; i < tableHeaders.length; i++) {
  let th = document.createElement("th");
  tr.appendChild(th);
  th.outerHTML =
    "<th onclick=" + "sortTable(" + i + ")>" + tableHeaders[i] + "</th>";
}

let maxSize = Math.max(
  arrayIds.length,
  arrayZipcodes.length,
  arrayAreas.length,
  arrayCities.length
);

for (let i = 0; i < maxSize; i++) {
  tr = tableZipcodes.insertRow(-1);
  tr.id = arrayZipcodes[i];
  let cell1 = tr.insertCell(-1);
  cell1.innerHTML = arrayZipcodes[i];
  let cell2 = tr.insertCell(-1);
  cell2.innerHTML = arrayAreas[i];
  let cell3 = tr.insertCell(-1);
  cell3.innerHTML = arrayCities[i];
}

divNewTable.innerHTML = "";
divNewTable.appendChild(tableZipcodes);

let sortOrder = true;

// sort table numerically
function sortTable(n) {
  let tableZipcodes = document.getElementById("table-zipcodes");
  let switchcount = 0;
  let switching = true;
  // let dir = "asc";
  let shouldSwitch = true;
  let i;

  while (switching) {
    switching = false;
    let rows = tableZipcodes.rows;

    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      let x = rows[i].getElementsByTagName("TD")[n];
      let y = rows[i + 1].getElementsByTagName("TD")[n];
      if (sortOrder == true) {
        if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {
          shouldSwitch = true;
          break;
        }
      } else if (sortOrder == false) {
        if (parseFloat(x.innerHTML) < parseFloat(y.innerHTML)) {
          shouldSwitch = true;
          break;
        }
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
      if (switchcount == 0 && sortOrder == true) {
        sortOrder = false;
        switching = true;
      }
    }
  }
}

let selectedTable = document.getElementById("table-zipcodes");
let tableBody = selectedTable.getElementsByTagName("tbody")[0];
let allTableRows = tableBody.getElementsByTagName("tr");

// ---------------LEAFLET MAP ---------------
// function to decide fit the map content when the window is resized
// the zoom level is changed depending on the size of the map <div>
function mapZoom(x) {
  let zoomLevel = 9.5;

  // if (x < 500) {
  //   zoomLevel = 10;
  // } else if (x < 750) {
  //   zoomLevel = 10.3;
  // } else if (x < 1200) {
  //   zoomLevel = 10.5;
  // } else if (x < 1500) {
  //   zoomLevel = 10.7;
  // } else {
  //   zoomLevel = 8;
  // }

  return zoomLevel;
}

// determine the map size that dictates the zoom level
let widthMap = document.getElementById("map").clientWidth;
let heightMap = document.getElementById("map").clientHeight;
let sizeMap = Math.min(widthMap, heightMap);

// decide which map zoom to use when map is initiated
let startZoom = mapZoom(sizeMap);

// initiate the map
let map = L.map("map", {
  fullScreenControl: true,
  zoomSnap: 0.5,
  dragging: true,
  maxBounds: [
    [30.0, -85.0],
    [25.0, -80.0],
  ],
}).setView([28.0, -82.3], startZoom);

map.fitBounds([
  [28.8, -82.9],
  [27.1, -81.6],
]);

let osm = new L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors </a>',
  }
).addTo(map);

L.control
  .scale({ metric: false, imperial: true, position: "bottomright" })
  .addTo(map);

const fsControl = L.control.fullscreen();
map.addControl(fsControl);

let defaultView = { lat: 28.0, lng: -82.3, zoom: 9.5 };
L.easyButton(
  '<span class="star" style="padding:0px;">&starf;</span>',
  function (btn, map) {
    map.setView([defaultView.lat, defaultView.lng], defaultView.zoom);
  },
  "Default View"
).addTo(map);

let popupStyle = {
  closeButton: true,
};

function colorArea(a) {
  return a === "Tampa (Adamo)"
    ? "#c3ecb2"
    : a === "Tampa (Hillsborough)"
    ? "#aadaff"
    : a === "Largo"
    ? "#eb9dad"
    : "#ffffff";
}

function createClassName(a) {
  return "zip" + a;
}

// color zipcodes by area
function styleStores(feature) {
  return {
    color: "#000000",
    fillColor: colorArea(feature.properties.STORE),
    fillOpacity: 0.5,
    opacity: 1,
    weight: 0.5,
    className: createClassName(feature.properties.ZCTA5CE20),
  };
}

// initial color of zip codes
function styleSimple(feature) {
  return {
    color: "#000000",
    fillColor: "#c59d34",
    fillOpacity: 0.5,
    opacity: 1,
    weight: 0.5,
    className: createClassName(feature.properties.ZCTA5CE20),
  };
}

var styleSearch = {
  fillColor: "#ffffff",
  fillOpacity: 0,
  color: "#000000",
  weight: 2,
  opacity: 0,
};

function highlightFeatureSimple(e) {
  var layer = e.target;

  layer.setStyle({
    color: "#000000",
    fillColor: "#c59d34",
    fillOpacity: 1,
    opacity: 1,
    weight: 1,
  });

  tableRow = document.getElementById(e.target.feature.properties.ZCTA5CE20);
  tableRow.className = "highlighted-row";
}

function highlightFeatureStore(e) {
  var layer = e.target;

  layer.setStyle({
    color: "#000000",
    fillColor: "#8f8f8f",
    fillOpacity: 1,
    opacity: 1,
    weight: 1,
  });

  tableRow = document.getElementById(e.target.feature.properties.ZCTA5CE20);
  tableRow.className = "highlighted-row";
}

let dataSearch = geojsonZipcodes;

let featuresLayer = new L.GeoJSON(dataSearch, {
  style: styleSearch,
  onEachFeature: function (feature, marker) {
    marker.bindPopup(
      '<p class="popup-title">Zip Code: ' +
        feature.properties.ZCTA5CE20 +
        "</p>" +
        '<p class="popup-text">Store: ' +
        feature.properties.STORE +
        "</p>" +
        '<p class="popup-text">City: ' +
        feature.properties.CITY +
        "</p>" +
        '<p class="popup-text">Coverage: ' +
        feature.properties.SERVICED +
        "</p>"
    );
  },
});

var searchZipCode = new L.Control.Search({
  layer: featuresLayer,
  propertyName: "ZCTA5CE20",
  marker: false,
  collapsed: false,
  position: "bottomleft",
  moveToLocation: function (latlng, title, map) {
    let zoom = map.getBoundsZoom(latlng.layer.getBounds());
    map.setView(latlng, zoom);
  },
});

searchZipCode
  .on("search:locationfound", function (e) {
    e.layer.setStyle({
      fillColor: "#ffffff",
      fillOpacity: 0,
      weight: 3,
      color: "#000000",
    });
    if (e.layer._popup) e.layer.openPopup();
  })
  .on("search:collapsed", function (e) {
    featuresLayer.eachLayer(function (layer) {
      featuresLayer.resetStyle(layer);
    });
  });

map.addControl(searchZipCode);

let layerStores;
let layerSimple;

function resetHighlightStores(e) {
  layerStores.resetStyle(e.target);
  tableRow.className = "";
}

function resetHighlight(e) {
  layerSimple.resetStyle(e.target);
  tableRow.className = "";
}

function onEachFeatureStores(feature, layer) {
  let popupContent =
    '<p class="popup-title">Zip Code: ' +
    feature.properties.ZCTA5CE20 +
    "</p>" +
    '<p class="popup-text">Store: ' +
    feature.properties.STORE +
    "</p>" +
    '<p class="popup-text">City: ' +
    feature.properties.CITY +
    "</p>" +
    '<p class="popup-text">Coverage: ' +
    feature.properties.SERVICED +
    "</p>";

  layer.bindPopup(popupContent, popupStyle);
  layer.on({
    mouseover: highlightFeatureStore,
    mouseout: resetHighlightStores,
  });
}

function onEachFeatureSimple(feature, layer) {
  let popupContent =
    '<p class="popup-title">' +
    feature.properties.ZCTA5CE20 +
    "</p>" +
    '<p class="popup-text">Store: ' +
    feature.properties.STORE +
    "</p>" +
    '<p class="popup-text">City: ' +
    feature.properties.CITY +
    "</p>" +
    '<p class="popup-text">Coverage: ' +
    feature.properties.SERVICED +
    "</p>";

  layer.bindPopup(popupContent, popupStyle);
  layer.on({
    mouseover: highlightFeatureSimple,
    mouseout: resetHighlight,
  });
}

layerStores = L.geoJSON(geojsonZipcodes, {
  style: styleStores,
  onEachFeature: onEachFeatureStores,
});

layerSimple = L.geoJSON(geojsonZipcodes, {
  style: styleSimple,
  onEachFeature: onEachFeatureSimple,
}).addTo(map);

var baseLayers = {
  "Zip Codes": layerSimple,
  "Zip Codes by Store": layerStores,
};

var overlays = {
  "Open Street Map": osm,
};

L.control
  .layers(baseLayers, overlays, { collapsed: false, position: "bottomleft" })
  .addTo(map);

let legendStores = L.control({ position: "bottomleft" });

legendStores.onAdd = function (map) {
  let div = L.DomUtil.create("div", "info legend legend-stores");

  div.innerHTML =
    '<i style="background:' +
    "#c3ecb2" +
    '"></i> ' +
    "Tampa (Adamo)" +
    "<br>" +
    '<i style="background:' +
    "#aadaff" +
    '"></i> ' +
    "Tampa (Hillsborough)" +
    "<br>" +
    '<i style="background:' +
    "#eb9dad" +
    '"></i> ' +
    "Largo" +
    "<br>";

  return div;
};

map.on("baselayerchange", function (eventLayer) {
  if (eventLayer.name === "Zip Codes by Store") {
    legendStores.addTo(this);
  } else {
    this.removeControl(legendStores);
  }
});

window.addEventListener("resize", function (event) {
  map.fitBounds([
    [28.8, -82.9],
    [27.1, -81.6],
  ]);
});

let zipcodeId; // zipcode id retrieved from table
let pathClasses = [];
let highlZipcode;

for (let i = 1; i < arrayZipcodes.length; i++) {
  let pathClass = "zip" + i;
  pathClasses.push(pathClass);
}

for (let i = 1; i < allTableRows.length; i++) {
  allTableRows[i].addEventListener("mouseover", function () {
    highlZipcode = document.getElementsByClassName(
      `zip${allTableRows[i].id}`
    )[0];
    highlZipcode.style.fillOpacity = 1;
  });

  allTableRows[i].addEventListener("mouseout", function () {
    highlZipcode.style.fillOpacity = 0.5;
  });
}

const logo1 = L.control({ position: "topright" });
logo1.onAdd = function (map) {
  let div = L.DomUtil.create("div", "map-logo");
  div.innerHTML = "<img src='./images/logo_dark.png' width='300'/>";
  return div;
};

logo1.addTo(map);
