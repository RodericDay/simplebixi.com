function pie(full, empty) {
    var [w, h, r] = [markerSize, markerSize, 3/10 * markerSize];
    var [xi, yi] = [w/2, h/2];
    var f = (full) / (full+empty);
    var d = f > 0.5 ? 1 : 0;
    var t = 2 * Math.PI * f;
    var xf = xi - r * Math.sin(t) + 0.0001;
    var yf = yi - r * Math.cos(t);
    return `<svg xmlns="http://www.w3.org/2000/svg" height="${h}" viewbox="0 0 ${w} ${h}">`
        + `<circle fill="lightgray" cx="${xi}" cy="${yi}" r="${r}"/>`
        + `<path fill="red" d="M ${[xi,yi]} v ${-r} A ${[r,r,0,d,0,xf,yf]} z" />`
        + `<circle stroke="black" fill="transparent" cx="${xi}" cy="${yi}" r="${r}"/>`
        + `<text fill="black" text-anchor="middle" x="${xi}" y="${(yi+h/10)}">${full}</text></svg>`
}
function arrow(angle) {
    var [w, h, r] = [markerSize, markerSize, 3/10 * markerSize];
    return `<svg height="${h}" viewbox="${-w/2} ${-h/2} ${w} ${h}">`
        + `<path fill="cornflowerblue" d="M ${[0,-r]} L ${[r/2,r]} L ${[0,3/4*r]} L ${[-r/2,+r]} z" transform="rotate(${angle})"/></svg>`
}
function loadXml(event) {
    var xml = xhr.responseXML;
    var stations = xml.childNodes[0];
    var dt = +new Date() - +new Date(+stations.attributes['LastUpdate'].value);
    var stationsJ = Array.from(stations.childNodes).map((station)=>{
        var json:any = {};
        for(var child of Array.from(station.childNodes)) {
            json[child['tagName']] = +child.textContent || child.textContent;
        }
        return json
    });
    stationsJ.forEach((j)=>{
        var imgDataUrl = `data:image/svg+xml;utf8,${pie(j.nbBikes, j.nbEmptyDocks)}`;
        var icon = L.icon({
            iconUrl: imgDataUrl,
            iconSize: [markerSize, markerSize],
        });
        L.marker(<any>{lat:j.lat, lon:j.long}, {icon: icon}).addTo(map)
    });
}
function onLocationFound(e) {
    var radius = e.accuracy / 2;
    L.circle(e.latlng, 1).addTo(map);
    L.circle(e.latlng, radius).addTo(map);
}
function onLocationError(e) {
    if(!e.message.includes('denied')) {
        alert(e.message);
    }
    map.setZoom(16);
    map.panTo(new L.LatLng(45.514530838669, -73.568471074104));
}
// ondeviceorientation = (e) => {
//     var c = e.webkitCompassHeading||0;
//     document.body.innerHTML = arrow(50, c);
// };
var markerSize = 50;
var map = L.map('map');
map.options.minZoom = 12;
map.options.maxZoom = 16;
var tileServerUrl = '/tiles/{z}/{x}/{y}.png';
L.tileLayer(tileServerUrl).addTo(map);
map.locate({setView: true, maxZoom: 16});
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

var xhr = new XMLHttpRequest();
xhr.open('GET', 'latest.xml');
xhr.onload = loadXml;
xhr.send();