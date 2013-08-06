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
        	width: '100%', 
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
.directive('repeatDone', function() {
  return function(scope, element, attrs) {
    if (scope.$last) { // all are rendered
      scope.$eval(attrs.repeatDone);
    }
  }
})
.directive('loadThumbScroller', function () {
  return function ($scope, element, attrs) {
    //jQuery.noConflict();

    element.thumbnailScroller({
      scrollerType:"hoverPrecise",
      scrollerOrientation:"horizontal",
      scrollSpeed:2,
      scrollEasing:"easeOutCirc",
      scrollEasingAmount:600,
      acceleration:4,
      noScrollCenterSpace:10,
      autoScrolling:0,
      autoScrollingSpeed:2000,
      autoScrollingEasing:"easeInOutQuad",
      autoScrollingDelay:500
    });
  };
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
}).directive('structuredInput', function () {

    return {
      controller: ['$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude) { 

        var inputModel = $scope.inputs[$scope.$index];

        if (inputModel.typeahead) {                    
          $attrs.$set('typeahead', inputModel.typeahead);
        }

        // add min and max if necessary
        if (inputModel.min) {
          $attrs.$set('min', inputModel.min); 
        }
        if (inputModel.max) {
          $attrs.$set('max', inputModel.max);
        }

      }]
    };
  }).directive('onFocus', function() {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {        
      elm.bind('focus', function() {
        scope.$apply(attrs.onFocus);
      });
    }
  };        
}).directive('onBlur', function() {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      elm.bind('blur', function() {
        scope.$apply(attrs.onBlur);
      });
    }
  };        
}).directive('testVis', function() {

  // constants
  var margin = 20,
    width = 960,
    height = 500 - .5 - margin,
    color = d3.interpolateRgb("#f77", "#77f");

  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function(scope, element, attrs) {

      console.log("testVis directive");

      var dataset = [5,10,15,20,25];

      var vis = d3.select(element[0])
        .append("svg")
        .attr("width", width)
        .attr("height", height + margin + 100);

        /*
        .selectAll("p")
        .data(dataset)
        .enter()
        .append("p")
        .text("New paragraph!");
        */

      scope.$watch('val', function(newVal, oldVal) {
        
        vis.selectAll('*').remove();

        if (!newVal) {
          console.log("newVal not set");
          return;
        }

        var circles = vis.selectAll('circle')
          .data(newVal)
          .enter()
          .append('circle');

        circles.attr("cx", function(d, i) {
            return (i * 75) + 25;
          })
          .attr("cy", height / 2)
          .attr("r", function(d) {
            return d;
          });
      });
    }
  };


}).directive('youtubePlayer', function() {
  return {
    restrict: 'E',
    link: function(scope, elm, attrs, youtubePlayerCtrl) {
      console.log("youtube player function");

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
          origin: 'http://localhost:5000',           // should be your domain
          iv_load_policy: '3',                       // don't show video annotations by default
          enablejsapi: '1'
        },
        events: {
          'onReady': scope.onPlayerReady,
          'onStateChange': scope.onPlayerStateChange
        }
      });
    },
    templateUrl: 'partials/youtubePlayer.jade',
    controller: YoutubePlayerCtrl,
    scope: {}
  };
}).directive('mouseover', function() {
  return function(scope, element, attrs) {
    element.bind("mouseenter", function() {
       element.addClass(attrs.mouseover);
    });
    element.bind("mouseleave", function() {
      element.removeClass(attrs.mouseover);
    });
  }
 });

