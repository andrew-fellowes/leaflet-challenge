// Creating the map object
let myMap = L.map("map", {
    center: [37.742828, -25.680588],
    zoom: 2
})

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap)

// Use this link to get the GeoJSON data
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"

// Get the GeoJSON data
d3.json(link).then(function (data) {

    // Style the marker including calculating color and radius
    function markerStyle(feature) {
        return {
            opacity: 1,
            fillOpacity: 0.8,
            // Call the markerColor() function to adjust the color based on depth
            fillColor: markerColor(feature.geometry.coordinates[2]),
            color: "#000000",
            //Call the markerSize() function to adjust the size based on magnitude
            radius: markerSize(feature.properties.mag),
            stroke: true,
            weight: 0.5
        }
    }

    // Scale the marker size so that each earthquake has a radius based on its magnitude
    function markerSize(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return (magnitude ** 3) / 10
    }

    // Color the marker so that each earthquake has a color based on its depth
    function markerColor(depth) {
        if (depth < 11) return "#e8d39e"
        else if (depth < 21) return "#ecb773"
        else if (depth < 41) return "#e07b39"
        else if (depth < 81) return "#e35628"
        else if (depth < 161) return "#80391e"
        else return "#311b09"
    }

    // Convert unix timestamp to human readable date-time
    function convertTimestamp(Timestamp) {

        // Create a new date object using the unix timestamp
        const dateObject = new Date(Timestamp)

        // Extract individual components of the date
        const day = dateObject.getDate()
        const month = dateObject.getMonth() + 1 // Jan is month 0 so add 1
        const year = dateObject.getFullYear()
        const hours = String(dateObject.getHours()).padStart(2, '0')
        const minutes = String(dateObject.getMinutes()).padStart(2, '0')
        const seconds = String(dateObject.getSeconds()).padStart(2, '0')

        // Format the date and time
        const formattedDate = `${day}/${month}/${year}`
        const formattedTime = `${hours}:${minutes}:${seconds}`

        // Combine the date and time components
        const formattedDateTime = `${formattedDate} ${formattedTime}`

        return formattedDateTime
    }

    // Create legend
    function displayLegend() {
        let legendInfo = [{
            depth: '&#8804;10km', color: "#e8d39e"
        }, {
            depth: '&#8804;20km', color: "#ecb773"
        }, {
            depth: '&#8804;40km', color: "#e07b39"
        }, {
            depth: '&#8804;80km', color: "#e35628"
        }, {
            depth: '&#8804;160km', color: "#80391e"
        }, {
            depth: '>160km', color: "#311b09"
        }]
        let header = "<h3>Depth</h3><hr>"
        let strng = ""
        for (i = 0; i < legendInfo.length; i++) {
            strng += "<li style = \"background-color: " + legendInfo[i].color + "\">" + legendInfo[i].depth + "</li> ";
        }
        return header + strng;
    }

    // Create a GeoJSON layer with the retrieved data
    L.geoJson(data, {
        // Style each marker as a circle
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng)
        },

        // with style defined by markerStyle() function
        style: markerStyle,

        // Create a popup for each marker to display info about the earthquake 
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                feature.properties.title
                + "<br>Depth: "
                + feature.geometry.coordinates[2]
                + "km"
                + "<br>Date/Time: "
                + convertTimestamp(feature.properties.time)
            )
        }
    }).addTo(myMap)

    let info = L.control({
        position: "bottomright"
    })
    info.onAdd = function () {
        let div = L.DomUtil.create("div", "legend")
        return div
    }
    info.addTo(myMap)
    document.querySelector(".legend").innerHTML=displayLegend();

})
