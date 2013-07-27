'use strict';

function IndexCtrl($scope, $http, $timeout, SocketConnection, APIService) {

  $scope.resultSets = [];
  $scope.currSearch = {};


  $scope.refreshResults = function(context) {

    console.log("context: " + JSON.stringify(context));

    $scope.resultSets = [];
    $scope.currSearch = context;

    var skatersQuery = {entity : "Skater"};
    var trickTypesQuery = {entity : "TrickType"};
    var clipsQuery = {entity : "Clip"};

    // limit clipsQuery to the specified skater or trick
    if (context.type == skatersQuery.entity || context.type == trickTypesQuery.entity) {

      if (context.type == skatersQuery.entity) {
        clipsQuery.matchField = "skaterRef";
        clipsQuery.matchId = context.item._id;
      } else if (context.type == trickTypesQuery.entity) {
        clipsQuery.matchField = "tricks.trickTypeRef";
        clipsQuery.matchId = context.item._id;
      }
      $scope.resultSets.push({
        displayName: "Clips",
        query: clipsQuery,
        results: APIService.fetchItems(clipsQuery, true)
      });

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