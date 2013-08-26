'use strict'

function YoutubeCtrl($scope, $http, YoutubeService) {

  // setup vars
  $scope.playPauseButtonName = "icon-youtube-play";


  var autoplay = false;
  var savedVolume;


  $scope.$on( 'YoutubeService.cueClip', function( event, clip ) {
    $scope.cueClip(clip, true);
  });


  $scope.cueClip = function(clip, playImmediately) {

    autoplay = playImmediately;

    var prevClip = $scope.currClip;
    $scope.currClip = clip;

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
      $scope.player.cueVideoById({
        videoId: clip.videoSegmentId,
        startSeconds: clip.startTime,
        endSeconds: clip.startTime + clip.duration,
        suggestedQuality: 'default'
      });
    }

    var sliderMin = Math.floor(clip.startTime);
    var sliderMax = Math.ceil(clip.startTime + clip.duration);
    var sliderValue = Math.floor(clip.startTime);

    $scope.slider.slider( "option", "min",  sliderMin);
    $scope.slider.slider( "option", "max", sliderMax);
    $scope.slider.slider("option", "value", sliderValue);
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
      $scope.updateUIForCurrentTime();
      if ($scope.player.getCurrentTime() > $scope.currClip.startTime + $scope.currClip.duration) {
        $scope.player.pauseVideo();
        $scope.cueClip($scope.currClip, false);
      }
    }
  };

  $scope.updateUIForCurrentTime = function () {
    var currentTime = $scope.player.getCurrentTime(); 
    $scope.slider.slider( "value", currentTime);
    //console.log("currentTime:  " + currentTime);
  };

  $scope.sliderChanged = function( event, ui ) {
    var newSliderValue = $scope.slider.slider("option", "value");
    console.log("Slider value: " + newSliderValue);
    $scope.pauseVideo();
    $scope.player.seekTo(newSliderValue, true); // should be false unless the mouse is up...
  };

	// this function is passed to the video player and will be called when the player is ready
  $scope.onPlayerReady = function (event) {
    console.log("player is ready");
    YoutubeService.playerIsReady = true;

  	//event.target.playVideo();
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
                $scope.playPauseButtonName = "icon-pause";
                break;
          case YT.PlayerState.PAUSED:
                stateName = "PAUSED"; 
                $scope.playPauseButtonName = "icon-youtube-play";
                break;
          case YT.PlayerState.BUFFERING:
                stateName = "BUFFERING";
                $scope.playPauseButtonName = "icon-spinner";
                break;
          case YT.PlayerState.CUED:
                $scope.player.seekTo($scope.currClip.startTime, true);
                stateName = "CUED";
                $scope.playPauseButtonName = "icon-youtube-play";
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
    $scope.$apply();

    console.log("YT.PlayerState:  " + stateName);
                 
  }

}