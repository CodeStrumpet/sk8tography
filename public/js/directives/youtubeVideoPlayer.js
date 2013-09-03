'use strict';

angular.module('myApp.directives').

directive('youtubeVideoPlayer', function() {
  return {
    restrict: 'E',
    link: function(scope, elm, attrs, youtubeVideoCtrl) {
      console.log("youtube video player function");

      if (typeof YT == 'undefined') {
        console.log("YT is undefined, not loading player");
        return;
      }

      scope.player = new YT.Player('player', {
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
          'onStateChange': scope.onPlayerStateChange
        }
      });
    },
    templateUrl: 'partials/youtubePlayer.jade',
    controller: YoutubeVideoCtrl,
    scope: {
      playlist : '=',   // array of clips
      playState : '='  // {isPlaying : true, loopEnabled : true, playerState : "Buffering", currentTime : 103}
    }
  };
});

/*
 playlist : '=',   // array of clips
 playState : '=',  // {isPlaying : true, loopEnabled : true, playerState : "Buffering", currentTime : 103}
 currClipIndex : '='
*/