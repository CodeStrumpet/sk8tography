'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('clipsLoaded', function() {  // this directive is a hack to get an event when the clips have loaded
		return function($scope, element, attrs) {
			if (!$scope.clipsAvailable) {
				$scope.clipsBecameAvailable();
			}
		}
	})
  .directive('loadYoutubePlayer', function() {
	return function($scope, element, attrs) {

		if (typeof YT == 'undefined') {
			console.log("YT is undefined, not loading player");
			return;
		}

        $scope.player = new YT.Player('player', {
        	height: '390',
        	width: '640',
              //width: '900',
              videoId: '',
              playerVars: {
              controls: '0',                             // don't show video controls in the player
              showinfo: '0',                             // don't show the title of the video upon hover etc.
              modestbranding: '1',                       // minimal branding
              rel: '0',                                  // don't show related videos when the video ends
              theme: 'light',                            // light or dark theme
              origin: 'http://localhost:5000',           // should be your domain
              iv_load_policy: '3',                       // don't show video annotations by default
              enablejsapi: '1'
          },
          events: {
          	'onReady': $scope.onPlayerReady,
          	'onStateChange': $scope.onPlayerStateChange
          }
      });

	};
})
.directive('loadScrubBar', function() {
	console.log("loadScrubBar");
	return function($scope, element, attrs) {
		// setup seekbar
        $scope.slider = $( "#scrubbar" ).slider({
        	range: "min",
            animate: true,
            slide: $scope.sliderChanged,
            step: .1
        });
	}
})
.directive('bsNavbar', function($location) {
  'use strict';

  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs, controller) {
      // Watch for the $location
      scope.$watch(function() {
        return $location.path();
      }, function(newValue, oldValue) {

        $('li[data-match-route]', element).each(function(k, li) {
          var $li = angular.element(li),
            // data('match-rout') does not work with dynamic attributes
            pattern = $li.attr('data-match-route'),
            regexp = new RegExp('^' + pattern + '$', ['i']);

          if(regexp.test(newValue)) {
            $li.addClass('active');
            $li.addClass('activeLink');
          } else {
            $li.removeClass('active');
            $li.removeClass('activeLink');
          }

        });
      });
    }
  };
});
