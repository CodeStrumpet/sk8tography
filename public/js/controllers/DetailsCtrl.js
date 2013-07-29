'use strict';

function DetailsCtrl($scope, $http, $timeout, $routeParams, $location, APIService, SearchContextService) {

  $scope.resultSets = [];
  $scope.currSearch = SearchContextService.currSearchContext;

  $scope.refreshResults = function(context) {

    var skatersQuery = {entity : "Skater", select : "name thumbFileName nameSlug"};
    var trickTypesQuery = {entity : "TrickType", select : "name thumbFileName nameSlug"};
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
    }

  };


  // call refresh results with no search context to display the default content
  $scope.refreshResults($scope.currSearch);


}