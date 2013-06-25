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



