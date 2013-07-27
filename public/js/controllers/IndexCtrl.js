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

    // limit trickTypesQuery to the specified skater
    if (context.type == skatersQuery.entity) {
      trickTypesQuery.skaterId = context.item._id;
    } else {
      // only search for skaters if a skater is not specified
      $scope.resultSets.push({
        displayName: "Skaters",
        query: skatersQuery,
        results: APIService.fetchItems(skatersQuery, true)
      });
    }

    // limit skatersQuery to the specified trickType
    if (context.type == trickTypesQuery.entity) {
      skatersQuery.trickTypeId = context.item._id;
    } else {
      // only search for trickTypes if a trickType is not specified
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