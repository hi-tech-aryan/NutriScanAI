// Google Maps integration for displaying hunger relief centers
let map;

function initMap() {
    // Initialize the map centered at a default location
    const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York City
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultLocation,
    });

    // Add a marker for the default location
    new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: 'Default Location',
    });

    // Load nearby hunger relief centers (mock data for now)
    loadNearbyCenters(defaultLocation);
}

function loadNearbyCenters(location) {
    // This function would typically fetch data from an API
    const centers = [
        { name: 'Community Food Share', lat: 40.7128, lng: -74.0060 },
        { name: 'Hope Kitchen', lat: 40.7158, lng: -74.0010 },
    ];

    centers.forEach(center => {
        const marker = new google.maps.Marker({
            position: { lat: center.lat, lng: center.lng },
            map: map,
            title: center.name,
        });

        // Add an info window for each marker
        const infoWindow = new google.maps.InfoWindow({
            content: `<h4>${center.name}</h4>`,
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });
}

// Locate user button functionality
document.getElementById('locate-me').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            map.setCenter(userLocation);
            new google.maps.Marker({
                position: userLocation,
                map: map,
                title: 'You are here',
            });
        }, () => {
            handleLocationError(true, map.getCenter());
        });
    } else {
        handleLocationError(false, map.getCenter());
    }
});

function handleLocationError(browserHasGeolocation, pos) {
    alert(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}
