'use strict';

function VideoPlayerCtrl($scope, $window, $timeout) {


  $scope.numBufferedPlayers = 5;

  $scope.players = {};

  $scope.idlePlayers = [];


  $scope.newPlaylistItem = function() {
    var parent = this;

    this.checkCurrentTime = function() {

    };

  };

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
    for (var i = 0; i < $scope.playlist.items.length; i++) {
      if ($scope.playlist.items[i]._id == playerId) {
        var playlistItem = $scope.playlist.items[i];
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
      console.log("player: " + playerId + "  state: " + stateName );
    }
  };

  function checkCurrentClipTime(clip) {
    var player = $scope.players[clip._id];

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


  // =================================================================
  // Watch functions
  // =================================================================

  $scope.$watch('playlist.position', function(newVal, oldVal) {
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

  function playVideoAtCurrentPosition() {
    console.log("currentPosition: " + $scope.playlist.position);
    var clip = $scope.playlist.items[$scope.playlist.position];

    clip.buffering = false;
    clip.buffered = true;

    var player = $scope.players[clip._id];

    player.seekTo(clip.startTime, true);
    player.playVideo();
    $scope.playlist.pause = false;
  }


  $scope.$watch('playlist.items', function(newVal, oldVal) {
    if (newVal && newVal.length > 0) {

      var position = $scope.playlist.position;
      if (position < 0) {
        position = 0;
      }

      for (var i = 0; i < $scope.playlist.items.length; i++) {        
        addPlayerForPlaylistItem(i); 
      }
    }
  }, true);

  function addPlayerForPlaylistItem(index) {
    if (!$scope.players[$scope.playlist.items[index]._id]) {
      $scope.initPlayerForPlaylistItem(index);
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


    /*
    if (!$scope.playlist.items[index].player) {
      $scope.initPlayerForPlaylistItem(index);
      return;

      if ($scope.idlePlayers.length <= 0) {
        console.log("no available players to buffer with!!!");
        return;
      }

      console.log("numIdlePlayers: " + $scope.idlePlayers.length);
      var idlePlayer = $scope.idlePlayers[0];
      $scope.idlePlayers.remove(0);
      console.log("numIdlePlayers: " + $scope.idlePlayers.length);
      $scope.playlist.items[index].player = idlePlayer;
    }
    */
  }

  function videoInfoForClip(clip) {
    return {
      videoId: clip.videoSegmentId,
      startSeconds: clip.startTime,
      //endSeconds : clip.startTime + clip.duration,            
      suggestedQuality: 'default'
    };
  }



  $scope.playerIdForPlaylistItem = function(index) {
    if ($scope.playlist && $scope.playlist.items && $scope.playlist.items.length > index) {
      console.log($scope.playlist.items[index]);
      return $scope.playlist.items[index]._id;
    } else {
      return null;
    }
  };







//  function updatePlaylistPlayers
  function releaseUnusedPlayers() {
    // don't do anything if the playlist position has not been set
    if ($scope.playlist.position < 0) {
      return;
    }

    for (var i = 0; i < $scope.playlist.items.length; i++) {

      // only release a player if the item has a player
      if ($scope.playlist.items[i].player) {
        var shouldHavePlayer = shouldPlaylistItemHavePlayer(i);

        // if the playlist item should not have a player, we return it to the idle players pool and clear the reference
        if (!shouldHavePlayer) {
          $scope.idlePlayers.add($scope.playlist.items[i].player);
          $scope.playlist.items[i].player = null;
        }
      }
    }
  };

  function shouldPlaylistItemHavePlayer(playlistItemPosition) {
    var shouldHavePlayer = true;

    if ($scope.playlist.position > playlistItemPosition ) {
      shouldHavePlayer = false;
    } else if ($scope.playlist.position < playlistItemPosition - $scope.numBufferedPlayers) {
      shouldHavePlayer = false;
    }
    return shouldHavePlayer;
  }

  $scope.playerIsWithCurrentPlaylistItem = function(playerId) {
    console.log("playlistIsWithCurrentPlaylistItem");

    var currPlaylistItem = $scope.currentPlaylistItem();
    if (currPlaylistItem && currPlaylistItem.player && currentPlaylistItem.player.id == playerId) {
      return true;
    }
    return false;
  };

  $scope.currentPlaylistItem = function() {
    console.log("currentPlaylistItem");
    if ($scope.playlist.position >= 0 && $scope.playlist.items.length > $scope.playlist.position) {
      return $scope.playlist.items[$scope.playlist.position];
    }
    return null;
  };




}