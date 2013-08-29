
var dirtyPaths = {}; // paths that return 'true' are dirty
var cache = {};

exports.lookup = function(cacheKey) {
  if (!dirtyPaths[cacheKey]) {
    return cache[cacheKey];    
  }
  return null;
}

exports.markDirty = function(cacheKey) {
  dirtyPaths[cacheKey] = true;
}

exports.store = function(cacheKey, object) {
  cache[cacheKey] = object;
  dirtyPaths[cacheKey] = false;
}
