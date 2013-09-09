'use strict';

angular.module('myApp.directives').

directive('videoPlayer', function() {
  return {

    restrict: 'E',
    link: function(scope, elm, attrs, videoPlayerCtrl) {

      // Only using youtube right now...
      if (typeof YT == 'undefined') {
        console.log("YT is undefined, not loading player");
        return;
      }

      scope.removePlayerForClip = function(clip) {
        var playerElement = $("#" + clip._id);        
        if (playerElement) {
          console.log('removing player with id: ' + clip._id);
          // remove the dom element
          playerElement.remove();          
        }
        // also nullify the reference to the player
        scope.players[clip._id] = null;
      };

      scope.initPlayerForPlaylistItem = function(index) {
        console.log("initPlayerForPlaylistItem...");
        var playerId = scope.playerIdForPlaylistItem(index);

        var playerContainer = $("#player-container");
        playerContainer.append("<div id='" + playerId + "' class='hide-me' ng-show='playerIsWithCurrentPlaylistItem(" + playerId + ")' " + "></div>");

        var newPlayer = new YT.Player(playerId, {
                width: '100%',
                videoId: '',
                playerVars: {
                  controls: '0',                             // don't show video controls in the player
                  showinfo: '0',                             // don't show the title of the video upon hover etc.
                  modestbranding: '1',                       // minimal branding
                  rel: '0',                                  // don't show related videos when the video ends
                  theme: 'light',                            // light or dark theme
                  origin: 'http://localhost:8080',           // should be your domain
                  iv_load_policy: '3',                       // don't show video annotations by default
                  enablejsapi: '1',
                  html5: '1'
                },
                events: {
                  'onReady': scope.onPlayerReady,
                  'onStateChange': scope.dispatchPlayerEvent
                }
              });     
        scope.players[playerId] = newPlayer;
        //scope.playlist.items[index].player = newPlayer;
      };
      /*
      var playerContainer = $("#player-container");
      for (var i = 0; i < playerContainer.children().length; i++) {
        var child = playerContainer.children()[i];

        var newPlayer = new YT.Player(child.id, {
                width: '100%',
                videoId: '',
                playerVars: {
                  controls: '0',                             // don't show video controls in the player
                  showinfo: '0',                             // don't show the title of the video upon hover etc.
                  modestbranding: '1',                       // minimal branding
                  rel: '0',                                  // don't show related videos when the video ends
                  theme: 'light',                            // light or dark theme
                  origin: 'http://localhost:8080',           // should be your domain
                  iv_load_policy: '3',                       // don't show video annotations by default
                  enablejsapi: '1',
                  html5: '1'
                },
                events: {
                  'onReady': onReadyFunction,
                  'onStateChange': scope.dispatchPlayerEvent
                }
              });
        
        // set the id on the player so we can use it later
        newPlayer.playerId = child.id;

        scope.players[child.id] = newPlayer;
        scope.idlePlayers.push(newPlayer);

      }
      */
    },
    templateUrl: 'partials/videoPlayer.jade',
    controller: VideoPlayerCtrl,
    scope: {
      playlist : '=',   // array of clips
      playstate : '='  // {isPlaying : true, loopEnabled : true, playerState : "Buffering", currentTime : 103}
    }
  };
});