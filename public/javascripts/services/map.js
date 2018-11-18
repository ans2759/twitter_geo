(function () {
    'use strict';
    const app = angular.module('app');
    const Map = function (ResourceFactory) {

        const _this = this;
        let map;
        let markers = [];
        const mapDiv = angular.element(document.getElementById('map'));
        let lat;
        let lng;

        _this.initMap = function() {
                ResourceFactory.getCoordinates({}, function (res) {
                    if (!map) {
                        lat = res.lat;
                        lng = res.lng;
                        map = new google.maps.Map(document.getElementById('map'), {
                            center: {lat: res.lat, lng: res.lng},
                            zoom: 11
                        });
                    } else {
                        map.setCenter({lat: res.lat, lng: res.lng});
                    }
                }, function (err) {
                    console.error("Error retrieving coordinates", err)
                });
        };

        _this.addTweets = function(tweets) {
            map.setCenter({lat, lng});
            tweets.forEach(function(tweet, index) {
                if (tweet.geo && tweet.geo.coordinates) {
                    _this.addMarker(tweet);
                }
            })
        };

        _this.setCenter = function(lat, lng) {
            _this.deleteMarkers();
            if (!map) {
                map = new google.maps.Map(document.getElementById('map'), {
                    center: {lat: lat, lng: lng},
                    zoom: 11
                });
            }

            const myLatlng = new google.maps.LatLng(lat, lng);
            const marker = new google.maps.Marker({
                position: myLatlng,
                title: "Center"
            });

            marker.setMap(map);
            markers.push(marker);

            map.setCenter(marker.getPosition());
        };

        _this.addMarker = function(tweet, recenter) {
            const myLatlng = new google.maps.LatLng(tweet.geo.coordinates[0], tweet.geo.coordinates[1]);
            const marker = new google.maps.Marker({
                position: myLatlng,
                title: tweet.user.name
            });

            const infoWindow = new google.maps.InfoWindow({
                content: '<div id="content">'+
                '<div id="siteNotice">'+
                '</div>'+
                '<h1 id="firstHeading" class="firstHeading">' + tweet.user.name + '</h1>'+
                '<div id="bodyContent">'+
                '<p>' + tweet.text + '</p>'+
                '</div>'+
                '</div>'

            });
            marker.addListener('click', function() {
                infoWindow.open(map, marker)
            });
            marker.setMap(map);
            markers.push(marker);

            if (recenter) {
                map.setCenter(marker.getPosition());
            }
        };

        // Sets the map on all markers in the array.
        function setMapOnAll(map) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(map);
            }
        }

        // Removes the markers from the map, but keeps them in the array.
        function clearMarkers() {
            setMapOnAll(null);
        }

        // Deletes all markers in the array by removing references to them.
        _this.deleteMarkers = function() {
            clearMarkers();
            markers = [];
        };

        _this.hideMap = function() {
            _this.deleteMarkers();
            mapDiv.attr('style', 'visibility: hidden');
        }
    };
    Map.$inject = ['ResourceFactory'];
    app.service("map", Map)
}());