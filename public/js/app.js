'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index',
        controller: IndexCtrl
      }).
      when('/videoSegments', {
        templateUrl: 'partials/videoSegments',
        controller: VideoSegmentsCtrl
      }).
      when('/addVideoSegment', {
        templateUrl: 'partials/addVideoSegment',
        controller: AddVideoSegmentCtrl
      }).
      when('/tagClips', {
        templateUrl: 'partials/tagClips',
        controller : TagClipsCtrl
      }).
      when('/addPost', {
        templateUrl: 'partials/addPost',
        controller: AddPostCtrl
      }).
      when('/readPost/:id', {
        templateUrl: 'partials/readPost',
        controller: ReadPostCtrl
      }).
      when('/editPost/:id', {
        templateUrl: 'partials/editPost',
        controller: EditPostCtrl
      }).
      when('/deletePost/:id', {
        templateUrl: 'partials/deletePost',
        controller: DeletePostCtrl
      }).
      otherwise({
        redirectTo: '/',
        resolve: {}
      });
    $locationProvider.html5Mode(true);
  }]);
