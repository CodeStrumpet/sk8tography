'use strict';

angular.module('myApp.directives')

.directive('videoScroller', function() {

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
});