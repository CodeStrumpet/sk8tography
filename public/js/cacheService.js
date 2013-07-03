'use strict';

angular.module('myApp.cacheService', []).
.service( 'CacheService', [ '$rootScope', function( $rootScope ) {
  return {


      // TODO add promise based cache lookup...
    
   };
 }]);


// code to get current # seconds past epoch:  Math.round(new Date().getTime() / 1000)