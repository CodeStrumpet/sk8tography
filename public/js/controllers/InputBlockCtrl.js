var InputBlockCtrl = function ($scope, $http, $dialog) {
  $scope.inputs = [];
  $scope.updateEnabled = false;

  $scope.onTypeaheadSelect = function(index) {
    // call checkValidity function
    $scope.checkValidity(index);
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
      $scope.checkValidity(index);
      return inputObj.typeaheadResults;
    });
  };

  $scope.typeaheadBlur = function(index) {
    $scope.checkValidity(index);
    $scope.inputs[index].cachedTypeaheadResults = $scope.inputs[index].typeaheadResults;
    $scope.inputs[index].typeaheadResults = [];
  };

  $scope.showAddEntity = function (index) {
    return $scope.inputs[index].typeahead && !$scope.inputs[index].selectedObj && $scope.inputs[index].value.length > 2 && $scope.inputs[index].typeaheadResults.length < 1;
  };

  $scope.checkValidity = function(index) {
    var valid = false;
    var results = $scope.inputs[index].typeaheadResults;
    if (!results) {
      console.log("checkValidity called on an input without typeahead");
      return;
    }

    // we do some awkward thing with cached results to deal w/ a typahead timing issue
    if ($scope.inputs[index].typeaheadResults.length == 0 && $scope.inputs[index].cachedTypeaheadResults && $scope.inputs[index].cachedTypeaheadResults.length > 0) {
      results = $scope.inputs[index].cachedTypeaheadResults;
    }
    for (var i = 0; i < results.length; i++) {
      if (results[i].name.toLowerCase() === $scope.inputs[index].value.toLowerCase()) {
        $scope.inputs[index].selectedObj = results[i];
        valid = true;
        $scope.updateEnabled = true;
        break;
      } 
    }
    // reset selectedObj to null if we don't have a match
    if (!valid) {
      $scope.inputs[index].selectedObj = null;
    }
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