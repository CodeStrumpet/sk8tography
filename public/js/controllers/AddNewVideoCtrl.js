'use strict';

function AddNewVideoCtrl($scope, $http, $injector, dialog, dialogModel) {

  $injector.invoke(InputBlockCtrl, this, {$scope: $scope});

  $scope.loading = false;

  $scope.nameInput = {
    name : "Name",
    value : dialogModel.value,
    type : "text",
    helpText : "",
  };

  $scope.yearInput = {
    name : "Year",
    type : "number",
    helpText : "",
    min : 1950,
    max : 2014
  };

  $scope.infoUrlInput = {
    name : "Info URL",
    type : "url",
    helpText : "Wikipedia or other informational link",
  };

  $scope.purchaseUrlInput = {
    name : "Purchase URL",
    type : "url",
    helpText : "The URL where can you purchase this video (ideally from the company who made it).",
  };

  // TODO !! Add Companies / Brands...

  $scope.inputs.push($scope.nameInput);
  $scope.inputs.push($scope.yearInput);
  $scope.inputs.push($scope.infoUrlInput);
  $scope.inputs.push($scope.purchaseUrlInput);


  $scope.submitNewVideo = function() {
    $scope.loading = true;

    var video = {
      name : $scope.nameInput.value,
      year : $scope.yearInput.value,
      infoUrl : $scope.infoUrlInput.value,
      purchaseUrl : $scope.purchaseUrlInput.value
    };

    $http.post('/api/addVideo', video).
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