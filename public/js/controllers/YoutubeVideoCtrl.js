'use strict';

function YoutubeVideoCtrl($scope, YoutubeService) {

  console.log("YoutubeVideoCtrl");

  $scope.playerIsReady = false;

  $scope.$watch('playlist.items', function(newVal, oldVal) {
    if (newVal) {
      console.log("playlist value changed: " + newVal.length);      
    }
  });

  $scope.$watch('playState.isPlaying', function(newVal, oldVal) {
    if (typeof(newVal) != 'undefined' ) {
      console.log("playState.isPlaying changed: " + JSON.stringify(newVal));      
      if ($scope.playerIsReady) {
        if (newVal) { // isPlaying = true
          $scope.player.playVideo();
        } else { // isPlaying = false
          $scope.player.pauseVideo();
        }
      }
    }
  });

  $scope.$watch('playlist.position', function(newVal, oldVal) {
    if (typeof(newVal) != 'undefined') {
      if (newVal > 0 && $scope.playerIsReady) {
        console.log("playlistPosition changed: " + newVal);

        if ($scope.playlist.items.length > newVal) {
          var clip = $scope.playlist.items[newVal];

          
          var videoInfo = {
            videoId: clip.videoSegmentId,
            startSeconds: clip.startTime,
            endSeconds : clip.startTime + clip.duration,            
            suggestedQuality: 'default'
          };

          // TODO: check if we can just keep rolling or seek to a new spot in the same video

          //cue clip here if necessary...       
          $scope.player.cueVideoById(videoInfo);

          //$scope.player.seekTo(clip.startTime, true);
        }
      }
    }
  });


  $scope.checkCurrentTime = function () {

    return;

    if ($scope.player.getPlayerState() == YT.PlayerState.PLAYING) {      

      var currTime = $scope.player.getCurrentTime();
      // forcibly end the video if we have gone past the clip duration
      if ($scope.currClip && currTime > $scope.currClip.startTime + $scope.currClip.duration) {
        $scope.player.pauseVideo();
        $scope.cueClip($scope.currClip, false);
      } else {
        // update the service with the current time
        YoutubeService.timeUpdated(currTime);
        setTimeout($scope.checkCurrentTime, 100);
      }
    }
  };

  // this function is passed to the video player and will be called when the player is ready
  $scope.onPlayerReady = function (event) {
    $scope.playerIsReady = true;
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
        break;
      default:
        stateName = "UNKNOWN";
    }
    console.log("YT.PlayerState:  " + stateName);
  }
}