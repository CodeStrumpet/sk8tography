'use strict';

function YoutubeVideoCtrl($scope, YoutubeService) {

  console.log("YoutubeVideoCtrl");

  $scope.playerIsReady = false;

  $scope.$watch('playlist.items', function(newVal, oldVal) {
    if (newVal) {
      console.log("playlist value changed: " + newVal.length);      
    }
  });

  $scope.$watch('playstate.isPlaying', function(newVal, oldVal) {
    if (typeof(newVal) != 'undefined' ) {
      console.log("playstate.isPlaying changed: " + JSON.stringify(newVal));      
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
    console.log("playlist position");

    if (typeof(newVal) != 'undefined') {

      // use this to programmatically set playlist position values
      if ($scope.playlist.ignorePositionChange) {
        $scope.playlist.ignorePositionChange = false;
        return;
      }

      $scope.updateForPlaylistPositionChange(newVal);
    }
  }, true);

  $scope.updateForPlaylistPositionChange = function(newVal) {    
   if (newVal >= 0 && $scope.playerIsReady) {
      console.log("playlistPosition changed: " + newVal);

      if ($scope.playlist.items.length > newVal) {
        var clip = $scope.playlist.items[newVal];

        
        var videoInfo = {
          videoId: clip.videoSegmentId,
          startSeconds: clip.startTime,
          //endSeconds : clip.startTime + clip.duration,            
          suggestedQuality: 'default'
        };



        // TODO: check if we can just keep rolling or seek to a new spot in the same video

        //cue clip here if necessary...       
        $scope.player.cueVideoById(videoInfo);

        //$scope.player.seekTo(clip.startTime, true);
      }
    }
  };

  $scope.currentClip = function() {
    var currClip = null;
    if ($scope.playlist.items && $scope.playlist.position >= 0 && $scope.playlist.items.length > $scope.playlist.position) {
      currClip = $scope.playlist.items[$scope.playlist.position];
    }
    return currClip;
  };

  $scope.nextClip = function() {
    var nextClip = null;
    if ($scope.playlist.items && $scope.playlist.position >= 0 && $scope.playlist.items.length > $scope.playlist.position + 1) {
      nextClip = $scope.playlist.items[$scope.playlist.position + 1];
    }
    return nextClip;
  };


  $scope.checkCurrentTime = function () {

    if ($scope.player.getPlayerState() == YT.PlayerState.PLAYING) {      

      var currTime = $scope.player.getCurrentTime();
      var currClip = $scope.currentClip();

      // figure out what to do if we have gone past the clip duration
      if (currClip && currTime > currClip.startTime + currClip.duration) {        

        if ($scope.playstate.keepPlaying) {

          var nextClip = $scope.nextClip();
          if (nextClip) {
            var keepRolling = false;
            if (nextClip.videoSegmentId === currClip.videoSegmentId) {
              var startTimeGap = nextClip.startTime - (currClip.startTime + currClip.duration);
              console.log("nextClip.startTime: " + nextClip.startTime + "  currClip.startTime: " + currClip.startTime + "  currClip.duration: " + currClip.duration);

              if (startTimeGap >= 0 && startTimeGap < 4) {
                // just keep rolling, increment playlist position
                
                $scope.$apply(function(){
                  $scope.playlist.ignorePositionChange = true;
                  $scope.playlist.position = $scope.playlist.position + 1;                  
                });                
                keepRolling = true;
              }
            }

            if (!keepRolling) {
              console.log("startTimeGap not close enough, pausing video");
              $scope.player.pauseVideo();
               $scope.$apply(function(){
                $scope.playlist.position = $scope.playlist.position + 1;
              });
              //$scope.updateForPlaylistPositionChange($scope.playlist.position);
            } else {
              setTimeout($scope.checkCurrentTime, 100); // todo use settings val for timeout period
            }
          }
        }

        //$scope.cueClip($scope.currClip, false);
      } else {
        setTimeout($scope.checkCurrentTime, 100); // todo use settings val for timeout period
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
        if ($scope.playstate.playUponCued) {
          $scope.player.playVideo();
        }
        break;
      default:
        stateName = "UNKNOWN";
    }
    console.log("YT.PlayerState:  " + stateName);
  }
}