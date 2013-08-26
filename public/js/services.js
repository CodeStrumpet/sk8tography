'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1')

.service( 'YoutubeService', [ '$rootScope', function( $rootScope ) {
  return {
    playerIsReady : false,
    cueClip: function(clip, playerId) {
      $rootScope.$broadcast('YoutubeService.cueClip', clip, playerId);
    },
    cueSegment: function(segment, playerId) {
      $rootScope.$broadcast('YoutubeService.cueSegment', segment, playerId);
    },
    timeUpdated: function(newTime, playerId) {
      $rootScope.$broadcast('YoutubeService.timeUpdated', newTime, playerId);
    },
    pauseVideo : function() {
      $rootScope.$broadcast('YoutubeService.pause');
    },
    seekVideo : function(desiredTime) {
      $rootScope.$broadcast('YoutubeService.seekVideo', desiredTime);
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
  var sessionIdTag = null;


  // register the sessionID callback
  socket.on("sessionID", function(data) {
    sessionIdTag = data;
    console.log("sessionID: " + JSON.stringify(data));
  });

  
  return {

    sessionId : function() {
      return sessionIdTag
    },
    
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

app.factory('AuthService', function ($rootScope, $route, $location, UserService, DemoService) {

  $rootScope.$on("$routeChangeStart", function(event, next, current) {

    // we currently redirect all traffic that hasn't passed the frontpage test
    if (!DemoService.isValidDemoUser()) {
      $location.url('/demoauth');
      return;
    }
    
    var authRequired = next && next.$$route && next.$$route.auth;
    if (authRequired && !UserService.isLoggedIn()) { // TODO: check for specific admin userNames here
      console.log("you should be logged in to use this page...");
      $location.url('/');
      //var currentUrl = $location.url();
      //$location.url("/signin?redirect_url=" + encodeURIComponent(currentUrl));
    }     
  });

  return {};
});

app.factory('DemoService', function ($rootScope, $location, $http, $cookies) {

  return {    
    isValidDemoUser : function() {
      return $cookies.validDemoUser === "valid_true";
    },    
    checkDemoPassword : function(pass) {

      var url = '/api/checkDemoPass?pass=' + pass;
      $http.get(url).then(function(response) {
        console.log(JSON.stringify(response));
        if (response.data.valid) {
          $cookies.validDemoUser = "valid_true";
          $location.url('/');  
        } else {
          console.log("incorrect pass...");
        }
      });
    }
  };
});

app.factory('APIService', function ($rootScope, $http, $q) {
  var cache = {};

  var fetchItems = function(query, useCache) {
    
    // TODO: if useCache, try to return items from the cache

    var deferred = $q.defer();
    var url = '/api/fetchResults';

    var result = $http.put(url, {q : query}).then(function(response) {
      deferred.resolve(response.data.results);
      console.log("resolved " + response.data.results.length + "results");
    });

    return deferred.promise;
  };

  return {
    fetchItems: fetchItems
  };

})

.service( 'SearchContext', [ '$rootScope', function( $rootScope ) {
  return {
    currSearchContext : {}
  };
}]);


