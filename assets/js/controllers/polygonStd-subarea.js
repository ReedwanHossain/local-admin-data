(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('PolygonStdSubArea', PolygonStdSubArea);

    PolygonStdSubArea.$inject = ['$scope', '$modal', '$http', '$stateParams', '$window', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

    function PolygonStdSubArea($scope, $modal, $http, $stateParams, $window, $location, $timeout, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {
        // $scope.coordinates=[];
       

          var init = function() {
            Auth.getlocations(urls.POLYGON_AREA, function(res) {
           $scope.areas = res;
             
        },
         function() {
            
        });
           
        };
        init();

        


    angular.extend($scope, {
      center: {
          lat: 23.728783,
          lng: 90.393791,
          zoom: 12,

        },
         controls: {
                    draw: {}
                },
      layers: {
                    baselayers: {

                      bkoi: {
                            name: 'barikoi',
                            url: 'http://map.barikoi.xyz:8080/styles/klokantech-basic/{z}/{x}/{y}.png',
                            type: 'xyz',
                            layerOptions: {
                                maxZoom: 23
                            },
                        },
                          
                      mapbox_light: {
                            name: 'Mapbox Streets',
                            url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                            type: 'xyz',
                            layerOptions: {
                                apikey: 'pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w',
                                mapid: 'mapbox.streets',
                                maxZoom: 23
                                
                            },
                            layerParams: {
                                showOnSelector: true
                            }
                        },
                        osm: {
                            name: 'OpenStreetMap',
                            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            type: 'xyz',
                            layerOptions: {
                                maxZoom: 23
                            },
                        }
                        
                        
                    },
                    overlays: {
                        draw: {
                            name: 'draw',
                            type: 'group',
                            visible: true,
                            layerParams: {
                                showOnSelector: false
                            }
                        }
                    }
                }
            });


    leafletData.getMap().then(function(map) {
              $timeout(function() {
                map.invalidateSize();
                //create bounds
              }, 500);
            });

  leafletData.getMap().then(function(map) {
               leafletData.getLayers().then(function(baselayers) {
                  var drawnItems = baselayers.overlays.draw;
                  map.on('draw:created', function (e) {
                    var layer = e.layer;
                    drawnItems.addLayer(layer);
                     //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                      var array = [];
                     layer.toGeoJSON().geometry.coordinates[0].map(function(ary) {
                      
                       array.push(ary.join(' '));
                     });
                     $scope.coordinates = array.reduce(
                      ( accumulator, currentValue ) => accumulator.concat(currentValue),
                      []
                    );

                     DataTunnel.set_data($scope.coordinates);

                     var modalInstance = $modal.open({
                //templateUrl: '/local/examples/polygon-area-mod.html',
                templateUrl: '/../../examples/polygon-subarea-mod.html',
                controller: 'PolygonModal',
                size: 'lg',
                scope: $scope
            });

                    
                      // swal({
                      //     title: "Polygon Name?",
                      //     type: "input",
                      //     showCancelButton: true,   
                      //     closeOnConfirm: false,
                      //     inputPlaceholder: "Ex: Mirpur-2, Banani etc"
                      //   }, function (inputValue) {
                      //     if (inputValue === false) return false;
                      //     if (inputValue === "") {
                      //       swal.showInputError("Only tagging is real!");
                      //       return false
                      //     }
                      //       var data = {
                      //         area : coordinates.toString(),
                      //         name : inputValue
                      //       }
                      //       Auth.post_anything(urls.POLYGON_CREATE, data, function(res) {
                      //         console.log(res);
                      //          swal("Nice!", "New Polygon Inserted ", "success");
                      //       },function() {
                              
                      //       })

                      //   });
                  });
               });
           });


  function style(feature) {
                return {

                    opacity: 2,
                    color: '#D4A76A',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }


  $scope.set_area = function(area) {
      console.log(area);
      // var polyjson = JSON.parse(zone['ST_AsGeoJSON(ward_area)']);
      // console.log(polyjson);
      $scope.id = area['id'];

      Auth.getlocations(urls.SUBAREA_BY_AREA+$scope.id+'?', function(res) {
            $scope.roads = res;
            console.log(res)
            var coordinates = [];
            var temp = [];
            $scope.Feature =[]
            $scope.roads.map(function(road,k) {   
              var polyjson = road['ST_AsGeoJSON(subarea_area)'];
              
              $scope.Feature.push({
                "type": "Feature",
                "properties": {
                  "name": road.subarea_name,
                },
                "geometry": {
                  "type": "Polygon",
                  "coordinates": polyjson.coordinates
                }
              });



             temp.push(polyjson.coordinates);
              // console.log(array.concat(polyjson.coordinates[0]));
            });

            coordinates = temp;
          

            
            //$scope.areas.push({id: -1, name:"all", 'ST_AsGeoJSON(area)': JSON.stringify({'type': "Polygon", 'coordinates': coordinates})});
     
      angular.extend($scope, {
        center: {
          lat: coordinates[0][0][0][1],
          lng: coordinates[0][0][0][0],
          zoom: 14,

        },
                  geojson : {
                    data: {
                      "type": "FeatureCollection",
                      "features": $scope.Feature
                    },
                    style: {
                       
                            weight: 2,
                            opacity: 1,
                            color: 'red',
                            dashArray: '3',
                            fillOpacity: 0
                    },
                },

                selectedRoad : {},

                 events: {
                    geojson: {
                        enable: [ 'click', 'mouseover' ]
                    }
                },


            });
   
            
        },
             function() {
                
            });
     
      
        // $scope.markers = {};
    };



            


    $scope.changeCenter = function(marker) {
                $rootScope.center.lat = marker.lat;
                $rootScope.center.lng = marker.lng;
            };


     $scope.openSlide = function() {
      $scope.toggle = !$scope.toggle;
    };

    
  }

}());
