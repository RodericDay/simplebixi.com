function array(xml, tagName, fn) {
    var nodes = xml.getElementsByTagName(tagName);
    var arr = Array.prototype.slice.apply(nodes);
    var values = arr.map(function(node){return fn(node.textContent)});
    return values
}

function circle(full, empty) {
    var [w, h, r] = [50, 50, 15];
    var [xi, yi] = [w/2, h/2];
    var f = (full) / (full+empty);
    var d = f > 0.5 ? 1 : 0;
    var t = 2 * Math.PI * f;
    var xf = xi - r * Math.sin(t) + 0.0001;
    var yf = yi - r * Math.cos(t);

    return  `
    <svg height="${h}" viewbox="0 0 ${w} ${h}">
    <path fill="red"
          d="M ${[xi,yi]} v ${-r} A ${[r,r,0,d,0,xf,yf]} z"
          style="opacity: 0.5"/>
    <text fill="black" text-anchor="middle" x="${xi}" y="${(yi+h/10)}">
    ${full}
    </text>
    </svg>
    `;
}

function arrow(s) {
    var [w, h, r] = [50, 50, 15];
    var [xi, yi] = [w/2, h/2];
    return s.distance > 100 ? 'v.far' : `
    <svg height="${h}" viewbox="0 0 ${w} ${h}">
    <path fill="red"
          d="M ${[xi,yi-r]} L ${[xi+r/2,yi+r]} L ${[xi, yi+3/4*r]} L ${[xi-r/2,yi+r]} z"
          transform="rotate(${s.angle} ${xi} ${yi})"
          style="opacity: 0.5"
    "/>
    <text fill="black" text-anchor="middle" x="${xi}" y="${(yi+h/10)}">
    ${s.distance.toFixed(1)}
    </text>
    </svg>
    `
}

function calculateExtraProperties(s) {
    var dx = lat - s.lat;
    var dy = long - s.long;
    s.distance = Math.pow(10, 6) * (dx*dx + dy*dy);
    s.angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return s
}

function compareDistance(s1, s2) {
    return s2.distance - s1.distance
}

function createRow(s) {
    var row = table.insertRow(0);
    row.insertCell().innerHTML = s.name.replace(/(\(.*\))/, '')
                .replace(/ - .+/, '')
                .replace(/\s*\/\s*/, ' /<br/>');
    row.insertCell().innerHTML = '<a style="text-decoration: none" href="http://maps.apple.com/?q='+ s.lat+','+s.long+'">🍎</a>';
    row.insertCell().innerHTML = arrow(s);
    row.insertCell().innerHTML = circle(s.bikes, s.empty);
    row.insertCell().innerHTML = '<a style="text-decoration: none" href="http://maps.google.com/?q='+ s.lat+','+s.long+'">👁</a>';

}

function load(event) {
    var xml = xhr.responseXML;
    var d = new Date() - new Date(+xml.firstChild.attributes.LastUpdate.value);
    timestamp.textContent = parseInt(d/(60*1000)) + " minute(s) ago";

    // there needs to be a better way
    var A = array(xml, "lat", parseFloat);
    var B = array(xml, "long", parseFloat);
    var C = array(xml, "nbBikes", parseInt);
    var D = array(xml, "nbEmptyDocks", parseInt);
    var E = array(xml, "name", function(a){return a});
    for (var i=0; i<A.length; i++) {
        stations.push(
            {
                lat: A[i],
                long: B[i],
                bikes: C[i],
                empty: D[i],
                name: E[i],
            }
        );
    }

    navigator.geolocation.getCurrentPosition(update);
}

function update(position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;
    table = document.createElement("table");
    stations.map(calculateExtraProperties)
            .sort(compareDistance)
            .map(createRow);
    container.appendChild(table);
}

var lat, long;
var stations = [];

var xhr = new XMLHttpRequest();
xhr.open('GET', 'latest.xml');
xhr.onload = load;
xhr.send();

timestamp = document.getElementById("timestamp");
container = document.getElementById("container");
