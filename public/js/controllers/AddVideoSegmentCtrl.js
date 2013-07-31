'use strict'

function AddVideoSegmentCtrl($scope, $http, $location, $routeParams, $injector, $dialog, SocketConnection, StringHelperService) {

  // add Socket events
  SocketConnection.on('videoSegmentUpdated', function (data) {
    console.log("videoSegmentUpdated: " + JSON.stringify(data));

    var index = -1;
    for (var i = 0; i < $scope.videoSegments.length; i++) {
      if ($scope.videoSegments[i]._id == data.videoSegment._id) {
        index = i;
        break;
      }
    }

    if (index >= 0) {
      $scope.videoSegments[index] = data.videoSegment;
    } else {
      console.log("match for updated video segment not found. updating all video segments...");
      $scope.refreshVideoSegments();
    }
  });

  // use injector to inherit scope from InputBlockCtrl...
  $injector.invoke(InputBlockCtrl, this, {$scope: $scope});

  // model
  $scope.newVideoSegment = {
    valid : false
  };

  $scope.videos = {};
  $scope.additionalInfoVisible = false;


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

    $http.post('/api/addVideoSegment', $scope.newVideoSegment).
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



  // Init
  $scope.refreshVideoSegments();
}