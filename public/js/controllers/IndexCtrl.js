'use strict';

function IndexCtrl($scope, $http, SocketConnection, $injector) {

  $injector.invoke(AddPostCtrl, this, {$scope: $scope});

  console.log("sampleVal: " + $scope.form.sampleVal);

  // socket listeners
  SocketConnection.on('init', function (data) {
    console.log("init received:  " + data.msg);
  });

  $http.get('/api/posts').
    success(function(data, status, headers, config) {
      $scope.posts = data.posts;
    });
}