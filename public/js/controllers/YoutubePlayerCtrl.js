'use strict';

function YoutubePlayerCtrl($scope, YoutubeService) {
  console.log("YoutubePlayerCtrl");

  var autoplay = false;
  var savedVolume;

  $scope.$on( 'YoutubeService.cueClip', function( event, clip ) {
    $scope.cueClip(clip, true);
  });

  $scope.$on( 'YoutubeService.cueSegment', function( event, segment ) {
    $scope.cueSegment(segment, true);
  });

  $scope.$on('YoutubeService.pause', function(event) {
    $scope.pauseVideo();
  });

  $scope.$on('YoutubeService.seekVideo', function(event, desiredTime, resumePlaying) {
    $scope.player.seekTo(desiredTime, true);
    $scope.player.playVideo();
  });

  $scope.cueClip = function(clip, playImmediately) {

    autoplay = playImmediately;

    if (! YoutubeService.playerIsReady) {
      $scope.pendingClip = clip;
      console.log("player not ready yet");
      return;
    }

    var prevClip = $scope.currClip;
    $scope.currClip = clip;

    if (prevClip && prevClip.videoSegmentId == clip.videoSegmentId) {

      // don't recue video if it hasn't changed (fixes a youtube bug)
      $scope.pauseVideo();
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
      console.log("called cueVideoById...");
    }
  }

  $scope.cueSegment = function(segment, playImmediately) {

    autoplay = playImmediately;    

    if (! YoutubeService.playerIsReady) {
      $scope.pendingSegment = segment;
      console.log("player not ready yet");
      return;
    }

    var prevSegment = $scope.currSegment;
    $scope.currSegment = segment;

    if (prevSegment && prevSegment._id == segment._id) {

      // don't recue video if it hasn't changed (fixes a youtube bug)
      $scope.player.seekTo(0, true);

      // explicitly pause video if we aren't playing immediately
      if (!playImmediately) {
        $scope.pauseVideo();
      } else {
        $scope.playVideo();
      }

    } else {

      var videoInfo = {
        videoId: segment._id,
        startSeconds: 0,
        endSeconds: segment.sourceDuration,
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

      var currTime = $scope.player.getCurrentTime();
      // forcibly end the video if we have gone past the clip duration
      if ($scope.currClip && currTime > $scope.currClip.startTime + $scope.currClip.duration) {
        $scope.player.pauseVideo();
        $scope.cueClip($scope.currClip, false);
      } else {
        // update the service with the current time
        YoutubeService.timeUpdated(currTime);
        setTimeout($scope.checkCurrentTime, 100);
      }
    }
  };

  // this function is passed to the video player and will be called when the player is ready
  $scope.onPlayerReady = function (event) {
    YoutubeService.playerIsReady = true;
    if ($scope.pendingClip) {
      console.log("already have clip on deck");
      $scope.cueClip($scope.pendingClip, autoplay);
    } else if ($scope.pendingSegment) {
      console.log("already have segment on deck");
      $scope.cueSegment($scope.pendingSegment, autoplay);
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
        if ($scope.currClip) {
          $scope.cueClip($scope.currClip, false);
        } else if ($scope.currSegment) {
          $scope.cueSegment($scope.currSegment, false);
        }
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
        if ($scope.currClip) {
          $scope.player.seekTo($scope.currClip.startTime, true);
        }
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