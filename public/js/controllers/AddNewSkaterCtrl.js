'use strict';

function AddNewSkaterCtrl($scope, $http, $injector, dialog, dialogModel) {

  $injector.invoke(InputBlockCtrl, this, {$scope: $scope});

  $scope.loading = false;

  $scope.nameInput = {
    name : "Name",
    value : dialogModel.value,
    type : "text",
    helpText : "",
  };

  $scope.isGoofyInput = {
    name : "Is Goofy",
    value : false,
    type : "checkbox",
    helpText : "",
  };

  $scope.inputs.push($scope.nameInput);
  $scope.inputs.push($scope.isGoofyInput);


  console.log(dialogModel);

  $scope.submitNewSkater = function() {
    $scope.loading = true;

    var skater = {
      name : $scope.nameInput.value,
      isGoofy : $scope.isGoofyInput.value
    };

    $http.post('/api/addSkater', skater).
      success(function(data) {
        if (data.error) {
          console.log("add Skater failed: " + data.error);
          dialog.close("Unable to add Skater");
        } else {
          console.log("add Skater returned success.");
          console.log(data.skater);

          var returnData = {
            entity : data.skater,
            value : data.skater.name
          };

          dialog.close(returnData);
        }
    });
  };

   $scope.close = function(result) {
      dialog.close(result);
    };
}