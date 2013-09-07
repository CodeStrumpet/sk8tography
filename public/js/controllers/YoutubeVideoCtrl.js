'use strict';

function YoutubeVideoCtrl($scope, YoutubeService) {

  console.log("YoutubeVideoCtrl");


  $scope.playerIsReady = false;
  $scope.slowMotionAvailable = false;
  $scope.players = {};

  $scope.$watch('playlist.items', function(newVal, oldVal) {

    if (newVal && oldVal) {
      if (oldVal.length == 0 && newVal.length == 1) {
        console.log("added the first item");
        $scope.playstate.playUponCued = false;
        $scope.playlist.position = 0;
      }
    }
  }, true);

  $scope.$watch('playlist.position', function(newVal, oldVal) {

    if (typeof(newVal) != 'undefined') {

      $scope.playlist.temp = null;

      // use this to programmatically set playlist position values
      if ($scope.playlist.ignorePositionChange) {
        $scope.playlist.ignorePositionChange = false;
        console.log("ignoring playlist position change");
        return;
      }
      // clear out temp item...
      $scope.playlist.temp = null; 

      //$scope.updateForPlaylistPositionChange();
    }
  }, true);

  $scope.$watch('playlist.temp', function(newVal, oldVal) {

    if (typeof(newVal) != 'undefined') {
      console.log("observed a temp video change");
      $scope.playstate.playUponCued = true;
      $scope.updateForPlaylistPositionChange();    
    }       
  });

  function getParameterByName(name, theUrl) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(theUrl);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

  $scope.updateForPlaylistPositionChange = function() {    
   if (true) {
      //console.log("playlistPosition changed: " + newVal);

      var clip = $scope.currentClip();

      if (clip) {

        var index = $scope.playlist.items.indexOf(clip);
        if (index == -1 ) {
          console.log("couldn't find clip");
          return;
        }

        var playerId = $scope.playerIdForPlaylistItem(index);        

        var videoInfo = {
          videoId: clip.videoSegmentId,
          startSeconds: clip.startTime,
          endSeconds : clip.startTime + clip.duration,            
          suggestedQuality: 'default'
        };

        //cue clip
        $scope.players[playerId].cueVideoById(videoInfo);
        if ($scope.playstate.playUponCued) {
          console.log("playing video...");            
          $scope.players[playerId].playVideo();
        }


        return;











        // check if we can just keep rolling or seek to a new spot in the same video
        var canSeek = false;
        var currVideoUrl = $scope.player.getVideoUrl();
        if (currVideoUrl) {
          var id = getParameterByName('v', currVideoUrl);

          if (id === clip.videoSegmentId) {
            canSeek = true;            
          }
        }

        if (canSeek) {
          $scope.player.seekTo(clip.startTime, true);

          if ($scope.player.getPlayerState() == YT.PlayerState.PLAYING) {
            // have to set a timeout here because we won't receive a 'PLAYING' event
            setTimeout($scope.checkCurrentTime, 100); // todo use settings val for timeout period
          } else {
            if ($scope.playstate.playUponCued) {
              $scope.player.playVideo();
            }
          }          
          
        } else {

          var videoInfo = {
            videoId: clip.videoSegmentId,
            startSeconds: clip.startTime,
            //endSeconds : clip.startTime + clip.duration,            
            suggestedQuality: 'default'
          };

          //cue clip
          $scope.player.cueVideoById(videoInfo);
          if ($scope.playstate.playUponCued) {
            console.log("playing video...");            
            $scope.player.playVideo();
          }

        }
      }
    }
  };

  $scope.currentClip = function() {
    var currClip = null;
    if ($scope.playlist.temp) {
      return $scope.playlist.temp;
    }

    if ($scope.playlist.items && $scope.playlist.position >= 0 && $scope.playlist.items.length > $scope.playlist.position) {
      currClip = $scope.playlist.items[$scope.playlist.position];
    }
    return currClip;
  };

  $scope.nextClip = function() {
    if ($scope.playlist.temp) {
      return null;
    }

    var nextClip = null;
    if ($scope.playlist.items && $scope.playlist.position >= 0 && $scope.playlist.items.length > $scope.playlist.position + 1) {
      nextClip = $scope.playlist.items[$scope.playlist.position + 1];
    }
    return nextClip;
  };

  $scope.toggleSlowMo = function() {
    console.log("available playback rates:  " + JSON.stringify($scope.player.getAvailablePlaybackRates()));
    if ($scope.player.getPlaybackRate() >= 1) {
      $scope.player.setPlaybackRate(0.25);
      $scope.slowMotionClasses = ["icon-enabled"];
    } else {
      $scope.player.setPlaybackRate(1.0);
      $scope.slowMotionClasses = [];
    }    
  };

  $scope.toggleKeepPlaying = function() {
    $scope.playstate.keepPlaying = !$scope.playstate.keepPlaying;
  };

  $scope.togglePlay = function() {
    if ($scope.player.getPlayerState() == YT.PlayerState.PLAYING) {
      $scope.player.pauseVideo();
    } else {
      $scope.player.playVideo();
    }
  };


  $scope.checkCurrentTime = function () {

    console.log("check current time");

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
              //console.log("nextClip.startTime: " + nextClip.startTime + "  currClip.startTime: " + currClip.startTime + "  currClip.duration: " + currClip.duration);

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
               $scope.$apply(function(){
                $scope.playlist.position = $scope.playlist.position + 1;                
              });
            } else {
              // we will keep rolling and thus must set the timeout manually because we won't get a 'PLAYING' event
              setTimeout($scope.checkCurrentTime, 100); // todo use settings val for timeout period
            }

            // we have queued our next clip one way or another, so we can return
            return;
          } 
        } 
        // there is no next video or 'keepPlaying' is not enabled
        $scope.player.pauseVideo();
        $scope.player.seekTo(currClip.startTime, true);
        
      } else {
        // set another timeout because we are not at the end of our clip
        setTimeout($scope.checkCurrentTime, 100); // todo use settings val for timeout period
      }              
    }
  };

  $scope.playerIdForPlaylistItem = function(index) {
    if ($scope.playlist && $scope.playlist.items && $scope.playlist.items.length > index) {
      return $scope.playlist.items[index].videoSegmentId + "__" + index;      
    } else {
      return null;
    }
  };

  $scope.newPlayerHandlers = function(index) {
    
    var checkTimeFunction = function(index) {
      var playerId = $scope.playerIdForPlaylistItem(index);
      var clip = $scope.playlist.items[index];

      if (!$scope.players[playerId].buffered) {

        console.log("checkTimeFunction");


        var currTime = $scope.players[playerId].getCurrentTime();

        if (currTime > clip.startTime + 1.5) { 
          // we have accomplished buffering...
          $scope.players[playerId].buffered = true;
          console.log("achieved buffered status");

          $scope.players[playerId].pauseVideo();
          $scope.players[playerId].seekTo(clip.startTime, true);
        } else {
          console.log("set timeout...");
          setTimeout(checkTimeFunction, 100);
        }
      }
    };

    return {

      onPlayerReady : function (event) {

        var playerId = $scope.playerIdForPlaylistItem(index);        
        var clip = $scope.playlist.items[index];

        var videoInfo = {
          videoId: clip.videoSegmentId,
          startSeconds: clip.startTime,
          endSeconds : clip.startTime + clip.duration,            
          suggestedQuality: 'default'
        };

        //cue clip
        $scope.players[playerId].cueVideoById(videoInfo);
        $scope.players[playerId].playVideo();

        if ($scope.playstate.playUponCued) {
          //console.log("playing video...");            
          //$scope.players[playerId].playVideo();
        }

        //$scope.updateForPlaylistPositionChange();
        /*
        $scope.playerIsReady = true;
        $scope.slowMotionAvailable = $scope.player.getAvailablePlaybackRates().length > 1;
        if ($scope.slowMotionAvailable) {
          console.log("slowMotion is available");
        }
        */
      },

      stateChangeFn : function(event) {
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
            checkTimeFunction(index);
            //$scope.checkCurrentTime();
            break;
          case YT.PlayerState.PAUSED:
            stateName = "PAUSED";
            break;
          case YT.PlayerState.BUFFERING:
            stateName = "BUFFERING";
            break;
          case YT.PlayerState.CUED:
            stateName = "CUED";
            /*
            if ($scope.playstate.playUponCued) {
              $scope.player.playVideo();
            }
            */
            break;
          default:
            stateName = "UNKNOWN";
        }
        console.log("YT.PlayerState:  " + stateName);
      }
    };
  };

  // this function is passed to the video player and will be called when the player is ready
  $scope.onPlayerReady = function (event) {
    $scope.playerIsReady = true;
    $scope.slowMotionAvailable = $scope.player.getAvailablePlaybackRates().length > 1;
    if ($scope.slowMotionAvailable) {
      console.log("slowMotion is available");
    }
  };

}