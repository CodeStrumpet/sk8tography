var InputBlockCtrl = function ($scope, $http) {
  $scope.inputs = [];

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
      inputObj.typeaheadResults = results;
      inputObj.checkValidity();
      return inputObj.typeaheadResults;
    });
  };

  $scope.showAddEntity = function (index) {
    console.log("showAddEntity index: " + index);

    return $scope.inputs[index].value.length > 2 && $scope.inputs[index].typeaheadResults.length < 1;
  };
};