'use strict'

function NavbarCtrl($scope, $http, $dialog, $location, $timeout, UserService, AuthService) {

  $scope.feedbackLabel = "FEEDBACK";

  $scope.showNavbar = function() {
    var shouldShow = $location.path() != '/demoauth';
    return shouldShow;
  };

  $scope.brandClick = function() {
    $('.navbar li').removeClass('active');
  };

  // Prevent the login dropdown from closing on us
  $('.dropdown-toggle').dropdown(); 
  // Fix input element click problem
  $('.dropdown input, .dropdown button, .dropdown label, .dropdown textarea').click(function(e) {
    e.stopPropagation();
  });

  $('.navbar li').click(function(e) {
    $('.navbar li').removeClass('active');
    var $this = $(this);
    if (!$this.hasClass('active')) {
      $this.addClass('active');
    }
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

  $scope.submitFeedback = function () {

    $scope.feedbackObj.username = UserService.username();
    $scope.feedbackObj.userRef = UserService.userId();

    console.log("userId: " + UserService.userId());

    $http.post('/api/feedback', {feedback : $scope.feedbackObj}).then(function (response) {

      $('.dropdown.open .dropdown-toggle').dropdown('toggle');

      console.log(JSON.stringify(response));

      $scope.feedbackLabel = "THANKS !!";

      $scope.feedbackObj = null;


      $timeout(function() {
        $scope.$apply(function () {
          $scope.feedbackLabel = "FEEDBACK";
        });
      }, 1500);
    });
  };
}