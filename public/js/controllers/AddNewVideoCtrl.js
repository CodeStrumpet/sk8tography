'use strict';

function AddNewVideoCtrl($scope, $http, dialog, dialogModel) {

  $scope.loading = false;

  console.log("resolve passed in: " + JSON.stringify(dialogModel));

  $scope.video = dialogModel;  // in case this is 'edit' instead of new... (note:  'parentVideo' was passed in through the dialogModel resolve...)

  console.log("video passed in: " + JSON.stringify($scope.parentVideo));

  $scope.submitNewVideo = function() {
    $scope.loading = true;

    $http.post('/api/addVideo', $scope.video).
      success(function(data) {
        if (data.error) {
          console.log("add video failed: " + data.error);
          dialog.close("Unable to add video");
        } else {
          console.log("add video returned success.");
          dialog.close(data);
        }
    });
  };

   $scope.close = function(result) {
      dialog.close(result);
    };
}