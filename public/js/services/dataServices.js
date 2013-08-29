'use strict';


// TODO: error handling, cache expiration...
app.factory('CacheService', function ($rootScope, $http, $q, $timeout) {
  var cache = {};

  var cacheKey = function(requestType, url, queryObj) {
    return requestType + "_" + url + "_" + JSON.stringify(queryObj);
  };

  var requestFn = function(requestType, url, queryObj, useCache) {
    
    // TODO: if useCache, try to return items from the cache

    var deferred = $q.defer();

    var responseFunction = function(response, skipCache) {
      // if caching is enabled, we store the response...
      if (useCache && !skipCache) {
        var key = cacheKey(requestType, url, queryObj);
        cache[key] = response.data;
      }
      deferred.resolve(response.data);
    };

    if (useCache) {
      var key = cacheKey(requestType, url, queryObj);

      // if we have the result, we short-circuit and return immediately 
      // !!!!!! It is the caller's responsibility to implement the '$q.when' function !!!!!
      if (cache[key]) {
        console.log("cache hit!");                
        return cache[key]; 
      }
    } 

    if (requestType == 'GET') {
      $http.get(url).then(responseFunction);
    } else if (requestType == 'PUT') {
      $http.put(url, queryObj).then(responseFunction);
    } else if (requestType == 'POST') {
      $http.put(url, queryObj).then(responseFunction);
    }

    return deferred.promise;
  };


  return {
    performRequest : requestFn
  };
});

app.factory('TrickTypesService', function ($rootScope, $q, CacheService) {
  
  var deferred = $q.defer();

  var getTrickTypesMatchingRefs = function(allTrickTypes, refs) {

    var matchingTTypes = [];

    for(var i = 0; i<refs.length; i++) {
      var matches = allTrickTypes.filter(function(tType) {
        if (tType._id == refs[i]) {
          return matches;
        } else {
          return null;
        }
      });

      if (matches.length > 0) {
        matchingTTypes.push(matches[0]);
      }
    }
    console.log("matchingTTypes.length: " + matchingTTypes.length);
    return matchingTTypes;
  };

  var getActiveTrickTypes = function() {

    var allTrickTypes = null;
    var activeTrickTypeRefs = null;

    var trickTypesQuery = {entity : "TrickType", select : "name thumbFileName nameSlug"};
    var trickTypesUrl = '/api/fetchResults';

    $q.when(CacheService.performRequest('PUT', trickTypesUrl, {q : trickTypesQuery}, true)).then(function(response) {
      
      allTrickTypes = response.results;      

      // if we already have the refs, then return the results of the matching fn
      if (activeTrickTypeRefs) {
        var matchingTrickTypes = getTrickTypesMatchingRefs(allTrickTypes, activeTrickTypeRefs);
        deferred.resolve(matchingTrickTypes);  
      }      
    });

    // if we already have the full list, then return the results of the matching fn
    $q.when(CacheService.performRequest('GET', '/api/activeTrickTypes', null, true)).then(function(response) {
      console.log(response);
      activeTrickTypeRefs = response.results;      

      if (allTrickTypes) {
        var matchingTrickTypes = getTrickTypesMatchingRefs(allTrickTypes, activeTrickTypeRefs);
        deferred.resolve(matchingTrickTypes);  
      }
      
    });

    return deferred.promise;    
  };

  return {
    getActiveTrickTypes : getActiveTrickTypes    
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
});
// code to get current # seconds past epoch:  Math.round(new Date().getTime() / 1000)