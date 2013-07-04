'use strict'

function TagClipsCtrl($scope, $http, $injector, $dialog, YoutubeService) {

  $injector.invoke(InputBlockCtrl, this, {$scope: $scope});

	$scope.currClipIndex = -1;

	$http.get('/api/clips').success(function(data, status, headers, config) {
      $scope.clips = data.clips;
  });

  $scope.skaterInput = {
    name : "Skater",
    value : "",
    type : "text",
    helpText : "",
    typeahead : "value.name for value in getMatches($viewValue, $index)",
    typeaheadResults : [],
    selectedObj : null,
    entityName : "Skater",
    templateUrl: 'partials/addNewSkater',
    controller: 'AddNewSkaterCtrl',
    typeaheadFetch : function(searchText, successFunction) {

      var url = '/api/skaters';
      if (searchText) {
        url = url + "?q=" + searchText;
      }

      return $http.get(url).then(function(response) {
        var skaters = response.data.skaters;
        return successFunction(skaters);
      });
    },
    checkValidity : function() {
      var valid = false;
      for (var i = 0; i < this.typeaheadResults.length; i++) {
        if (this.typeaheadResults[i].name.toLowerCase() === this.value.toLowerCase()) {
          console.log("exact typeahead match!");
          this.selectedObj = this.typeaheadResults[i];
          valid = true;
          break;
        } 
      }
      // reset selectedObj to null if we don't have a match
      if (!valid) {
        this.selectedObj = null;
      }
    }
  };

  $scope.inputs.push($scope.skaterInput);



  $scope.clipsBecameAvailable = function() {
  	$scope.clipsAvailable = true;

  	console.log("clips available");

    // set the current clip to the first one in the list
    if ($scope.clips.length > 0 && $scope.clips != undefined) {
    	$scope.currClipIndex = -1;
    }       
  };

  $scope.setCurrentClip = function(clip) {
  	$scope.currClipIndex = $scope.clips.indexOf(clip);

    var currSkater = "";

    // get skater if we have it...
    if (clip.skaterRef) {

      var url = '/api/skaters?_id=' + clip.skaterRef;

      $http.get(url).then(function (response) {        

        if (response.data.error) {
          console.log("error: " + response.data.error);
        } else if (response.data.skaters) {
          $scope.skaterInput.value = response.data.skaters.name;
          $scope.skaterInput.typeaheadResults = [response.data.skaters];
          $scope.skaterInput.selectedObj = response.data.skaters;
        }
        return response.data.skaters.name;
      });
    }


  	if (YoutubeService.playerIsReady) {
  		YoutubeService.cueClip(clip);
  	}
  };
}