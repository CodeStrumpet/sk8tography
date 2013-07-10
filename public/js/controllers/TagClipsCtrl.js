'use strict'

function TagClipsCtrl($scope, $http, $injector, $dialog, YoutubeService) {

  var consts = window.Constantsinople;

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
      entityName : "Trick",
      templateUrl: 'partials/addNewTrickType',
      controller: 'AddNewTrickTypeCtrl',
      multipleField : true,
      isLastTrick : true,
      isFirstTrick : false,
      isComboTrick : false,
      isSwitchTrick : false,
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

  $scope.removeTrick = function(index) {

    var trickToRemove = $scope.inputs[index];

    // figure out the trick index 
    var i;
    for (i = 0; i < $scope.tricks.length; i++) {
      if ($scope.tricks[i] == trickToRemove) {
        break;
      }
    }

    $scope.tricks.remove(i);
    $scope.inputs.remove(index);

    $scope.tricks[$scope.tricks.length - 1].isLastTrick = true;
  };

  $scope.closeAlert = function(index) {
    $scope.errors.remove(index);
  };

  $scope.mouseEnteredInput = function(index) {
    $scope.inputs[index].active = true;
  };

  $scope.mouseLeftInput = function(index) {
    $scope.inputs[index].active = false;
  };

  $scope.terrainName = function(terrainType) {
    var name = "Unspecified";
  }

  $scope.clipsBecameAvailable = function() {
  	$scope.clipsAvailable = true;

  	console.log("clips available");

    // set the current clip to the first one in the list
    if ($scope.clips.length > 0 && $scope.clips != undefined) {
    	$scope.currClipIndex = -1;
    }       
  };

  $scope.getClipClass = function(index) {

    var result = [];
    if (index == $scope.currClipIndex) {
      result.push("activeclip");
    } else {
      result.push("clip-element");
    }
    return result;
  };

  $scope.setCurrentClip = function(clip) {

    var newClipIndex = $scope.clips.indexOf(clip);

    // don't do anything if the clip is already selected
    if (newClipIndex == $scope.currClipIndex) {
      return;
    }

  	$scope.currClipIndex = newClipIndex;

    $scope.errors = [];

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

  $scope.updateClip = function() {

    // reset errors before starting
    $scope.errors = [];

    var clip = $scope.clips[$scope.currClipIndex];

    if ($scope.skaterInput.value == "") {
      clip.skaterRef = null;
    } else if (!$scope.skaterInput.selectedObj) {
      $scope.errors.push({type: 'error', msg: "invalid skater: " + $scope.skaterInput.value});
    } else if (clip.skaterRef != $scope.skaterInput.selectedObj._id) {
      console.log("skater ref mismatch");
      if ($scope.skaterInput.selectedObj) {
        clip.skaterRef = $scope.skaterInput.selectedObj._id;
        console.log("new skater!");
      } 
    }

    var clipTricks = [];
    for (var i = 0; i < $scope.tricks.length; i++) {
      if ($scope.tricks[i].selectedObj) {
        var trick = {};        
        trick.trickTypeRef = $scope.tricks[i].selectedObj._id;
        trick.stance = consts.Stance.UNKNOWN; // TODO !!!!
        trick.terrainType = consts.TerrainType.UNKNOWN; // TODO !!!!
        clipTricks.push(trick);
      } else if ($scope.tricks[i].value != "") {
        $scope.errors.push({type: 'error', msg: "invalid trick: " + $scope.tricks[i].value});
      }
    }

    if ($scope.errors.length == 0) {

      clip.tricks = clipTricks;

      $http.put('/api/updateClip', {clip: clip}).
      success(function(data) {
        console.log(JSON.stringify(data));
        if (data.error) {
          console.log("updating clip failed");
        } else {
          console.log("updateClip returned success.");
        }
      });
    }
  };
}