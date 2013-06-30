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


    return $http.get('/api/videos', {}).then(function(response) {

      return response.data.videos;

        return [{name : "salmon agah"}, {name : "jose fernandez"}, {name : "elissa steamer"}];

        
        console.log("returned " + data.videos.length + " videos.");  

        return data.videos;
    });

    // call typeahead fetch function on the input obj and return the results
    // !!! typeahead fetch function must return a promise
    var inputObj = $scope.inputs[index];

    var promise = inputObj.typeaheadFetch(inputText, function(results) {
      console.log("num results: " + results.length);
      inputObj.typeaheadResults = results;
      inputObj.checkValidity();
      return inputObj.typeaheadResults;
    });

    return promise();
/*
    var promise = inputObj.typeaheadFetch(inputText);
    promise.then(function(results) {
      console.log("num results: " + results.length);
      inputObj.typeaheadResults = results;
      inputObj.checkValidity();
      return inputObj.typeaheadResults;
    });
*/
/*
    return inputObj.typeaheadFetch(inputText, function(results) {
      inputObj.typeaheadResults = results;
      inputObj.checkValidity();
      return inputObj.typeaheadResults;
    });
*/
  };
};