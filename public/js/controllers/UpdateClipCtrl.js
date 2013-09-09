'use strict'

function UpdateClipCtrl($scope, $http, $injector, $dialog, UserService) {

  $injector.invoke(InputBlockCtrl, this, {$scope: $scope});

  var consts = window.Constantsinople;


  $scope.$watch('clip', function(newVal, oldVal) {
    if (newVal) {

      // mark the update button as disabled again
      $scope.updateEnabled = false;

      $scope.errors = [];

      // update inputs
      $scope.updateInputsWithClip($scope.clip);
    }
  });


  var newTrickInput = function() {
    return {
      name : "",
      getName : function() {
        if (this.isFirstTrick) {
          return "Trick(s)";
        } else {
          return "";
        }
      },
      value : "",
      type : "text",
      helpText : "",
      typeahead : "value.name for value in getMatches($viewValue, $index)",
      typeaheadResults : [],
      selectedObj : null,
      placeholder : "",
      entityName : "Trick",
      templateUrl: 'partials/addNewTrickType',
      controller: 'AddNewTrickTypeCtrl',
      multipleField : true,
      isLastTrick : true,
      isFirstTrick : false,
      isComboTrick : false,
      isSwitchTrick : false,
      typeaheadFetch : function(searchText, successFunction) {

        var url = '/api/trickTypes';
        if (searchText) {
          url = url + "?q=" + searchText;
        }

        return $http.get(url).then(function(response) {
          var trickTypes = response.data.trickTypes;
          return successFunction(trickTypes);
        });
      }
    };
  };


  $scope.updateInputsWithClip = function(clip) {

    $scope.inputs = [];
    
    $scope.skaterInput = {
      name : "Skater",
      value : "",
      type : "text",
      helpText : "",
      typeahead : "value.name for value in getMatches($viewValue, $index)",
      typeaheadResults : [],
      selectedObj : null,
      entityName : "Skater",
      templateUrl: 'partials/addNewSkater',
      controller: 'AddNewSkaterCtrl',
      typeaheadFetch : function(searchText, successFunction) {

        var url = '/api/skaters';
        if (searchText) {
          url = url + "?q=" + searchText;
        }

        return $http.get(url).then(function(response) {
          var skaters = response.data.skaters;
          return successFunction(skaters);
        });
      }
    };

    $scope.inputs.push($scope.skaterInput);

    // get skater if we have it...
    if (clip.skaterRef) {

      var url = '/api/skaters?_id=' + clip.skaterRef;

      $http.get(url).then(function (response) {        

        if (response.data.error) {
          console.log("error: " + response.data.error);
        } else if (response.data.skaters) {
          $scope.skaterInput.value = response.data.skaters.name;
          $scope.skaterInput.typeaheadResults = [response.data.skaters];
          $scope.skaterInput.selectedObj = response.data.skaters;
        }
        return response.data.skaters.name;
      });
    }


    // initialize the tricks array with one trick
    $scope.tricks = [newTrickInput()];
    $scope.tricks[0].isFirstTrick = true;

    $scope.inputs.push($scope.tricks[0]);

    for (var i = 0; i < clip.tricks.length; i++) {

      // we have already added the first trick, so we don't have to do it again
      if (i > 0) {        
        $scope.addAnotherTrick();
      } 

      var url = '/api/trickTypes?_id=' + clip.tricks[i].trickTypeRef;

      $http.get(url).then(trickTypeCallback(i));
    }
  };

  // creating function that returns a function to deal with functional scope issue
  var trickTypeCallback = function(index) {
    var newIndex = index;
    
    return function(response) {

      if (response.data.error) {
        console.log("error: " + response.data.error);
      } else if (response.data.trickTypes) {
        $scope.tricks[newIndex].value = response.data.trickTypes.name;
        $scope.tricks[newIndex].typeaheadResults = [response.data.trickTypes];
        $scope.tricks[newIndex].selectedObj = response.data.trickTypes;
      }
      //return response.data.trickTypes.name;      
    };
  }

  $scope.addAnotherTrick = function(index) {

    var newTrick = newTrickInput();

    var lastTrick = $scope.tricks.slice(-1)[0]

    // figure out what index the last trick is at
    var i;
    for (i = 0; i < $scope.inputs.length; i++) {
      if ($scope.inputs[i] == lastTrick) {
        break;
      }
    }

    // insert new trick after last trick
    $scope.inputs.splice(i+1, 0, newTrick);

    // make sure all the other tricks know they are not the last trick
    for (i = 0; i < $scope.tricks.length; i++) {
      $scope.tricks[i].isLastTrick = false;
    }

    // add the new trick to the end of our tricks array
    $scope.tricks.push(newTrick);

    return newTrick;
  };

  $scope.removeTrick = function(index) {

    var trickToRemove = $scope.inputs[index];

    // figure out the trick index 
    var i;
    for (i = 0; i < $scope.tricks.length; i++) {
      if ($scope.tricks[i] == trickToRemove) {
        break;
      }
    }

    $scope.tricks.remove(i);
    $scope.inputs.remove(index);

    $scope.tricks[$scope.tricks.length - 1].isLastTrick = true;
  };

  $scope.closeAlert = function(index) {
    $scope.errors.remove(index);
  };

  $scope.mouseEnteredInput = function(index) {
    $scope.inputs[index].active = true;
  };

  $scope.mouseLeftInput = function(index) {
    $scope.inputs[index].active = false;
  };

  $scope.terrainName = function(terrainType) {
    var name = "Unspecified";
  }

  $scope.updateClip = function() {

    // reset errors before starting
    $scope.errors = [];

    var clip = $scope.clip;

    if ($scope.skaterInput.value == "") {
      clip.skaterRef = null;
    } else if (!$scope.skaterInput.selectedObj) {
      $scope.errors.push({type: 'error', msg: "invalid skater: " + $scope.skaterInput.value});
    } else if (clip.skaterRef != $scope.skaterInput.selectedObj._id) {
      console.log("skater ref mismatch");

      if ($scope.skaterInput.selectedObj) {
        clip.skaterRef = $scope.skaterInput.selectedObj._id;
        console.log("new skater!");
      } 
    }

    var clipTricks = [];
    for (var i = 0; i < $scope.tricks.length; i++) {
      if ($scope.tricks[i].selectedObj) {
        var trick = {};        
        trick.trickTypeRef = $scope.tricks[i].selectedObj._id;
        trick.stance = consts.Stance.UNKNOWN; // TODO !!!!
        trick.terrainType = consts.TerrainType.UNKNOWN; // TODO !!!!

        clipTricks.push(trick);
      } else if ($scope.tricks[i].value != "") {
        $scope.errors.push({type: 'error', msg: "invalid trick: " + $scope.tricks[i].value});
      }
    }

    if (!UserService.userId()) {
      $scope.errors.push({type: 'error', msg: "Login necessary."});
    }

    if ($scope.errors.length == 0) {

      clip.tricks = clipTricks;
      clip.editUserRef = UserService.userId();

      $http.put('/api/updateClip', {clip: clip}).
      success(function(data) {
        if (data.error) {
          console.log("updating clip failed");
        } else {          
          
          $scope.updateEnabled = false;

          // TODO:  Move this to tagClipsCtrl...
          //data.clip.selected = true;
          //$scope.clips[$scope.currClipIndex] = data.clip;        

          console.log("updateClip returned success.");
        }
      });
    }
  };
}