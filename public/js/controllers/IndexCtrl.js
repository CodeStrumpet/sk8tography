'use strict';

function IndexCtrl($scope, $http, SocketConnection, APIService) {

  var skatersQuery = {
    entity : "Skater"
  };


  $scope.skaters = APIService.fetchItems(skatersQuery, true).then(function(results) {
    $scope.skaters = results;
  });


  var trickTypesQuery = {
    entity : "TrickType"
  };
  $scope.trickTypes = APIService.fetchItems(trickTypesQuery, true);

  var clipsQuery = {
    entity : "Clip"
  };
  $scope.clips = APIService.fetchItems(clipsQuery, true);


  // socket listeners
  SocketConnection.on('init', function (data) {
    console.log("init received:  " + data.msg);
  });
}