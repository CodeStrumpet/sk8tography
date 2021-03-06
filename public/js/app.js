'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('myApp', ['ui.bootstrap', 'ngCookies', 'myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/uber',
        controller: UberController
        //templateUrl: 'partials/index',
        //controller: IndexCtrl
      }).
      when('/demoauth', {
        templateUrl: 'partials/demoAuth',
        controller: DemoAuthCtrl
      }).
      when('/skaters/:entityId', {
        templateUrl: 'partials/details',
        controller: DetailsCtrl
      }).
      when('/new', {
        templateUrl: 'partials/uber',
        controller: UberController
      }).
      when('/tricks/:entityId', {
        templateUrl: 'partials/details',
        controller: DetailsCtrl
      }).
      when('/watch', {
        templateUrl: 'partials/videoSegmentScroller',
        controller: VideoSegmentScrollerCtrl
      }).
      when('/videoSegments', {
        templateUrl: 'partials/videoSegments',
        controller: VideoSegmentsCtrl
      }).
      when('/addVideoSegment', {
        templateUrl: 'partials/addVideoSegment',
        controller: AddVideoSegmentCtrl
      }).
      when('/addNewSong', {
        templateUrl: 'partials/addNewSong',
        controller: AddNewSongCtrl
      }).
      when('/tagClips', {
        templateUrl: 'partials/tagClips',
        controller : TagClipsCtrl
      }).
      when('/addNewVideo', {
        templateUrl: 'partials/addNewVideo',
        controller: AddNewVideoCtrl
      }).
      when('/addNewSkater', {
        templateUrl: 'partials/addNewSkater',
        controller: AddNewSkaterCtrl
      }).
      when('/visPlayground', {
        templateUrl: 'partials/visPlayground',
        controller: VisPlaygroundCtrl
      }).
      when('/admin', {
        templateUrl: 'partials/admin',
        controller: AdminCtrl,
        auth: true
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
  }]).config(function($httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  });;
