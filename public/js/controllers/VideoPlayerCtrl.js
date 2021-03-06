'use strict';

function VideoPlayerCtrl($scope, $window, $timeout) {


  $scope.numBufferedPlayers = 5;

  $scope.players = {};



  $scope.playerIdForPlaylistItem = function(index) {
    if ($scope.playlist && $scope.playlist.items && $scope.playlist.items.length > index) {
      console.log($scope.playlist.items[index]);
      return $scope.playlist.items[index]._id;
    } else {
      return null;
    }
  };

  $scope.currentPlaylistItem = function() {
    console.log("currentPlaylistItem");
    if ($scope.playlist.position >= 0 && $scope.playlist.items.length > $scope.playlist.position) {
      return $scope.playlist.items[$scope.playlist.position];
    }
    return null;
  };


  // =================================================================
  // Player Event Functions
  // =================================================================


  $scope.onPlayerReady = function(event) {
    var playerId = event.target.i.id;

    $scope.players[playerId].isReady = true;

    // Figure out what index the player is at.
    // If the index is within our range of numBufferedPlayers, we buffer this player

    var index = -1;
    for (var i = 0; i < $scope.playlist.items.length; i++) {
      if ($scope.playlist.items[i]._id == playerId) {
        index = i;
        break;
      }
    }

    if (index >= 0) {
      var position = $scope.playlist.position;
      if (position < 0) {
        position = 0;
      }
      if (index >= position && index < position + $scope.numBufferedPlayers) {
        bufferPlayerForPlaylistItem(index);
      }
    }

    //console.log($scope.players[playerId]);
  };


  $scope.dispatchPlayerEvent = function(playerEvent) {

    var playerId = playerEvent.target.i.id;

    var playlistItem = null;
    var isUserPlayer = false;
    for (var i = 0; i < $scope.playlist.items.length; i++) {
      if ($scope.playlist.items[i]._id == playerId) {
        var playlistItem = $scope.playlist.items[i];
        if (i == $scope.playlist.position) {
          isUserPlayer = true;
        }
        break;
      }
    }
    if (playlistItem) {      
      var stateName = "";
      switch(playerEvent.data) {
        case -1:
              stateName = "UNSTARTED";
              break;
        case YT.PlayerState.ENDED:
              stateName = "ENDED";      
              // recue the video if we ever get to the ended state        
              // todo: also rebuffer!!
              $scope.players[playlistItem._id].cueVideoById(videoInfoForClip(playlistItem));

              // if (!playlistItem.buffering) { // make sure we didn't reach the end of the video during buffering...
              //   if ($scope.playlist.items.length > $scope.playlist.position + 1) {
                  
              //     // apply the position change...
              //     $scope.$apply(function () {
              //       $scope.playlist.position = $scope.playlist.position + 1; 
              //     });
              //   }
              // }
              break;
        case YT.PlayerState.PLAYING:                
              stateName = "PLAYING";              
              checkCurrentClipTime(playlistItem);
              if (isUserPlayer && $scope.audio.paused) {
                $scope.audio.play();
              }              
              break;
        case YT.PlayerState.PAUSED:
              stateName = "PAUSED"; 
              if (isUserPlayer) {
                $scope.audio.pause();
              }
              break;
        case YT.PlayerState.BUFFERING:
              stateName = "BUFFERING";
              break;
        case YT.PlayerState.CUED:
              break;
        default:
              stateName = "UNKNOWN";
      }
      console.log("player: " + playerId + "  state: " + stateName );
    }
  };

  $scope.tempPlayerReady = function(event) {

  };

  $scope.tempPlayerEvent = function(playerEvent) {
    var stateName = "";
    switch(playerEvent.data) {
      case -1:
            stateName = "UNSTARTED";
            break;
      case YT.PlayerState.ENDED:
            stateName = "ENDED";      
            // recue the video if we ever get to the ended state        
            // todo: also rebuffer!!
            $scope.tempPlayer.cueVideoById(videoInfoForClip($scope.playlist.temp));
            break;
      case YT.PlayerState.PLAYING:                
            stateName = "PLAYING";              
            break;
      case YT.PlayerState.PAUSED:
            stateName = "PAUSED"; 
            break;
      case YT.PlayerState.BUFFERING:
            stateName = "BUFFERING";
            break;
      case YT.PlayerState.CUED:
            break;
      default:
            stateName = "UNKNOWN";
    }
    console.log("temp player state change: " + stateName);
  };



  // =================================================================
  // Scope Watch functions
  // =================================================================

  $scope.$watch('playlist.position', function(newVal, oldVal) {

    if ($scope.ignorePlaylistChange) {
      return;
    }
    
    if (typeof(newVal) != 'undefined') {

      for (var j = 0; j < $scope.playlist.items.length; j++) {

        var item = $scope.playlist.items[j];
        if (j != newVal) {
          $('#' + item._id).addClass('hide-me');
          $('#' + item._id).removeClass('show-me');
        } else {
          $('#' + item._id).removeClass('hide-me');
          $('#' + item._id).addClass('show-me'); 
        }

        //$('.icon-trash').removeClass('hide-me').addClass('show-me');
      }      

      if (newVal >= 0 && !$scope.playlist.pause) {
        // play video at new position...
        playVideoAtCurrentPosition();
      }


      var position = newVal;
      if (position < 0) {
        position = 0;
      } else {
        // set temp to null
        $scope.playlist.temp = null;
      }

      for (var i = position; position < position + $scope.numBufferedPlayers; i++) {
        if (i >= $scope.playlist.items.length) {
          // we have more buffered players than we have playlist items
          break;
        }
        //console.log("new value added to playlist items. about to buffer player for item: " + i);                
        bufferPlayerForPlaylistItem(i);
      }
    }
  }, true);


  $scope.$watch('playlist.items', function(newVal, oldVal) {

    if ($scope.ignorePlaylistChange) {
      return;
    }

    if (newVal && newVal.length > 0) {

      var position = $scope.playlist.position;
      if (position < 0) {
        position = 0;
      }

      for (var i = 0; i < $scope.playlist.items.length; i++) {        
        addPlayerForPlaylistItem(i);  // a player will not be added if it already exists
      }
    }

    if (newVal && oldVal && newVal.length < oldVal.length) {
      for (var i = 0; i < oldVal.length; i++) {
        var valuePresent = false;
        for (var j = 0; j < newVal.length; j++) {
          
          if (newVal[j]._id == oldVal[i]._id) {
            valuePresent = true;
          }
        }
        // didn't find the value, so remove it...
        if (!valuePresent) {
          $scope.removePlayerForClip(oldVal[i]);
        }
      }
    }

  }, true);

  $scope.$watch('playlist.temp', function(newVal, oldVal) {

    if ($scope.ignoreTemp) {
      $scope.ignoreTemp = false;             
      return;
    }

    if (newVal && typeof(newVal) != 'undefined') {
      console.log("observed a temp video change");

      $scope.playlist.position = -1;

      $scope.tempPlayer.cueVideoById(videoInfoForClip($scope.playlist.temp, true));
      $scope.tempPlayer.playVideo();


      $('#tempPlayer').removeClass('hide-me');
      $('#tempPlayer').addClass('show-me'); 
    } else {
      $('#tempPlayer').addClass('hide-me');
      $('#tempPlayer').removeClass('show-me');
    }


  });

  $scope.$watch('playlist.song', function(newVal, oldVal) {

    if ($scope.ignorePlaylistChange) {
      return;
    }

    if (newVal && typeof(newVal) != 'undefined') {
      var srcPath = "";
      if ($scope.audio.canPlayType('audio/mp3')) {
        srcPath = "./audio/" + newVal.fileNameMP3;
      } else {
        srcPath = "./audio/" + newVal.fileNameOGG;
      }

      $scope.audio.src = srcPath;
      console.log("set audio src: " + $scope.audio.src);
      $scope.audio.load();
    };
  });


  $scope.$watch('audio.networkState', function(newVal, oldVal) {
    console.log("audio network state change: " + newVal);
  });

  $scope.$watch('playlist.clearAllItems', function(newVal, oldVal) {
    if ($scope.playlist.clearAllItems == 1) { 
      clearEntirePlaylist();
      $scope.playlist.clearAllItems = 0;
    }
  }, true);

  $scope.$watch('playlist.purgedItems', function(newVal, oldVal) {
    if (newVal && $scope.playlist.purgedItems.length > 0) { 
      for (var i = 0; i < $scope.playlist.purgedItems.length; i++) {
        console.log("remove player: " + $scope.playlist.purgedItems[i]._id);
      }
      $scope.playlist.purgedItems = null;
    }
  }, true);



  // =================================================================
  // Utility Functions
  // =================================================================

  function clearEntirePlaylist() {

    $scope.ignorePlaylistChange = true; // make sure playlist watch functions ignore upcoming playlist changes

    // remove all playlist items
    console.log("removing " + $scope.playlist.items.length + " items from playlist");
    for (var i = 0; i < $scope.playlist.items.length; i++) {
      $scope.removePlayerForClip($scope.playlist.items[i]);
    }
    $scope.playlist.items = [];

    $scope.playlist.song = null;
    $scope.playlist.position = -1;

    $scope.ignorePlaylistChange = false; // re-enable watch functions
  }

  function addPlayerForPlaylistItem(index) {
    if (!$scope.players[$scope.playlist.items[index]._id]) {
      $scope.initPlayerForPlaylistItem(index);
    }
  }

  function playVideoAtCurrentPosition() {
    console.log("currentPosition: " + $scope.playlist.position);

    var clip = $scope.playlist.items[$scope.playlist.position];

    clip.buffering = false;
    clip.buffered = true;

    var player = $scope.players[clip._id];

    player.seekTo(clip.startTime, true);
    player.playVideo();
    $scope.playlist.pause = false;

    // handle audio
    var totalPlayPosition = 0;
    for (var i = 0; i < $scope.playlist.position; i++) {
      totalPlayPosition += $scope.playlist.items[i].duration;
    }

    if ($scope.audio.duration > totalPlayPosition) {
      var timeSyncDiff = totalPlayPosition - $scope.audio.currentTime;
      console.log("currentTime: " + $scope.audio.currentTime + " totalPlayPosition: " + totalPlayPosition + " timeSyncDiff: " + timeSyncDiff);

      if (!$scope.audio.paused && Math.abs(timeSyncDiff) < 1.0) {
        // do nothing. audio is already playing, no need to seek...
        console.log("keep audio rolling...");
      } else {
        $scope.audio.currentTime = totalPlayPosition;
        $scope.audio.play();
      }

    } else {
      console.log("audio track is shorter than playlist");
    }


  }


  function bufferPlayerForPlaylistItem(index) {
    if ($scope.playlist.items.length <= index) {
      console.log("error: index out of range");
      return;
    }

    // don't buffer the current position...
    if ($scope.playlist.position == index) {
      return;
    }

    var clip = $scope.playlist.items[index];

    // don't buffer if the player is not ready...
    if (!$scope.players[clip._id].isReady) {
      console.log("player not yet ready for buffering...");
      return;
    }
    
    // don't buffer if the player is currently buffering or if it has already buffered
    if (clip.buffering || clip.buffered) {
      return;
    }

    console.log("buffer player for index: " + index);

    clip.buffering = true;
    var player = $scope.players[clip._id];
    var videoInfo = videoInfoForClip(clip);
    player.cueVideoById(videoInfo);
    player.mute();
    player.playVideo();
  }

  function videoInfoForClip(clip, includeEndSeconds) {

    var vidInfo = {
      videoId: clip.videoSegmentId,
      startSeconds: clip.startTime,      
      suggestedQuality: 'default'
    };

    if (includeEndSeconds) {
      vidInfo.endSeconds = clip.startTime + clip.duration;
    }
    
    return vidInfo;
  }

  function checkCurrentClipTime(clip) {
    var player = $scope.players[clip._id];

    if (!player) {
      console.log("player is null: " + clip._id);
      return;
    }

    if (clip.buffering) {
      // buffering playback      
      if (player.getCurrentTime() > clip.startTime + 1.5) { // use 1.5 as our current buffering interval
        console.log('finished buffering');
        clip.buffering = false;
        clip.buffered = true;
        player.pauseVideo();
        player.seekTo(clip.startTime, true);
      } else {
        $timeout(function() {
          checkCurrentClipTime(clip);
        }, 100);
      }      

    } else {
      // normal playback
      if (player.getCurrentTime() > clip.startTime + clip.duration) { 
        // make sure we are still the item at the current position (hopefully fixes bug where extra timeouts are called due to buffering during normal playback)
        if ($scope.playlist.items[$scope.playlist.position] == clip) {
          if ($scope.playlist.items.length > $scope.playlist.position + 1) {            
                  
            // apply the position change...
            $scope.$apply(function () {
              $scope.playlist.position = $scope.playlist.position + 1; 
            });
            player.pauseVideo();
          } else {
            // playlist is complete. pause that shut
            player.pauseVideo();
          }
        } else {
          console.log("ignoring extra timeout call!!!");
        }
      } else {
        $timeout(function() {
          checkCurrentClipTime(clip);
        }, 100);
      }
    }
  }


}