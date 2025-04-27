// Initialize map
const map = L.map('map').setView([10.8231, 106.6297], 13); // HCM city default
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;
map.on('click', function (e) {
    const { lat, lng } = e.latlng;
    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);

    if (marker) {
        marker.setLatLng(e.latlng);
    } else {
        marker = L.marker(e.latlng).addTo(map);
    }
});

// Submit form
document.getElementById('restaurant-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);

    const token = localStorage.getItem("access_token");  // Or replace with your real token

    const res = await fetch("http://localhost:8001/restaurants", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, latitude, longitude })
    });

    const status = document.getElementById('status');
    if (res.ok) {
        status.innerHTML = `<div class="alert alert-success">Restaurant created!</div>`;
        document.getElementById('restaurant-form').reset();
        if (marker) map.removeLayer(marker);
    } else {
        const error = await res.json();
        status.innerHTML = `<div class="alert alert-danger">Error: ${error.detail}</div>`;
    }
});