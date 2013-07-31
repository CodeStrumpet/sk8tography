'use strict';

function DetailsCtrl($scope, $http, $timeout, $routeParams, $location, APIService, SearchContext, YoutubeService) {


  $scope.currSearch = SearchContext.currSearchContext;

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
    $scope.clips = APIService.fetchItems(clipsQuery, true).then(function(clips) {
      $scope.clips = clips;

      if (clips.length > 0) {
        $timeout(function() {
          $scope.selectClip(clips[0]);
        }, 500);
      }
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

  $scope.selectClip = function(clip) {
    //console.log(JSON.stringify(clip));
    $scope.currClip = clip;
    YoutubeService.cueClip(clip);
  };
}