'use strict';

angular.module('myApp.directives').

directive('dropFileBox', function() {
  return {

    restrict: 'E',
    link: function(scope, elm, attrs, DropFileCtrl) {
      //============== DRAG & DROP =============
      // source for drag&drop: http://www.webappers.com/2011/09/28/drag-drop-file-upload-with-html5-javascript/
      var dropbox = document.getElementById("dropbox");

      scope.dropText = 'Drop files here...';

      // init event handlers
      function dragEnterLeave(evt) {
          evt.stopPropagation()
          evt.preventDefault()          
          scope.$apply(function(){
              scope.dropText = 'Drop files here...'
              scope.dropClass = ''
          })          
      }
      
      dropbox.addEventListener("dragenter", dragEnterLeave, false)
      dropbox.addEventListener("dragleave", dragEnterLeave, false)
      dropbox.addEventListener("dragover", function(evt) {
          evt.stopPropagation()
          evt.preventDefault()
          var clazz = 'not-available'
          var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0
          scope.$apply(function(){
              scope.dropText = ok ? 'Drop files here...' : 'Only files are allowed!'
              scope.dropClass = ok ? 'dropboxover' : 'not-available'
          })
      }, false)
      dropbox.addEventListener("drop", function(evt) {
          console.log('drop evt:', JSON.parse(JSON.stringify(evt.dataTransfer)))
          evt.stopPropagation()
          evt.preventDefault()
          scope.$apply(function(){
              scope.dropText = 'Drop files here...'
              scope.dropClass = ''
          })
          var files = evt.dataTransfer.files
          if (files.length > 0) {
              scope.$apply(function() {
                  scope.files = [];
                  for (var i = 0; i < files.length; i++) {
                    if (files[i].name.split('.').pop() === 'mp3') {
                      scope.files.push(files[i]);
                    } else {
                      alert("only mp3s allowed at this time");
                    }                      
                  }
              })
          }
      }, false)
      //============== DRAG & DROP =============
     
    },
    templateUrl: 'partials/dropfilebox.jade',
    scope: {
      files : '='   
    }
  };
});