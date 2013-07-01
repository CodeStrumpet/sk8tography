'use strict';

function AddNewVideoCtrl($scope, $http, dialog, dialogModel) {

  $scope.loading = false;

  $scope.video = {};

  $scope.video.name = dialogModel.value;

  console.log(dialogModel);

  $scope.submitNewVideo = function() {
    $scope.loading = true;

    $http.post('/api/addVideo', $scope.video).
      success(function(data) {
        if (data.error) {
          console.log("add video failed: " + data.error);
          dialog.close("Unable to add video");
        } else {
          console.log("add video returned success.");
          console.log(data.video);

          var returnData = {
            entity : data.video,
            value : data.video.name
          };

          dialog.close(returnData);
        }
    });
  };

   $scope.close = function(result) {
      dialog.close(result);
    };
}