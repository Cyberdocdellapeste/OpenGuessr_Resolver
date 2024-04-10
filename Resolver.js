// ==UserScript==
// @name         OpenGuessr Resolver
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Resolve OpenGuessr Game
// @author       Cyberdoc della Peste (social:@ildocdellapeste / email: ildocdellapeste@gmail.com)
// @match        https://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openguessr.netlify.app
// @grant        GM.xmlHttpRequest
// ==/UserScript==

let globalCoordinates = {
    lat: 0,
    lng: 0
};

(function() {
    'use strict';

    // Function to resolve city, state, and country
    function resolveCityStateAndCountry(latitude, longitude) {
        // Make a request to Nominatim API to reverse geocode coordinates
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.address) {
                    const city = data.address.city || data.address.town || data.address.village;
                    const state = data.address.state;
                    const country = data.address.country;
                    console.log('CYBERDOC:', city, state, country);
                } else {
                    console.error('City, state, or country not found for the coordinates.');
                }
            })
            .catch(error => {
                console.error('Error resolving city, state, and country:', error);
            });
    }

    function resolveFullAddress(latitude, longitude) {
    // Make a request to Nominatim API to reverse geocode coordinates
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.address) {
                console.log('CYBERDOC:', data.address);
            } else {
                console.error('Address not found for the coordinates.');
            }
        })
        .catch(error => {
            console.error('Error resolving full address:', error);
        });
}

    // Function to retrieve coordinates and resolve them to an address
    function retrieveCoordinatesAndResolve(responseText) {
        try {
        let interceptedResult = responseText;
        const pattern = /-?\d+\.\d+,-?\d+\.\d+/g;
        let match = interceptedResult.match(pattern)[0];
        let split = match.split(",");

        let lat = Number.parseFloat(split[0]);
        let lng = Number.parseFloat(split[1]);

        globalCoordinates.lat = lat;
        globalCoordinates.lng = lng;
        resolveFullAddress(globalCoordinates.lat, globalCoordinates.lng);
    } catch (error) {
        console.error('Error retrieving and resolving coordinates:', error);
    }
    }

    // Intercept XMLHttpRequests
    var originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {

        // Intercept the API call to GetMetadata
        if (url.startsWith('https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/GetMetadata')) {
            // Intercepting the request to get the payload
            this.addEventListener('load', function() {
                retrieveCoordinatesAndResolve(this.responseText);
            });
        }
        // Call the original open function
        return originalOpen.apply(this, arguments);
    };

    // Intercept requests when DOM content is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded event fired. Script activated.');
    });

})();
