'use strict';

angular.module('myApp.directives').

directive('updateClip', function() {
  return {
    restrict: 'E',
    link: function(scope, elm, attrs, updateClipCtrl) {
      
    },
    templateUrl: 'partials/updateClip.jade',
    controller: UpdateClipCtrl,
    scope: {
      clip : '='   
    }
  };
});