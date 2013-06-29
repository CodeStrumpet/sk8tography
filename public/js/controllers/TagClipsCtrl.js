'use strict'

function TagClipsCtrl($scope, $http, YoutubeService) {

	$scope.currClipIndex = -1;

	$http.get('/api/clips').
    success(function(data, status, headers, config) {
      $scope.clips = data.clips;
  	});

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

  	if (YoutubeService.playerIsReady) {
  		YoutubeService.cueClip(clip);
  	}
  };
}