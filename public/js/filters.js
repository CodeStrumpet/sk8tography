'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }])
  .filter('minutes', function () {
    return function (seconds) {
      var minutes = Math.floor(seconds / 60);
      var seconds = seconds - minutes * 60;

      return minutes.toString() + ":" + seconds.toString();
    }
  });
