'use strict';

function VideoPlayerCtrl($scope, $window) {


  $scope.numBufferedPlayers = 5;

  $scope.players = {};

  $scope.idlePlayers = new HashSet();


  $scope.newPlaylistItem = function() {
    var parent = this;

    this.checkCurrentTime = function() {

    };

  };

  $scope.dispatchPlayerEvent = function(playerEvent) {

    var playerId = playerEvent.target.i.id;

    for (var i = 0; i < $scope.playlist.items.length; i++) {
      if ($scope.playlist.items[i].player && $scope.playlist.items[i].player.playerId == playerId) {
        console.log("time to do something. we found a playlistItem that has playerId: " + playerId);
      }
    }
  };

  // =================================================================
  // Watch functions
  // =================================================================

  $scope.$watch('playlist.position', function(newVal, oldVal) {
    if (typeof(newVal) != 'undefined') {

    }
  }, true);


  $scope.$watch('playlist.items', function(newVal, oldVal) {
    if (newVal && newVal.length > 0) {
      console.log("new value added to playlist items");
      var clip = $scope.playlist.items[0];

      if ($scope.idlePlayers.size() > 0) {
        var player = $scope.idlePlayers.values()[0];

        var videoInfo = {
          videoId: clip.videoSegmentId,
          startSeconds: clip.startTime,
          endSeconds : clip.startTime + clip.duration,            
          suggestedQuality: 'default'
        };

        player.cueVideoById(videoInfo);
        player.playVideo();
      }

    }
  }, true);

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