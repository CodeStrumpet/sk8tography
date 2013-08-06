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

      var drag = d3.behavior.drag()
        .on("drag", function(d,i) {
          console.log("drag: " + d3.event.dx + ", " + d3.event.dy);

          var translateAmount = d3.event.dx * scope.val.scale;
          scrollerGroup
            .attr("transform", "translate(" + translateAmount.toString() + ",0)");

          /*
          d.x += d3.event.dx
          d.y += d3.event.dy
          d3.select(this).attr("transform", function(d,i){
            return "translate(" + [ d.x,d.y ] + ")"
          })
          */
        });




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

        //scrollerGroup.call(drag);

        var move = function() {

          var amount = d3.event.x;
          d3.select(this)
            .attr("transform", "translate(" + amount + "," + 0 + ")");
        }

        var drag = d3.behavior.drag().origin(function() {
          var t = d3.select(this);
          return {x: t.attr("x") + d3.transform(t.attr("transform")).translate[0],
            y: t.attr("y") + d3.transform(t.attr("transform")).translate[1]};
        }).on("drag", move);

        scrollerGroup.call(drag);





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



