'use strict'

function TagClipsCtrl($scope, $http, $injector, $dialog, YoutubeService) {

  var consts = window.Constantsinople;

  $injector.invoke(InputBlockCtrl, this, {$scope: $scope});

	$scope.currClipIndex = -1;

  $scope.filter = {};

	$http.get('/api/clips').success(function(data, status, headers, config) {
      $scope.clips = data.clips;
  });

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
      placeholder : "",
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
            $scope.updateEnabled = true;
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

  $scope.updateClips = function() {

    if ($scope.filter.videoSegment) {

      var url = '/api/clips' + '?segmentId=' + $scope.filter.videoSegment._id;
      console.log("calling url: " + url);
      $http.get(url).success(function(data, status, headers, config) {
        $scope.clips = data.clips;
        console.log("number of clips: " + data.clips.length);
      });
    }
  };

  /**
   *  Sets the filter videoSegment to the param passed in and calls updateClips (called from typeahead)
   */
  $scope.updateClipsWithSegmentChoice = function(segment) {
    $scope.filter.videoSegment = segment;
    $scope.updateClips();    
  };

  /**
   *  Sets the filter videoSegment to the param passed in and calls updateClips (called from dropdown select)
   */
  $scope.videoSegmentSelect = function(item) {
    
    $scope.filter.videoSegment = item;
    $scope.updateClips();
  };

  $scope.videoSegmentTypeahead = function(inputText) {
    
    return $scope.getVideoSegments(inputText, function(results) {
      $scope.typeaheadSegments = results;
      return results;
    });    
  };

  $scope.getVideoSegments = function(queryText, successFn) {
    var url = '/api/videoSegments';
    if (queryText && queryText != "") {
      url = url + "?q=" + queryText;
    }

    return $http.get(url).then(function(response) {          
      var segments = response.data.videoSegments;
      return successFn(segments);
    });
  };

  $scope.getVideoSegments("", function(results) {
    $scope.segments = results;
  });

  $scope.videoSegmentsBlur = function(index) {
    console.log("videoSegments blur");
  };

  $scope.updateInputsWithClip = function(clip) {

    $scope.inputs = [];
    
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


    // initialize the tricks array with one trick
    $scope.tricks = [newTrickInput()];
    $scope.tricks[0].isFirstTrick = true;

    $scope.inputs.push($scope.tricks[0]);

    for (var i = 0; i < clip.tricks.length; i++) {

      // we have already added the first trick, so we don't have to do it again
      if (i > 0) {        
        $scope.addAnotherTrick();
      } 

      var url = '/api/trickTypes?_id=' + clip.tricks[i].trickTypeRef;

      $http.get(url).then(trickTypeCallback(i));
    }
  };

  // creating function that returns a function to deal with functional scope issue
  var trickTypeCallback = function(index) {
    var newIndex = index;
    
    return function(response) {

      if (response.data.error) {
        console.log("error: " + response.data.error);
      } else if (response.data.trickTypes) {
        $scope.tricks[newIndex].value = response.data.trickTypes.name;
        $scope.tricks[newIndex].typeaheadResults = [response.data.trickTypes];
        $scope.tricks[newIndex].selectedObj = response.data.trickTypes;
      }
      //return response.data.trickTypes.name;      
    };
  }

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

    return newTrick;
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

    console.log(clip);

    // if the clip is already selected we just cue the video again and return
    if (newClipIndex == $scope.currClipIndex) {      
      if (YoutubeService.playerIsReady) {
        YoutubeService.cueClip(clip);
      }
      return;
    }

    // mark the update button as disabled again
    $scope.updateEnabled = false;

    // update the clip's 'selected' property in order to hook into css
    if ($scope.currClipIndex >= 0 && $scope.currClipIndex < $scope.clips.length) {
      $scope.clips[$scope.currClipIndex].selected = false;      
    }

    clip.selected = true;

  	$scope.currClipIndex = newClipIndex;

    $scope.errors = [];

    // update inputs
    $scope.updateInputsWithClip(clip);

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
        if (data.error) {
          console.log("updating clip failed");
        } else {
          
          data.clip.selected = true;
          $scope.updateEnabled = false;
          $scope.clips[$scope.currClipIndex] = data.clip;        

          console.log("updateClip returned success.");
        }
      });
    }
  };
}