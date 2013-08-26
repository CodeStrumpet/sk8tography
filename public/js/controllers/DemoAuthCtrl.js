'use strict'

function DemoAuthCtrl($scope, $location, $http, DemoService) {

  $scope.pass = "";

  $scope.checkPass = function() {
    DemoService.checkDemoPassword($scope.pass);

    // if (DemoService.checkDemoPassword($scope.pass)) {
    //   $location.url('/');
    // }
  };
}