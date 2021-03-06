'use strict';

angular.module('myApp.directives').

directive('youtubeVideoPlayer', function() {
  return {
    restrict: 'E',
    link: function(scope, elm, attrs, youtubeVideoCtrl) {

      if (typeof YT == 'undefined') {
        console.log("YT is undefined, not loading player");
        return;
      }

      var playerContainer = $("#player-container");

      scope.$watch('playlist.items', function(newVal, oldVal) {

        console.log("newVal.length: " + newVal.length + "  oldVal.length: " + oldVal.length);

        if (newVal && oldVal && newVal.length != oldVal.length) {
          for (var i = 0; i < newVal.length; i++) {
            console.log("new item added to playlist");

            var playerId = scope.playerIdForPlaylistItem(i);

            if (!scope.players[playerId]) {

              var handlers = scope.newPlayerHandlers(i);

              playerContainer.append("<div id='" + playerId + "' class=''></div>");                                          

              scope.players[playerId] = new YT.Player(playerId, {
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
                  'onReady': handlers.onPlayerReady,
                  'onStateChange': handlers.stateChangeFn
                }
              });
            }            
          }

        }

      }, true);

    },
    templateUrl: 'partials/youtubePlayer.jade',
    controller: YoutubeVideoCtrl,
    scope: {
      playlist : '=',   // array of clips
      playstate : '='  // {isPlaying : true, loopEnabled : true, playerState : "Buffering", currentTime : 103}
    }
  };
});