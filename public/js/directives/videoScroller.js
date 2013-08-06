'use strict';

angular.module('myApp.directives')

.directive('videoScroller', function() {

  var initialized
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

      var height = 200;
      var fullScrollWidth = 0;
      var scrollerGroup = null;

      var vis = d3.select(element[0])
        .append("svg")
        .attr("width", '100%')
        .attr("height", height)
        .style("background-color", '#FF0');




      scope.$watch('val.duration', function(newVal, oldVal) {

        if (!newVal) {
          console.log("newVal not set");
          return;
        }

        width = element.width();

        console.log("segmentParams changed.  width: " + width);

        vis.selectAll('*').remove();

        scrollerGroup = vis.append('g');

        fullScrollWidth = scope.val.duration * scope.val.scale;

        scrollerGroup.append("rect")
          .attr("x", width / 2 - scope.val.currentTime)
          .attr("y", height / 4)
          .attr("width", fullScrollWidth)
          .attr("height", height / 2);


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

      scope.$watch('val.clips', function(newVal, oldVal) {

        if (!newVal) {
          console.log("newVal not set");
          return;
        }

        console.log("clips updated");

        var horizPadding = 5;

        var clips = scrollerGroup.selectAll('rect')
          .data(scope.val.clips)
          .enter()
          .append('rect')
          .attr('x', function(clip) {
            console.log("clip startTime: " + clip.startTime);
            var relativePositionX = clip.startTime / scope.val.duration;
            return width / 2 + relativePositionX * fullScrollWidth + horizPadding;
          })
          .attr('y', 75)
          .attr("width", function(clip) {
            return Math.abs(clip.duration) * scope.val.scale - 2 * horizPadding;
          })
          .attr("height", 20)
          .style("fill", "blue");

//        clips.attr('x', function(clip) {
//            var relativePositionX = clip.startTime / scope.val.duration;
//            return relativePositionX * fullScrollWidth;
//          })
          //clips

      });

      scope.$watch('val.currentTime', function(newVal, oldVal) {

        // don't do anything if nothing has updated or if the segmentParams have not yet been initialized
        if (!newVal || scope.val.duration <= 0) {
          return;
        }

        var percentComplete = scope.val.currentTime / scope.val.duration;

        var translateAmount = - fullScrollWidth * percentComplete;
        scrollerGroup
          .transition()
          .attr("transform", "translate(" + translateAmount.toString() + ",0)");
      });


      // event handlers
      $( window ).on("resize.bnViewport", function( event ) {
          width = element.width();
          console.log("vis width: " + width);
        }
      );

      // When the scope is destroyed, be sure to unbind
      // event handler can cause issues.
      scope.$on("$destroy", function() {
          $( window ).off( "resize.bnViewport" );
        }
      );


    }
  };
});



