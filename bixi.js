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
    return s.distance > 25 ? 'v.far' : `
    <svg height="${h}" viewbox="0 0 ${w} ${h}">
    <path fill="cornflowerblue"
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
    var dx = s.lat - lat;
    var dy = s.long - long;
    s.distance = Math.pow(10, 6) * (dx*dx + dy*dy) / 3.5;
    s.angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return s
}

function compareDistance(s1, s2) {
    return s2.distance - s1.distance
}

function createRow(s) {
    var row = table.insertRow(0);
    var clean = s.name.replace(/(\(.*\))/, '').replace(/ - .+/, '').replace(/\s*\/\s*/, ' /<br/>')
    row.insertCell().innerHTML = `<a href="http://maps.${localStorage.service}.com/?q=${[s.lat,s.long]}" style="text-decoration: none;">🌎</a>`;
    row.insertCell().innerHTML = `<a href="http://maps.${localStorage.service}.com/?q=${[s.lat,s.long]}">${clean}</a>`;
    row.insertCell().innerHTML = arrow(s);
    row.insertCell().innerHTML = circle(s.bikes, s.empty);

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

    navigator.geolocation.getCurrentPosition(chain);
}

function chain(data) {
    position = data;
    lat = position.coords.latitude;
    long = position.coords.longitude;
    updateUi();
}

function changeService(event) {
    localStorage.service = event.target.value;
    updateUi();
}

function createSelect() {
    var options = ["apple", "google"];
    if(!options.includes(localStorage.service)) {
        localStorage.service = options[0]
    }

    div = document.createElement("span")
    div.innerHTML = "Map service:"
    for(var name of options) {
        var button = document.createElement("button");
        button.value = name;
        button.disabled = name === localStorage.service;
        button.textContent = name;
        button.onclick = changeService;
        div.appendChild(button);
    }
    return div
}

function updateUi() {
    container.innerHTML = '';

    select = createSelect();
    table = document.createElement("table");

    stations.map(calculateExtraProperties)
            .sort(compareDistance)
            .map(createRow);

    header = table.insertRow(0);
    header.insertCell();
    header.insertCell();
    header.insertCell();
    header.insertCell().innerHTML = "🚲";
    header.innerHTML = header.innerHTML.replace(/td/g, 'th');

    container.appendChild(select);
    container.appendChild(table);
}

var lat, long;
var stations = [];
var position = null;

var xhr = new XMLHttpRequest();
xhr.open('GET', 'latest.xml');
xhr.onload = load;
xhr.send();

timestamp = document.getElementById("timestamp");
container = document.getElementById("container");
