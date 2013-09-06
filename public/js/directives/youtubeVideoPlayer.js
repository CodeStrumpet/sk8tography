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

      for (var j = 0; j < playerContainer.children().length; j++) {
        if (j >= scope.players.length) {
          console.log("we have more player divs then we currently support...");
          continue;
        }


        scope.players[j].player = new YT.Player(playerContainer.children()[j], {
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
            'onStateChange': scope.players[j].stateChange
          }
        });
      }
      scope.player = scope.players[0].player;

    },
    templateUrl: 'partials/youtubePlayer.jade',
    controller: YoutubeVideoCtrl,
    scope: {
      playlist : '=',   // array of clips
      playstate : '='  // {isPlaying : true, loopEnabled : true, playerState : "Buffering", currentTime : 103}
    }
  };
});