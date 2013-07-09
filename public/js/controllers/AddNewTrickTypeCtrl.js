'use strict';

function AddNewTrickTypeCtrl($scope, $http, $injector, dialog, dialogModel) {

  $injector.invoke(InputBlockCtrl, this, {$scope: $scope});

  $scope.loading = false;

  $scope.nameInput = {
    name : "Name",
    value : dialogModel.value,
    type : "text",
    helpText : "",
  };

  $scope.otherNamesInput = {
    name : "Other Names",
    value : "",
    type : "text",
    helpText : "comma separated list",
  };

  $scope.inputs.push($scope.nameInput);
  $scope.inputs.push($scope.otherNamesInput);


  console.log(dialogModel);

  $scope.submitNewTrickType = function() {
    $scope.loading = true;

    var otherNames = $scope.otherNamesInput.value.split(',');
    for (var i = 0; i < otherNames.length; i++) {
      otherNames[i] = otherNames[i].replace(/(^\s+|\s+$)/g,' ');
    }

    var trickType = {
      name : $scope.nameInput.value,
      otherNames : otherNames
    };

    $http.post('/api/addTrickType', trickType).
      success(function(data) {
        if (data.error) {
          console.log("add TrickType failed: " + data.error);
          dialog.close("Unable to add TrickType");
        } else {
          console.log("add TrickType returned success.");
          console.log(data.trickType);

          var returnData = {
            entity : data.trickType,
            value : data.trickType.name
          };

          dialog.close(returnData);
        }
    });
  };

   $scope.close = function(result) {
      dialog.close(result);
    };
}