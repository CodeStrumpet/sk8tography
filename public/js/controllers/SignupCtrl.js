'use strict';

function SignupCtrl($scope, $http, $injector, UserService, dialog) {

  $injector.invoke(InputBlockCtrl, this, {$scope: $scope});

  $scope.loading = false;
  $scope.error = null;

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

    var usernameVal = $scope.usernameInput.value;
    var passwordVal = $scope.passwordInput.value;
    var repeatPasswordVal = $scope.repeatPasswordInput.value;
    var emailVal = $scope.emailInput.value;


    $scope.error = null;

    if (usernameVal == "") {
      $scope.error = "Username required";
    } else if (!passwordVal || passwordVal == "") {
      $scope.error = "Invalid Password";
    } else if (passwordVal != repeatPasswordVal) {
      $scope.error = "Password vals don't match";
    } else if (!emailVal || emailVal == "") {
      $scope.error = "Email required";
    }

    if ($scope.error != null) {
      return;
    }

    $scope.loading = true;

    
    var user = {
      username : usernameVal,
      email : emailVal,
      password : passwordVal
    };

    UserService.signup(usernameVal, passwordVal, emailVal).then(function(d) { 
      if (d.error) {
        $scope.loading = false;
        $scope.error = d.error;        
      } else {
        // signup was successful
        dialog.close();        
      }
    });
  };

  $scope.close = function(result) {
    dialog.close(result);
  };
}