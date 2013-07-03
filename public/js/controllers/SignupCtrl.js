'use strict';

function SignupCtrl($scope, $http, $injector, UserService, dialog) {

  $injector.invoke(InputBlockCtrl, this, {$scope: $scope});

  $scope.loading = false;

  $scope.usernameInput = {
    name : "Username",
    value : "",
    type : "text",
    helpText : "",
  };

  $scope.emailInput = {
    name : "Email",
    type : "text",
    helpText : "",
  };

  $scope.passwordInput = {
    name : "Password",
    type : "password",
  };

  $scope.repeatPasswordInput = {
    name : "Repeat Password",
    type : "password",
  };


  $scope.inputs.push($scope.usernameInput);
  $scope.inputs.push($scope.emailInput);
  $scope.inputs.push($scope.passwordInput);
  $scope.inputs.push($scope.repeatPasswordInput);


  $scope.signup = function() {
    $scope.loading = true;

    var usernameVal = $scope.usernameInput.value;
    var passwordVal = $scope.passwordInput.value;
    var emailVal = $scope.emailInput.value;

    var user = {
      username : usernameVal,
      email : emailVal,
      password : passwordVal
    };

    UserService.signup(usernameVal, passwordVal, emailVal).then(function(d) {      
      console.log("signup returned");
      dialog.close();
    });
  };

  $scope.close = function(result) {
    dialog.close(result);
  };
}