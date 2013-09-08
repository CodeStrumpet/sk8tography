'use strict'

function TagClipsCtrl($scope, $http, $injector, $dialog, YoutubeService, UserService) {

  var consts = window.Constantsinople;

	$scope.currClipIndex = -1;

  $scope.filter = {};

	$http.get('/api/clips').success(function(data, status, headers, config) {
      $scope.clips = data.clips;
  });


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

  
  $scope.clipsBecameAvailable = function() {
  	$scope.clipsAvailable = true;

  	console.log("clips available");

    // set the current clip to the first one in the list
    if ($scope.clips.length > 0 && $scope.clips != undefined) {
    	$scope.currClipIndex = 0;  // TODO ??? Why set this to -1 ??
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
    if (newClipIndex == -1) {
      console.log("Error setting current clip!! Invalid index!!");
      return;
    }

    if (YoutubeService.playerIsReady) {
      YoutubeService.cueClip(clip);
    }

    $scope.currClip = $scope.clips[newClipIndex];

    // if the clip is already selected we just cue the video again and return
    if (newClipIndex == $scope.currClipIndex) {            
      return;
    }

    $scope.currClipIndex = newClipIndex;

    // update the clip's 'selected' property in order to hook into css
    if ($scope.currClipIndex >= 0 && $scope.currClipIndex < $scope.clips.length) {
      $scope.clips[$scope.currClipIndex].selected = false;      
    }

    clip.selected = true;

  	
    
  };
}