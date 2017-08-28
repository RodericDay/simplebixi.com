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
        + `<text font-family="Verdana" font-size="12" text-anchor="middle" `
        + `x="${xi}" y="${yi}" dominant-baseline="mathematical">${full}</text></svg>`
}
function arrow(angle) {
    var [w, h, r] = [markerSize, markerSize, 3/10 * markerSize];
    return `<svg height="${h}" viewbox="${-w/2} ${-h/2} ${w} ${h}">`
        + `<path fill="cornflowerblue" d="M ${[0,-r]} L ${[r/2,r]} L ${[0,3/4*r]} L ${[-r/2,+r]} z" transform="rotate(${angle})"/></svg>`
}
function loadXml(event) {
    var xml = xhr.responseXML;
    var stations = xml.childNodes[0];
    var lastUpdate = +new Date() - +new Date(+stations.attributes['LastUpdate'].value);
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
    document.getElementById("lastUpdate").innerHTML = `${lastUpdate/1000/60/60|0} min. ago`;
}
function onLocationFound(e) {
    if(bounds.contains(e.latlng)) {
        inner.setLatLng(e.latlng);
        outer.setLatLng(e.latlng);
        outer.setRadius(e.accuracy / 2);
    }
    else {
        setTimeout(()=>{map.fitBounds(bounds, {animate: false})}, 1000);
    }
}
function onLocationError(e) {
    if(!e.message.includes('denied')) {
        alert(e.message);
    }
    map.setZoom(16);
    map.panTo(new L.LatLng(45.514530838669, -73.568471074104));
}
var markerSize = 50;
var map = L.map('map', {minZoom: 12, maxZoom: 16});
var outer = L.circle([0, 0], 1);
var inner = L.circle([0, 0], 1);
inner.addTo(map);
outer.addTo(map);
var southWest = new L.LatLng(45.33443, -73.770771);
var northEast = new L.LatLng(45.67713, -73.393524);
var bounds = new L.LatLngBounds(southWest, northEast);
map.fitBounds(bounds, {animate: false});
map.setMaxBounds(bounds);
var tileServerUrl = '/tiles/{z}/{x}/{y}.png';
L.tileLayer(tileServerUrl, {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
map.locate({setView: true, maxZoom: 16});
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

var xhr = new XMLHttpRequest();
xhr.open('GET', 'latest.xml');
xhr.onload = loadXml;
xhr.send();
