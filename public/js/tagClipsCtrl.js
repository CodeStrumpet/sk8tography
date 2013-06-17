'use strict'

function TagClipsCtrl($scope, $http) {

 console.log("tag clips...");

	 // this function is passed to the video player and will be called when the player is ready
  $scope.onPlayerReady = function (event) {
    $scope.playerIsReady = true;

  	//event.target.playVideo();
  };

  // this function is passed to the video player and will be called when the player's state changes
  $scope.onPlayerStateChange = function(event) {
    var stateName = "";
    switch(event.data) {
          case -1:
                stateName = "UNSTARTED";
                break;
          case YT.PlayerState.ENDED:
                stateName = "ENDED";
                autoplay = false;
                $scope.cueCurrentVideo();
                break;
          case YT.PlayerState.PLAYING:
                stateName = "PLAYING";
                // start monitoring the clip duration                        
                $scope.checkCurrentTime();
                break;
          case YT.PlayerState.PAUSED:
                stateName = "PAUSED";    
                break;
          case YT.PlayerState.BUFFERING:
                stateName = "BUFFERING";
                break;
          case YT.PlayerState.CUED:
                stateName = "CUED";
                if (autoplay) {
                      $scope.playVideo();
                      autoplay = false;                              
                }                                                 
                break;
          default:
                stateName = "UNKNOWN";
    }

    console.log("YT.PlayerState:  " + stateName);
                 
  }

}