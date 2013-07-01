'use strict'

function AddVideoSegmentCtrl($scope, $http, $location, $routeParams, $injector, StringHelperService, $dialog) {

  $injector.invoke(InputBlockCtrl, this, {$scope: $scope});

  // model
  $scope.newVideoSegment = {
    valid : false
  };

  $scope.parentVideo = {
    valid : false,
    name : ""
  };

  $scope.videos = {};

  $scope.additionalInfoVisible = false;

  $http.get('/api/videoSegments').
    success(function(data, status, headers, config) {
      $scope.videoSegments = data.videoSegments;
  });


  // input1
  $scope.inputs.push({
    name : "Parent Video",
    value : "",
    type : "text",
    helpText : "The name of the video this segment is from (if applicable)",
    typeahead : "value.name for value in getMatches($viewValue, $index)",
    typeaheadResults : [],
    selectedObj : null,
    entityName : "Video",
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
    },
    checkValidity : function() {
      var valid = false;
      for (var i = 0; i < this.typeaheadResults.length; i++) {
        if (this.typeaheadResults[i].name.toLowerCase() === this.value.toLowerCase()) {
          console.log("exact typeahead match!");
          this.selectedObj = this.typeaheadResults[i];
          valid = true;
          break;
        } 
      }
      // reset selectedObj to null if we don't have a match
      if (!valid) {
        this.selectedObj = null;
      }
    },
    addNewEntity : function() {
      console.log("Add new entity");
    }
  });


  $scope.additionalInfoLabelText = function() {
    return $scope.additionalInfoVisible ? "\u25BC" : "\u25B6";
  };

  $scope.showAddParentVideoButton = function() {
    return (!$scope.parentVideo.valid) && $scope.parentVideo.name.length > 2;
  };

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

          $scope.newVideoSegment.valid = true;

          $scope.newVideoSegment.sourceTitle = videoInfo.data.title;
          $scope.newVideoSegment.sourceDesc = videoInfo.data.description;
          $scope.newVideoSegment.sourceSquareThumb = videoInfo.data.thumbnail.sqDefault;
          $scope.newVideoSegment.sourceLargeThumb = videoInfo.data.thumbnail.hqDefault;
          $scope.newVideoSegment.sourceDuration = videoInfo.data.duration;
          $scope.newVideoSegment.sourceViewCount = videoInfo.data.viewCount;
          $scope.newVideoSegment.sourceUploader = videoInfo.data.uploader;

        }).error(function(data, status, headers, config) {
          console.log("video info request failed: " + status);
        });
      }
    }    
  };

  $scope.parentVideoTypeaheadFn = function(query, callback) {
    
    $http.get('/api/videos', {}).
      success(function(data) {
        console.log("returne " + data.videos.length + " videos.");
        $scope.videos = {}; // reset videos

        var vidNames = [];
        for (var i = 0; i < data.videos.length; i++) {
          vidNames.push(data.videos[i].name);
          $scope.videos[data.videos[i].name] = data.videos[i]; // add the video to the videos object by name
        }
      callback(vidNames); 
    });
  };

  $scope.$on('typeahead-updated', function() {

    var selectedVideo = $scope.videos[$scope.parentVideo.name];

    if (selectedVideo) {

      console.log('Video selected '+ $scope.selectedVideo._id);  
      $scope.parentVideo.valid = true;
      $scope.newVideoSegment.videoRef = selectedVideo._id;      
    }    
  });

  $scope.addNewVideo = function() {

    $scope.opts = {
      backdrop: true,
      keyboard: true,
      backdropClick: true,
      title : "Add New Video",
      message: "Now is the time!",
      buttons: [{label:'Yes, I\'m sure', result: 'yes'},{label:'Nope', result: 'no'}],
      templateUrl: 'partials/addNewVideo',
      controller: 'AddNewVideoCtrl',
      dialogClass: 'modal modal-form',
      resolve: {
        dialogModel: function() {
          return $scope.parentVideo;            
        } 
      }
    };

    var d = $dialog.dialog($scope.opts);
    d.open().then(function(result){
      if(result) {
        if (result.video._id) {
          console.log('Video added '+ result.video._id);  
          $scope.parentVideo.valid = true;
          $scope.newVideoSegment.videoRef = result.video._id;    
        }
      }
    });
  };

  $scope.addNewVideoSegment = function() {
    
    console.log("adding url: " + $scope.newVideoSegment.url);

    console.log("one possible client-side VideoStatus value is: " + window.Constantsinople.VideoStatus.AVAILABLE);

    $http.post('/api/addVideoSegment', $scope.newVideoSegment).
      success(function(data) {
        if (data.error) {
          console.log("add videoSegment failed: " + data.error);
        } else {
          console.log("add videoSegment returned success.");  
        }
    });
  };
}