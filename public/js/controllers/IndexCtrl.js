'use strict';

function IndexCtrl($scope, $http, SocketConnection, APIService) {

  $scope.testFetch = function() {
    var query = {
      entity : "TrickType"
    };

    APIService.fetchItems(query, true).then(function(results) {
      console.log(JSON.stringify(results));  
    });
    
  };

  // socket listeners
  SocketConnection.on('init', function (data) {
    console.log("init received:  " + data.msg);
  });
}