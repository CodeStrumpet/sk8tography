'use strict';

function VisPlaygroundCtrl($scope) {

  $scope.startValue = 3;

  $scope.updateData = function() {
    var newData = [];
    for (var i = $scope.startValue; i < $scope.startValue + 6; i++) {
      newData.push(i);
    }
    $scope.data = newData;

    $scope.startValue = $scope.startValue + 2;
  }

  // kick things off...
  $scope.updateData();
}