'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1')

.service( 'YoutubeService', [ '$rootScope', function( $rootScope ) {
  return {
    playerIsReady : false,
    cueClip: function(clip) {
      $rootScope.$broadcast('YoutubeService.cueClip', clip);
    }
   };
 }])

.service( 'UserService', [ '$rootScope', '$http', '$cookies', function($rootScope, $http, $cookies) {
  
  return {

    isLoggedIn : function() {
      return $cookies.username && $cookies.userId;
    },

    username : function() {
      return $cookies.username;
    },

    userId : function() {
      return $cookies.userId;
    },

    logout : function() {
      delete $cookies.username;
      delete $cookies.userId;
    },

    login : function(theUsername, thePassword) {
      var parent = this;

      var body = {username: theUsername, password: thePassword};

      var promise = $http.post('/api/login', body).then(function (response) {        

        console.log(response);

        if (response.data.error) {
          console.log("error: " + response.data.error);
        } else if (response.data.user) {

          $cookies.username = response.data.user.username;
          $cookies.userId = response.data.user._id;
        }
        return response.data;
      });      

      return promise;
    },

    signup : function(theUsername, thePassword, theEmail) {
      var parent = this;

      var body = {username: theUsername, password: thePassword, email: theEmail};

      var promise = $http.post('/api/signup', body).then(function (response) {        

        console.log(response);

        if (response.data.error) {
          console.log("error: " + response.data.error);
        } else if (response.data.user) {
          $cookies.username = response.data.user.username;
          $cookies.userId = response.data.user._id;
        }
        return response.data;
      });      

      return promise;
    }
  };

}])

.service('StringHelperService', ['$rootScope', function( $rootScope) {
  return {
    urlParams : function(url) {
      var query = "";
      var split = url.split('?');
      if (split.length > 1) {
        query = split[1];
      }

      var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { 
          return decodeURIComponent(s.replace(pl, " ")); 
        };

      var paramsResult = {};

      while (match = search.exec(query))
        paramsResult[decode(match[1])] = decode(match[2]);

      return paramsResult;
   }
  };
}]);


// socket service (use 'factory' service definition so we can run one-time code before returning service)
app.factory('SocketConnection', function ($rootScope) {
  var socket = io.connect();
  
  return {
    
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },

    emit: function (eventName, data, callback) {

      // TODO only add handler if callback is not null...
      // add a result callback: OriginalEventName + '_Result' 
      socket.on(eventName+"_Result", function() {
      	var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });

      // actually emit
      socket.emit(eventName, data);
    }
  };
});

app.factory('AuthService', function ($rootScope, $route, $location, UserService) {

  $rootScope.$on("$routeChangeStart", function(event, next, current) {    
    
    var authRequired = next && next.$$route && next.$$route.auth;
    if (authRequired && !UserService.isLoggedIn()) {
      console.log("you should be logged in to use this page...");
      $location.url('/');
      //var currentUrl = $location.url();
      //$location.url("/signin?redirect_url=" + encodeURIComponent(currentUrl));
    } 
    
  });

  return {};
});


