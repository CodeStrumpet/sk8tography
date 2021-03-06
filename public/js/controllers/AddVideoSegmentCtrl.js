'use strict'

function AddVideoSegmentCtrl($scope, $http, $location, $routeParams, $injector, $window, $dialog, SocketConnection, StringHelperService) {

  var consts = $window.Constantsinople;


  // helper function to find index of videoSegment based on _id
  $scope.indexOfVideoSegment = function(videoSegmentId) {
    var index = -1;
    for (var i = 0; i < $scope.videoSegments.length; i++) {
      if ($scope.videoSegments[i]._id == videoSegmentId) {
        index = i;
        break;
      }
    }
    return index;
  };


  // add Socket events
  SocketConnection.on('videoSegmentUpdated', function (data) {
    console.log("videoSegmentUpdated: " + JSON.stringify(data));

    var index = $scope.indexOfVideoSegment(data.videoSegment._id);

    if (index >= 0) {
      $scope.videoSegments[index] = data.videoSegment;
    } else {
      console.log("match for updated video segment not found. updating all video segments...");
      $scope.refreshVideoSegments();
    }
  });

  SocketConnection.on('videoDownloadStatus', function(data) {
    var index = $scope.indexOfVideoSegment(data.videoSegmentId);

    if (index >= 0) {
      $scope.videoSegments[index].percentComplete = data.percentComplete;
      $scope.videoSegments[index].timeRemaining = data.timeRemaining;
    }
    //console.log("videoDownloadStatus: " + JSON.stringify(data));
  });

  // use injector to inherit scope from InputBlockCtrl...
  $injector.invoke(InputBlockCtrl, this, {$scope: $scope});

  // model
  $scope.newVideoSegment = {
    valid : false
  };

  $scope.youtubeSearchQuery = "";

  $scope.videos = {};
  $scope.additionalInfoVisible = false;


  $scope.tabs = [ 
    { title:"Search Youtube", active: true},
    { title:"Enter URL"},
    { title:"Upload File"}
  ];


  $scope.parentVideoInput = {
    name : "Parent Video",
    value : "",
    type : "text",
    helpText : "optional: The video this segment comes from (e.g. \"Photosynthesis\")",
    typeahead : "value.name for value in getMatches($viewValue, $index)",
    typeaheadResults : [],
    selectedObj : null,
    entityName : "Video",
    templateUrl: 'partials/addNewVideo',
    controller: 'AddNewVideoCtrl',
    typeaheadFetch : function(searchText, successFunction) {

      var url = '/api/videos';
      if (searchText) {
        url = url + "?q=" + searchText;
      }

      console.log("url: " + url);

      return $http.get(url, {query : searchText}).then(function(response) {
        var videos = response.data.videos;
        return successFunction(videos);
      });
    }
  };

  $scope.skaterInput = {
    name : "Skater",
    value : "",
    type : "text",
    helpText : "optional: The skater who appears most often in this segment",
    typeahead : "value.name for value in getMatches($viewValue, $index)",
    typeaheadResults : [],
    selectedObj : null,
    entityName : "Skater",
    templateUrl: 'partials/addNewSkater',
    controller: 'AddNewSkaterCtrl',
    typeaheadFetch : function(searchText, successFunction) {

      var url = '/api/skaters';
      if (searchText) {
        url = url + "?q=" + searchText;
      }

      return $http.get(url, {query : searchText}).then(function(response) {
        var skaters = response.data.skaters;
        return successFunction(skaters);
      });
    }
  };

  // add inputs
  $scope.inputs.push($scope.skaterInput);
  $scope.inputs.push($scope.parentVideoInput);


  $scope.refreshVideoSegments = function() {
    $http.get('/api/videoSegments').
      success(function(data, status, headers, config) {
        $scope.videoSegments = data.videoSegments;
      });
  };

  $scope.refreshInputs = function() {
    $scope.newVideoSegment = {
      valid : false
    };

    // call InputBlockCtrl method to clear inputs
    $scope.clearInputs();
  }

  $scope.segmentUrlUpdated = function() {

    $scope.newVideoSegment.valid = false;
    if ($scope.newVideoSegment.url && $scope.newVideoSegment.url.indexOf("youtube.com/watch?v") != -1) {
      var params = StringHelperService.urlParams($scope.newVideoSegment.url);

      // TODO move this into a service...

      if (params['v']) {
        var infoURL = "http://gdata.youtube.com/feeds/api/videos/" + params['v'] + "?v=2&alt=jsonc";
        $http({
          url: infoURL,
          method: "GET"
        }).success(function(videoInfo, status, headers, config) {

          $scope.populateNewVideoSegment(videoInfo.data);

        }).error(function(data, status, headers, config) {
          console.log("video info request failed: " + status);
        });
      }
    }    
  };

  $scope.populateNewVideoSegment = function(video) {
    $scope.newVideoSegment.valid = true;

    $scope.newVideoSegment.sourceTitle = video.title;
    $scope.newVideoSegment.sourceDesc = video.description;
    $scope.newVideoSegment.sourceSquareThumb = video.thumbnail.sqDefault;
    $scope.newVideoSegment.sourceLargeThumb = video.thumbnail.hqDefault;
    $scope.newVideoSegment.sourceDuration = video.duration;
    $scope.newVideoSegment.sourceViewCount = video.viewCount;
    $scope.newVideoSegment.sourceUploader = video.uploader;
    $scope.newVideoSegment.url = "http://www.youtube.com/watch?v=" + video.id;
  };


  $scope.searchYoutube = function() {
    console.log($scope.youtubeSearchQuery.query);
    if ($scope.youtubeSearchQuery.length <= 0) {
      $scope.youtubeSearchResults = [];
      return;
    }

    
    var baseUrl = "https://gdata.youtube.com/feeds/api/videos?"
    var query = "q=" + $scope.youtubeSearchQuery;
    var maxResults = "&max-results=15";
    var alt = "&alt=jsonc";
    var version = "&v=2";
    var orderByParam = "&orderby=viewCount"; // currently not using...

    var searchUrl =  baseUrl + query + maxResults + alt + version;
    searchUrl = encodeURI(searchUrl);


    $http({
      url: searchUrl,
      method: "GET"
    }).success(function(response, status, headers, config) {
      $scope.youtubeSearchResults = response.data.items;      

    }).error(function(data, status, headers, config) {
      console.log("search request failed: " + status);
    });
  };

  $scope.youtubeResultSelected = function(result) {
    $scope.populateNewVideoSegment(result);
    $scope.youtubeSearchResults = [];
    $scope.youtubeSearchQuery = "";
  };

  $scope.addNewVideoSegment = function() {

    // add _id of parent video as videoRef
    if ($scope.parentVideoInput.selectedObj) {
      $scope.newVideoSegment.videoRef = $scope.parentVideoInput.selectedObj._id;
    }

        // add _id of skater as skaterRef
    if ($scope.skaterInput.selectedObj) {
      $scope.newVideoSegment.skaterRef = $scope.skaterInput.selectedObj._id;
    }


    console.log("adding video with url: " + $scope.newVideoSegment.url + "  videoRef: " + $scope.newVideoSegment.videoRef + "  skaterRef: " + $scope.newVideoSegment.skaterRef);


    var postBody = {
      videoSegment: $scope.newVideoSegment,
      socketSessionId: SocketConnection.sessionId() // add socketId to the video segment so we can get status updates
    };

    $http.post('/api/addVideoSegment', postBody).
      success(function(data) {
        if (data.error) {
          console.log("add videoSegment failed: " + data.error);
        } else {
          console.log("add videoSegment returned success.");
          $scope.refreshVideoSegments();
          $scope.refreshInputs();
        }
    });
  };

  $scope.videoStatusString = function(status) {
    var statusString = "";
    switch(status) {
      case consts.VideoStatus.ADDED:
        statusString = "Video Added";
        break;
      case consts.VideoStatus.ACQUIRING_INFO:
        statusString = "Acquiring Info";
        break;
      case consts.VideoStatus.DOWNLOADING:
        statusString = "Downloading";
        break;
      case consts.VideoStatus.PROCESSING:
        statusString = "Processing";
        break;
      case consts.VideoStatus.COMPLETE:
        statusString = "Complete";
        break;
      case consts.VideoStatus.INVALID:
        statusString = "Invalid Video";
        break;
    }
    return statusString;
  };



  // Init
  $scope.refreshVideoSegments();



  

  $scope.setFiles = function(element) {
    $scope.$apply(function() {
      console.log('files:', element.files);
      // Turn the FileList object into an Array
      $scope.files = []
      for (var i = 0; i < element.files.length; i++) {
        $scope.files.push(element.files[i])
      }
      $scope.progressVisible = false
    });
  };

  $scope.uploadFile = function() {

    if ($scope.files.length <= 0) {
      return;
    }

    var fd = new FormData()

    if ($scope.files.length > 1) {
      for (var i in $scope.files) {
          fd.append("uploadedFiles", $scope.files[i])
      }      
    } else {
      fd.append("uploadedFile", $scope.files[0])
    }
    var xhr = new XMLHttpRequest()
    xhr.upload.addEventListener("progress", uploadProgress, false)
    xhr.addEventListener("load", uploadComplete, false)
    xhr.addEventListener("error", uploadFailed, false)
    xhr.addEventListener("abort", uploadCanceled, false)
    xhr.open("POST", "/api/upload")
    $scope.progressVisible = true
    xhr.send(fd)
  }

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