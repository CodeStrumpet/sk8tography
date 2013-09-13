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

      scope.tempPlayer = newPlayerWithId("tempPlayer", scope.tempPlayerReady, scope.tempPlayerEvent);

      scope.audio = $("#song").get(0);
      console.log(scope.audio);


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

        var newPlayer = newPlayerWithId(playerId, scope.onPlayerReady, scope.dispatchPlayerEvent);
        scope.players[playerId] = newPlayer;
        //scope.playlist.items[index].player = newPlayer;
      };

      function newPlayerWithId(playerId, readyHandler, stateChangeHandler) {
        return new YT.Player(playerId, {
          width: '640px',
          height: '385px',
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
            'onReady': readyHandler,
            'onStateChange': stateChangeHandler
          }
        });
      }
    },
    templateUrl: 'partials/videoPlayer.jade',
    controller: VideoPlayerCtrl,
    scope: {
      playlist : '=',   // array of clips
      playstate : '='  // {isPlaying : true, loopEnabled : true, playerState : "Buffering", currentTime : 103}
    }
  };
});