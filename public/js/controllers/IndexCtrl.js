'use strict';

function IndexCtrl($scope, $http, $timeout, SocketConnection, APIService) {

  $scope.currSearch = {};
  $scope.resultSets = [];


  var skatersQuery = {
    entity : "Skater",
    displayName : "Skaters"
  };
  var trickTypesQuery = {
    entity : "TrickType",
    displayName : "Tricks"
  };

  $scope.resultSets[0] = {
    query: skatersQuery,
    results: APIService.fetchItems(skatersQuery, true)
  };

  $scope.resultSets[1] = {
    query: trickTypesQuery,
    results: APIService.fetchItems(trickTypesQuery, true)
  };



  // socket listeners
  SocketConnection.on('init', function (data) {
    console.log("init received:  " + data.msg);
  });


  $scope.layoutDone = function(elementId, index) {

    $timeout(function() {
      console.log("layoutDone: " + elementId);
      //var scroller =    $("#tS1");

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