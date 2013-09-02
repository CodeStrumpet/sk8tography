var InputBlockCtrl = function ($scope, $http, $dialog) {
  $scope.inputs = [];
  $scope.updateEnabled = false;

  $scope.onTypeaheadSelect = function(index) {
    // call checkValidity function
    $scope.inputs[index].checkValidity();    
  };

  $scope.defaultTypeahed = function(inputText) {
    return [];
  };

  $scope.getMatches = function (inputText, index) {

    // call typeahead fetch function on the input obj and return the results
    // !!! typeahead fetch function must return a promise
    var inputObj = $scope.inputs[index];
    return inputObj.typeaheadFetch(inputText, function(results) {
      if (!results) {
        results = [];
      }
      inputObj.typeaheadResults = results;
      inputObj.checkValidity();
      inputObj.typeaheadActive = true;
      return inputObj.typeaheadResults;
    });
  };

  $scope.typeaheadBlur = function(index) {
    $scope.inputs[index].checkValidity();
    $scope.inputs[index].typeaheadActive = false;
    //$scope.inputs[index].typeaheadResults = [];
  };

  $scope.showAddEntity = function (index) {
    return $scope.inputs[index].typeahead && !$scope.inputs[index].selectedObj && $scope.inputs[index].value.length > 2 && !$scope.inputs[index].typeaheadActive;
  };

  $scope.addNewEntity = function(index) {

    $scope.opts = {
      backdrop: true,
      keyboard: true,
      backdropClick: true,
      templateUrl: $scope.inputs[index].templateUrl,
      controller: $scope.inputs[index].controller,
      dialogClass: 'modal modal-form',
      resolve: {
        dialogModel: function() {          
          return {
            value : $scope.inputs[index].value
          };
        } 
      }
    };

    var d = $dialog.dialog($scope.opts);
    d.open().then(function(result){
      if(result) {
        $scope.updateEnabled = true;
        console.log('Entity added: '+ result.entity._id + "  value: " + result.value);          
          
        $scope.inputs[index].value = result.value;
        $scope.inputs[index].typeaheadResults = [result.entity];
        $scope.inputs[index].selectedObj = result.entity;        
      }
    });
  };

  // restore empty values
  $scope.clearInputs = function() {
    for (var i = 0; i < $scope.inputs.length; i++) {
      $scope.inputs[i].value = "";
      $scope.inputs[i].selectedObj = null;
      $scope.inputs[i].typeaheadResults = [];
      $scope.updateEnabled = false;
    }
  }
};