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


  var newTrickInput = function() {
    return {
      name : "",
      getName : function() {
        if (this.isFirstTrick) {
          return "Trick(s)";
        } else {
          return "";
        }
      },
      value : "",
      type : "text",
      helpText : "",
      typeahead : "value.name for value in getMatches($viewValue, $index)",
      typeaheadResults : [],
      selectedObj : null,
      entityName : "TrickType",
      templateUrl: 'partials/addNewSkater',
      controller: 'AddNewTrickTypeCtrl',
      multipleField : true,
      dropdownOptions : ["Ledge", "Flatground", "Rail", "Gap", "Transition"],
      isLastTrick : true,
      isFirstTrick : false,
      typeaheadFetch : function(searchText, successFunction) {

        var url = '/api/trickTypes';
        if (searchText) {
          url = url + "?q=" + searchText;
        }

        return $http.get(url).then(function(response) {
          var trickTypes = response.data.trickTypes;
          return successFunction(trickTypes);
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
  };

  // initialize the tricks array with one trick
  $scope.tricks = [newTrickInput()];
  $scope.tricks[0].isFirstTrick = true;

  $scope.inputs.push($scope.tricks[0]);


  $scope.addAnotherTrick = function(index) {

    var newTrick = newTrickInput();

    var lastTrick = $scope.tricks.slice(-1)[0]

    // figure out what index the last trick is at
    var i;
    for (i = 0; i < $scope.inputs.length; i++) {
      if ($scope.inputs[i] == lastTrick) {
        break;
      }
    }

    // insert new trick after last trick
    $scope.inputs.splice(i+1, 0, newTrick);

    // make sure all the other tricks know they are not the last trick
    for (i = 0; i < $scope.tricks.length; i++) {
      $scope.tricks[i].isLastTrick = false;
    }

    // add the new trick to the end of our tricks array
    $scope.tricks.push(newTrick);
  };


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

    // cue the video if our console is ready to play videos
  	if (YoutubeService.playerIsReady) {
  		YoutubeService.cueClip(clip);
  	}
  };
}