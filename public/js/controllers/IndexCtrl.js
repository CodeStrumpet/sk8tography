'use strict';

function IndexCtrl($scope, $http, $timeout, $routeParams, $location, SocketConnection, APIService) {

  $scope.resultSets = [];
  $scope.currSearch = {};

  if ($routeParams.entityId) {
    console.log("id: " + $routeParams.entityId);
  }

  $scope.loadNewContext = function(context) {
    $scope.currSearch = context;

    //$location.path('/' + )

  };

  $scope.refreshResults = function(context) {

    var skatersQuery = {entity : "Skater", select : "name thumbFileName"};
    var trickTypesQuery = {entity : "TrickType", select : "name thumbFileName"};
    var clipsQuery = {entity : "Clip"};

    // limit clipsQuery to the specified skater or trick
    if (context.type == skatersQuery.entity || context.type == trickTypesQuery.entity) {

      $scope.resultSets = [];
      $scope.currSearch = context;

      var conditions = [];
      var condition = {};
      condition.path = "status";
      condition.val = 1; // TODO replace with value from shared constants
      conditions.push(condition);

      if (context.type == skatersQuery.entity) {
        var condition = {};
        condition.path = "skaterRef";
        condition.val = context.item._id;
        //condition["skaterRef"] = context.item._id;
        conditions.push(condition);
      } else if (context.type == trickTypesQuery.entity) {
        var condition = {};
        condition.path = "tricks.trickTypeRef";
        condition.val = context.item._id;
        conditions.push(condition);
      }

      clipsQuery.conditions = conditions;
      clipsQuery.select = "duration thumbFileName skaterRef tricks";
      clipsQuery.populate = "skaterRef tricks.trickTypeRef";

      $scope.resultSets.push({
        displayName: "Clips",
        query: clipsQuery,
        results: APIService.fetchItems(clipsQuery, true)
      });

    } else if (context.type == clipsQuery.entity) {

      console.log("Selected Clip: " + JSON.stringify(context.item));

    } else {
      // no specific search criteria, search for both skaters and tricks
      $scope.resultSets.push({
        displayName: "Skaters",
        query: skatersQuery,
        results: APIService.fetchItems(skatersQuery, true)
      });

      $scope.resultSets.push({
        displayName: "Tricks",
        query: trickTypesQuery,
        results: APIService.fetchItems(trickTypesQuery, true)
      });
    }

  }

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


  // call refresh results with no search context to display the default content
  $scope.refreshResults({});


  // socket listeners
  SocketConnection.on('init', function (data) {
    console.log("init received:  " + data.msg);
  });


  // this should be moved into a directive somehow....
  $scope.layoutDone = function(elementId, index) {

    $timeout(function() {
      console.log("layoutDone: " + elementId);

      $(elementId).thumbnailScroller({
        scrollerType:"hoverAccelerate",   //hoverPrecise
        scrollerOrientation:"horizontal",
        scrollSpeed:2,
        scrollEasing:"easeOutCirc",
        scrollEasingAmount:600,
        acceleration:4,
        noScrollCenterSpace:400,
        autoScrolling:0,
        autoScrollingSpeed:2000,
        autoScrollingEasing:"easeInOutQuad",
        autoScrollingDelay:500,
        scrollerPrevButton: $('#prevButton' + index),
        scrollerNextButton: $('#nextButton' + index)
      });
    }, 500);
  };
}