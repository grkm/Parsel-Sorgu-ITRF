// Harita oluştur
var harita = L.map('harita', {
    maxZoom: 30,
    maxNativeZoom: 30
}).setView([41.3000, 36.2000], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(harita);

var geojsonLayer = L.geoJSON().addTo(harita);
var markerLayer = L.layerGroup().addTo(harita);
var cornerLayer = L.layerGroup().addTo(harita);

var fileInput = document.getElementById('geojsonFileInput');
var ozellikListesi = document.getElementById('ozellikListesi');
var koordinatListesi = document.getElementById('koordinatListesi');
fileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var geojsonData = JSON.parse(e.target.result);
        ozellikListesi.innerHTML = '';
        koordinatListesi.innerHTML = '';
        geojsonLayer.clearLayers().addData(geojsonData);
        markerLayer.clearLayers();
        cornerLayer.clearLayers();

        var geojson = L.geoJSON(geojsonData);

        var bounds = geojson.getBounds();

        harita.fitBounds(bounds);

        // JSON verilerini içeren katmanın özelliklerine erişin
        var ozellikler = geojsonData.features[0].properties;

        // Özellikleri belirli bir sıralama düzeninde göstermek için bir sıralama listesi oluşturun
        var siralama = ['Il', 'Ilce', 'Mahalle', 'Mevkii', 'Ada', 'ParselNo', 'Nitelik', 'Alan', 'Pafta'];

        // Sıralama düzenine göre özellikleri listeleyin
        for (var i = 0; i < siralama.length; i++) {
            var ozellik = siralama[i];
            if (ozellikler.hasOwnProperty(ozellik)) {
                var li = document.createElement('li'); // Her özellik için bir liste öğesi oluşturun
                li.textContent = ozellik + ': ' + ozellikler[ozellik]; // Özellik adını ve değerini liste öğesine ekleyin
                ozellikListesi.appendChild(li); // Liste öğesini ul elementine ekleyin
            }
        }

        var kapaliAlanKoseNoktalari = geojsonData.features[0].geometry.coordinates[0];
        var domDilimSecimi = "EPSG:5256";
        domDilimSecimi = document.getElementById('dilimSecimi').value;
        proj4.defs("EPSG:5256","+proj=tmerc +lat_0=0 +lon_0=36 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

        if(domDilimSecimi=="EPSG:5253"){proj4.defs("EPSG:5253","+proj=tmerc +lat_0=0 +lon_0=27 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");}
        else if(domDilimSecimi=="EPSG:5254"){proj4.defs("EPSG:5254","+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");}
        else if(domDilimSecimi=="EPSG:5255"){proj4.defs("EPSG:5254","+proj=tmerc +lat_0=0 +lon_0=33 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");}
        else if(domDilimSecimi=="EPSG:5256"){proj4.defs("EPSG:5254","+proj=tmerc +lat_0=0 +lon_0=34 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");}
        else if(domDilimSecimi=="EPSG:5257"){proj4.defs("EPSG:5254","+proj=tmerc +lat_0=0 +lon_0=39 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");}
        else if(domDilimSecimi=="EPSG:5258"){proj4.defs("EPSG:5254","+proj=tmerc +lat_0=0 +lon_0=42 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");}
        else if(domDilimSecimi=="EPSG:5259"){proj4.defs("EPSG:5254","+proj=tmerc +lat_0=0 +lon_0=45 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");}
        
        // Köşe noktalarını HTML listesine ekleyin
        for (var i = 0; i < kapaliAlanKoseNoktalari.length-1; i++) {
            var nokta = kapaliAlanKoseNoktalari[i];
            var noktaITRF = proj4("EPSG:4326", domDilimSecimi, nokta);
            var li = document.createElement('li'); // Her köşe noktası için bir liste öğesi oluşturun
            li.textContent = (i + 1) + ' ' + noktaITRF[0].toFixed(2) + ' ' + noktaITRF[1].toFixed(2); // Köşe noktasının koordinatlarını listeleyin
            koordinatListesi.appendChild(li); // Liste öğesini ul elementine ekleyin
        }

		for (var i = 0; i < kapaliAlanKoseNoktalari.length; i++) {
			var nokta = kapaliAlanKoseNoktalari[i];
			L.circleMarker([nokta[1], nokta[0]], {
				radius: 2,
				color: 'blue',
				fillColor: 'blue',
				fillOpacity: 1
			}).addTo(markerLayer);
		}

        var hatUzunluklari = [];
        for (var i = 0; i < kapaliAlanKoseNoktalari.length - 1; i++) {
            var nokta1 = turf.point(kapaliAlanKoseNoktalari[i]);
            var nokta2 = turf.point(kapaliAlanKoseNoktalari[i + 1]);
            var hatUzunluguMetre = turf.distance(nokta1, nokta2, { units: 'meters' });
            hatUzunluklari.push(hatUzunluguMetre);
        }

        for (var i = 0; i < hatUzunluklari.length; i++) {
            var hatUzunluguMetre = hatUzunluklari[i];
            var hatMerkez = L.latLng(
                (kapaliAlanKoseNoktalari[i][1] + kapaliAlanKoseNoktalari[i + 1][1]) / 2,
                (kapaliAlanKoseNoktalari[i][0] + kapaliAlanKoseNoktalari[i + 1][0]) / 2
            );

            L.marker(hatMerkez, {
                icon: L.divIcon({
                    className: 'hat-uzunlugu',
                    html: hatUzunluguMetre.toFixed(2)
                })
            }).addTo(cornerLayer);
        }
    };
    reader.readAsText(file);
});