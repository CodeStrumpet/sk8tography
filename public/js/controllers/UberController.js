'use strict';

function UberController($scope, APIService) {

  // model objects (shared with youtube player directive)
  $scope.playlist = {items: [], position: -1};

  $scope.playstate = {isPlaying : false, keepPlaying : true, playUponCued : true};


  $scope.refreshResults = function() {
    var clipsQuery = {entity : "Clip"};

    var conditions = [];
    var taggedCondition = {};
    taggedCondition.path = "status";
    taggedCondition.val = 1; // TODO replace with value from shared constants
    conditions.push(taggedCondition);

    var skaterCondition = {};
    skaterCondition.path = "skaterRef";
    skaterCondition.val = "521d5e3917c7cb040e000008"; // gino
    conditions.push(skaterCondition);

    clipsQuery.conditions = conditions;
      clipsQuery.select = "duration thumbFileName skaterRef tricks videoSegmentId startTime";
      clipsQuery.populate = "skaterRef tricks.trickTypeRef";

    // fetch the clips
    APIService.fetchItems(clipsQuery, true).then(function(clips) {
      console.log("retrieved clips: " + clips.length);
      $scope.playlist.items = clips;
    });
  };

  $scope.selectClip = function(clipIndex) {
    console.log("clip index chosen: " + clipIndex);
    $scope.playlist.position = clipIndex;
  };


  $scope.refreshResults();
}