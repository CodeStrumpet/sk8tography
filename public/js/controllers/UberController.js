'use strict';

function UberController($scope, $http, $timeout, $routeParams, $location, $parse, APIService, SearchContext, YoutubeService) {


  // model objects (shared with youtube player directive)
  $scope.playlist = {items: [], position: -1};
  $scope.playstate = {isPlaying : false, keepPlaying : true, playUponCued : true};

  $scope.currSearch = SearchContext.currSearchContext;

  var skatersQuery = {entity : "Skater", select : "name thumbFileName nameSlug"};
  APIService.fetchItems(skatersQuery, true).then(function(results) {
    $scope.skaters = results;
  });

  $scope.refreshResults = function(context) {

    $scope.currSearch = context;

    var clipsQuery = {entity : "Clip"};

    var conditions = [];
    var condition = {};
    condition.path = "status";
    condition.val = 1; // TODO replace with value from shared constants
    conditions.push(condition);

    // limit clipsQuery to the specified skater or trick
    if (context.type == "Skater") {
      var condition = {};
      condition.path = "skaterRef";
      condition.val = context.item._id;
      //condition["skaterRef"] = context.item._id;
      conditions.push(condition);
    } else if (context.type == "TrickType") {
      var condition = {};
      condition.path = "tricks.trickTypeRef";
      condition.val = context.item._id;
      conditions.push(condition);
    }

    clipsQuery.conditions = conditions;
    clipsQuery.select = "duration thumbFileName skaterRef tricks videoSegmentId startTime";
    clipsQuery.populate = "skaterRef tricks.trickTypeRef";

    // fetch the clips
    APIService.fetchItems(clipsQuery, true).then(function(clips) {
      $scope.playlist.items = clips;

      // if (clips.length > 0) {
      //   $timeout(function() {
      //     $scope.selectClip(clips[0]);
      //   }, 500);
      // }
    });
  };

  // call refresh results with current context
  $scope.refreshResults($scope.currSearch);


  $scope.sliderItemLabel = function(item) {
    if (item.name) {
      return item.name;
    } else { //item is of type 'Clip'

      if ($scope.currSearch.type == "Skater") {
        // show trick name
        if (item.tricks.length > 0) {
          return item.tricks[0].trickTypeRef.name;
        }
      } else if ($scope.currSearch.type == "TrickType") {
        // show skater name
        return item.skaterRef.name;
      }
    }
    return "<--->";
  };

  $scope.skaterTypeahead = function(searchText) {

    function containsText(element) {
      return element.name.toLowerCase().indexOf(searchText.toLowerCase()) >= 0;
    }
    return $scope.skaters.filter(containsText);
  };

  $scope.skaterSelected = function(skater) {

    $scope.currSearch.type = "Skater";
    $scope.currSearch.item = skater;

    $scope.refreshResults($scope.currSearch);
  };

  $scope.skatersTypeaheadBlur = function(index) {

  };

  $scope.updateClipsWithSkaterChoice = function(skater) {

    $scope.currSearch.type = "Skater";
    $scope.currSearch.item = skater;

    $scope.refreshResults($scope.currSearch);    
  }

  $scope.selectClip = function(clipIndex) {

    $scope.playlist.position = clipIndex;

    /*
    if ($scope.currClip && $scope.currClip != clip) {
      $scope.currClip.selected = false;
    }
    clip.selected = true;

    $scope.currClip = clip;
    YoutubeService.cueClip(clip);
    */
  };
}