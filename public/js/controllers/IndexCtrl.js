'use strict';

function IndexCtrl($scope, $http, $timeout, SocketConnection, APIService) {

  var skatersQuery = {
    entity : "Skater"
  };
  $scope.skaters = APIService.fetchItems(skatersQuery, true).then(function(results) {
    $scope.skaters = results;
  });


  var trickTypesQuery = {
    entity : "TrickType"
  };
  $scope.trickTypes = APIService.fetchItems(trickTypesQuery, true);

  var clipsQuery = {
    entity : "Clip"
  };
  $scope.clips = APIService.fetchItems(clipsQuery, true);


  // socket listeners
  SocketConnection.on('init', function (data) {
    console.log("init received:  " + data.msg);
  });


  $scope.layoutDone = function() {

    $timeout(function() {
      console.log("layoutDone");
      //var scroller =    $("#tS1");


      $("#tS1").thumbnailScroller({
        scrollerType:"hoverPrecise",
        scrollerOrientation:"horizontal",
        scrollSpeed:2,
        scrollEasing:"easeOutCirc",
        scrollEasingAmount:600,
        acceleration:4,
        noScrollCenterSpace:10,
        autoScrolling:0,
        autoScrollingSpeed:2000,
        autoScrollingEasing:"easeInOutQuad",
        autoScrollingDelay:500
      });
    }, 500);
  };

 (function($){
   return;
   window.onload=function(){
     console.log("wtf");
     console.log($("#ts1"));
    $("#tS1").thumbnailScroller({
      scrollerType:"hoverAccelerate",
      scrollerOrientation:"horizontal",
      scrollSpeed:2,
      scrollEasing:"easeOutCirc",
      scrollEasingAmount:600,
      acceleration:4,
      //scrollSpeed:800,
      noScrollCenterSpace:10,
      autoScrolling:0,
      autoScrollingSpeed:2000,
      autoScrollingEasing:"easeInOutQuad",
      autoScrollingDelay:500
    });
   }
 })(jQuery);
}