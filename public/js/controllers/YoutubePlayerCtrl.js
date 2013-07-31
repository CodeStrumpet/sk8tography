'use strict';

function YoutubePlayerCtrl($scope, YoutubeService) {
  console.log("YoutubePlayerCtrl");

  var autoplay = false;
  var savedVolume;

  $scope.$on( 'YoutubeService.cueClip', function( event, clip ) {
    $scope.cueClip(clip, true);
  });


  $scope.cueClip = function(clip, playImmediately) {

    autoplay = playImmediately;

    var prevClip = $scope.currClip;
    $scope.currClip = clip;

    if (! YoutubeService.playerIsReady) {
      console.log("player not ready yet");
      return;
    }

    if (prevClip && prevClip.videoSegmentId == clip.videoSegmentId) {

      // don't recue video if it hasn't changed (fixes a youtube bug)
      $scope.player.seekTo(clip.startTime, true);

      // explicitly pause video if we aren't playing immediately
      if (!playImmediately) {
        $scope.pauseVideo();
      } else {
        $scope.playVideo();
      }

    } else {

      var videoInfo = {
        videoId: clip.videoSegmentId,
        startSeconds: clip.startTime,
        endSeconds: clip.startTime + clip.duration,
        suggestedQuality: 'default'
      };

      console.log("videoInfo: " + JSON.stringify(videoInfo));

      $scope.player.cueVideoById(videoInfo);
    }
  }

  $scope.togglePlay = function() {
    if ($scope.player.getPlayerState() == YT.PlayerState.PAUSED || $scope.player.getPlayerState() == YT.PlayerState.CUED) {
      $scope.playVideo();
    } else {
      $scope.pauseVideo();
    }
  };

  $scope.pauseVideo = function() {
    $scope.player.pauseVideo();
  }

  $scope.playVideo = function() {
    $scope.player.playVideo();
  }

  $scope.checkCurrentTime = function () {
    if ($scope.player.getPlayerState() == YT.PlayerState.PLAYING) {
      setTimeout($scope.checkCurrentTime, 100);

      // forcibly end the video if we have gone past the clip duration
      if ($scope.player.getCurrentTime() > $scope.currClip.startTime + $scope.currClip.duration) {
        $scope.player.pauseVideo();
        $scope.cueClip($scope.currClip, false);
      }
    }
  };

  // this function is passed to the video player and will be called when the player is ready
  $scope.onPlayerReady = function (event) {
    YoutubeService.playerIsReady = true;
    if ($scope.currClip) {
      console.log("already have clip on deck");
      $scope.cueClip($scope.currClip, false);
    }
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
        autoplay = false;
        $scope.player.mute();
        $scope.cueClip($scope.currClip, false);
        break;
      case YT.PlayerState.PLAYING:
        stateName = "PLAYING";
        $scope.player.unMute();
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
        $scope.player.seekTo($scope.currClip.startTime, true);
        stateName = "CUED";
        if (autoplay) {
          $scope.playVideo();
          autoplay = false;
        } else {
          $scope.pauseVideo();
        }
        break;
      default:
        stateName = "UNKNOWN";
    }
    console.log("YT.PlayerState:  " + stateName);
  }
}