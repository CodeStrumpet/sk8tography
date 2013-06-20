'use strict'

function YoutubeCtrl($scope, $http, YoutubeService) {

  // setup vars
  $scope.playPauseButtonName = "Play";


  var autoplay = false;
  var savedVolume;


  $scope.$on( 'YoutubeService.cueClip', function( event, clip ) {
    $scope.cueClip(clip, true);
  });


  $scope.cueClip = function(clip, playImmediately) {

    autoplay = playImmediately;

    $scope.currClip = clip;

    $scope.player.cueVideoById({
          videoId: clip.videoId,
          startSeconds: clip.startTime,
          endSeconds: clip.startTime + clip.duration,
          suggestedQuality: 'default'
    });         
    $scope.slider.slider( "option", "min", clip.start_time );
    $scope.slider.slider( "option", "max", clip.end_time );
    $scope.slider.slider("option", "value", clip.start_time);
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

  $scope.setPlayPauseButtonNameForCurrentState = function() {
    if ($scope.player.getPlayerState() == YT.PlayerState.PLAYING || $scope.player.getPlayerState() == YT.PlayerState.BUFFERING) {
      $scope.playPauseButtonName = "Pause";      
    } else {
      $scope.playPauseButtonName = "Play";      
    }
    $scope.$apply();            
  }

  $scope.checkCurrentTime = function () {
    if ($scope.player.getPlayerState() == YT.PlayerState.PLAYING) {                                   
      setTimeout($scope.checkCurrentTime, 100);
      $scope.updateUIForCurrentTime();
    }
  };

  $scope.updateUIForCurrentTime = function () {
    var currentTime = $scope.player.getCurrentTime(); 
    $scope.slider.slider( "value", currentTime);
    console.log("currentTime:  " + currentTime);
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