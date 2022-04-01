// We create the tile layer that will be the background of our map.
console.log("Step 1");

// Create map 
var map = L.map('map').setView([40.7, -94.5],3);

var graymap = L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  }
);

graymap.addTo(map);

// Retrieve data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

  // This function returns the style for each data point plotted
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the magnitude of the earthquake.
  function getColor(depth) {
    switch (true) {
    case depth > 90:
      return "#ff0000";
    case depth > 70:
      return "#ff6600";
    case depth > 50:
      return "#ff9966";
    case depth > 30:
      return "#ffcc99";
    case depth > 10:
      return "#ffffcc";
    default:
      return "#ccffcc";
    }
  }

  // This function determines the radius of the marker for the earthquake 
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // Add GeoJSON layer to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    
    style: styleInfo,
    
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        "Magnitude: "
          + feature.properties.mag
          + "<br>Depth: "
          + feature.geometry.coordinates[2]
          + "<br>Location: "
          + feature.properties.place
      );
    }
  }).addTo(map);

  // Here we create a legend control object.
  var legend = L.control({
    position: "topright"
  });

  // Then add all the details for the legend
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [-10, 10, 30, 50, 70, 90];
    var colors = [
      "#ccffcc",
      "#ffffcc",
      "#ffcc99",
      "#ff9966",
      "#ff6600",
      "#ff0000"
    ];

    // Looping through our intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " 
      + colors[i] 
      + "'></i> "
      + grades[i] 
      + (grades[i + 1] ? "&ndash;" 
      + grades[i + 1] 
      + "<br>" : "+");
    }
    return div;
  };

  // Add legend to map
  legend.addTo(map);
});
