'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1');


// socket service (use 'factory' service definition so we can run one-time code before returning service)
app.factory('socket', function ($rootScope) {
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



