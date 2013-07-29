'use strict';

function IndexCtrl($scope, $timeout, $location, SocketConnection, APIService, SearchContext) {

  // Housekeeping: open socket connection for the app
  SocketConnection.on('init', function (data) {
    console.log("socket opened (init received):  " + data.msg);
  });

  // models
  $scope.resultSets = [];
  $scope.currSearch = {};

  // called before redirecting to details
  $scope.viewDetails = function(context) {
    SearchContext.currSearchContext = context;
  };


  $scope.refreshResults = function(context) {

    // reset search context
    SearchContext.currSearchContext = context;


    var skatersQuery = {entity : "Skater", select : "name thumbFileName nameSlug"};
    var trickTypesQuery = {entity : "TrickType", select : "name thumbFileName nameSlug"};

    // add search for skaters
    $scope.resultSets.push({
      displayName: "Skaters",
      pathName: "skaters",
      query: skatersQuery,
      results: APIService.fetchItems(skatersQuery, true)
    });

    // add search for tricks
    $scope.resultSets.push({
      displayName: "Tricks",
      pathName: "tricks",
      query: trickTypesQuery,
      results: APIService.fetchItems(trickTypesQuery, true)
    });
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