'use strict'

function AddNewSongCtrl($scope, $http, $location, $routeParams, $injector, $window, $dialog, SocketConnection, StringHelperService) {

  var consts = $window.Constantsinople;

  $scope.files = [];

  $scope.newSong = {
    title: "",
    artist: ""
  };

  $scope.tabs = [ 
    { title:"Upload File", active: true},
    { title:"Soundcloud"}
  ];

  $scope.addNewSong = function() {

    if (!$scope.addSongButtonEnabled) {
      return;
    }

    if ($scope.files.length <= 0) {
      return;
    }



    var fd = new FormData()

    var filesInfo = [];
    if ($scope.files.length > 1) {

      for (var i in $scope.files) {

          fd.append("uploadedFiles", $scope.files[i]);
          filesInfo.push($scope.files[i].fileInfo);
      }      
    } else {
      fd.append("uploadedFile", $scope.files[0]);
      filesInfo.push($scope.files[0].fileInfo);
    }

    fd.append("filesInfo", JSON.stringify(filesInfo));

    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", uploadProgress, false);
    xhr.addEventListener("load", uploadComplete, false);
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
    xhr.open("POST", "/api/uploadSongs");
    $scope.progressVisible = true;
    xhr.send(fd);
  };

  $scope.addSongButtonEnabled = function() {
    var valid = true;
    
    for (var i = 0; i < $scope.files.length; i++) {
      if (!$scope.files[i].fileInfo || !$scope.files[i].fileInfo.title || !$scope.files[i].fileInfo.artist) {
        valid = false;
      } else {
        if ($scope.files[i].fileInfo.title.length <= 0 || $scope.files[i].fileInfo.artist.length <= 0) {
          valid = false;
        }
      }
    }

    return $scope.files.length > 0 && valid;
  };


   $scope.setFiles = function(element) {
    $scope.$apply(function() {
      console.log('files:', element.files);
      // Turn the FileList object into an Array
      $scope.files = []
      for (var i = 0; i < element.files.length; i++) {        
        $scope.files.push(element.files[i]);
      }
      $scope.progressVisible = false
    });
  };

  function uploadProgress(evt) {
    $scope.$apply(function(){
      if (evt.lengthComputable) {
        $scope.progress = Math.round(evt.loaded * 100 / evt.total)
      } else {
        $scope.progress = 'unable to compute'
      }
    });
  }

  function uploadComplete(evt) {
      /* This event is raised when the server send back a response */
      //alert(evt.target.responseText)
      console.log(evt.target.responseText);
  }

  function uploadFailed(evt) {
      console.log("There was an error attempting to upload the file.");
  }

  function uploadCanceled(evt) {
    $scope.$apply(function(){
      $scope.progressVisible = false
    });
    console.log("The upload has been canceled by the user or the browser dropped the connection.")
  }

}