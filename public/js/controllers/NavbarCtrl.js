'use strict'

function NavbarCtrl($scope, $http, $dialog, $location, UserService, AuthService) {


  // Prevent the login dropdown from closing on us
  $('.dropdown-toggle').dropdown(); 
  // Fix input element click problem
  $('.dropdown input, .dropdown button, .dropdown label').click(function(e) {
    e.stopPropagation();
  });

  // !!! TODO: do this in a way that doesn't require the overhead 
  // of calling this function about 5 times with every page action
  $scope.isLoggedIn = function() {
    return UserService.isLoggedIn();
  };

  $scope.username = function() {
    return UserService.username();
  };

  $scope.logout = function() {
    UserService.logout();
  };

  $scope.login = function() {

    $('.dropdown.open .dropdown-toggle').dropdown('toggle');
    
    UserService.login($scope.usernameVal, $scope.passwordVal).then(function(d) {
      
      console.log("login returned");
      //$scope.data = d;
    });
  };

  $scope.signup = function () {

    $scope.opts = {
      backdrop: true,
      keyboard: true,
      backdropClick: true,
      templateUrl: 'partials/signup',
      controller: 'SignupCtrl',
      dialogClass: 'modal modal-form',
    };

    var d = $dialog.dialog($scope.opts);
    d.open().then(function(result){
      console.log("signup finished");
    });
  };
}