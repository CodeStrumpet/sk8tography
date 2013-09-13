'use strict';

function UberController($scope, $http, $timeout, $routeParams, $location, $parse, APIService, SearchContext, YoutubeService, UserService) {
  var consts = window.Constantsinople;

  $scope.currentUserId = UserService.userId(); // this may not be so current if the user logs out...

  // model objects (shared with youtube player directive)
  $scope.playlist = {items: [], position: -1};
  $scope.playstate = {isPlaying : false, keepPlaying : true, playUponCued : true};


  $scope.tabs = [{title:"Explore", active: false}, {title: "New Playlist", active: true}];

  $scope.currSearch = SearchContext.currSearchContext;

  $scope.music = {};

  var skatersQuery = {entity : "Skater", select : "name thumbFileName nameSlug"};
  APIService.fetchItems(skatersQuery, true).then(function(results) {
    $scope.skaters = results;
  });

  $scope.refreshResults = function(context) {

    $scope.currSearch = context;

    var clipsQuery = {entity : "Clip"};

    var conditions = [];
    var condition = {};
    condition.path = "status";
    condition.val = 1; // TODO replace with value from shared constants
    conditions.push(condition);

    // limit clipsQuery to the specified skater or trick
    if (context.type == "Skater") {
      var condition = {};
      condition.path = "skaterRef";
      condition.val = context.item._id;
      //condition["skaterRef"] = context.item._id;
      conditions.push(condition);
    } else if (context.type == "TrickType") {
      var condition = {};
      condition.path = "tricks.trickTypeRef";
      condition.val = context.item._id;
      conditions.push(condition);
    }

    clipsQuery.conditions = conditions;
    clipsQuery.select = "duration thumbFileName skaterRef tricks videoSegmentId startTime score votes";
    clipsQuery.populate = "skaterRef tricks.trickTypeRef";

    // fetch the clips
    APIService.fetchItems(clipsQuery, true).then(function(clips) {
      $scope.searchClips = clips;

      // if (clips.length > 0) {
      //   $timeout(function() {
      //     $scope.selectClip(clips[0]);
      //   }, 500);
      // }
    });
  };

  // call refresh results with current context
  $scope.refreshResults($scope.currSearch);

  // fetch all songs so we can show them in the drop-down
  APIService.fetchItems(genericSongsQuery(), true).then(function(songs) {
    $scope.music.songs = songs;
  });


  $scope.addClipToPlaylist = function(clip) {
    if ($scope.playlist.items.indexOf(clip) == -1) {
      console.log("added item to playlist...");
      $scope.playlist.items.push(clip);
    }
  };

  $scope.removeClipFromPlaylist = function(clip) {
    var clipIndex = $scope.playlist.items.indexOf(clip);
    if (clipIndex >= 0) {
      $scope.playlist.items.remove(clipIndex);
    }
  };

  $scope.likeClip = function(clip) {

    // TODO pull most of this out into a service....

    if (clip.votes && clip.votes.indexOf($scope.currentUserId) >= 0) {
      // return. user already has liked the object
      return;
    }

    if (!clip.score) {
      clip.score = 1;
    } else {
      clip.score++;
    } 
    var queryObj = {
      objId : clip._id,
      objType : consts.ObjType.CLIP,
      userId : $scope.currentUserId
    };
    $http.put('/api/likeItem', queryObj).then(function(response) {
      if (response.data.error) {
        console.log("error: " + JSON.stringify(response.data.error));
      } else {
        console.log("response: " + response.data)
        if (!clip.votes) {
          clip.votes = [];
        } 
        clip.votes.push($scope.currentUserId);
      }
    });
  };


  $scope.sliderItemLabel = function(item) {
    if (item.name) {
      return item.name;
    } else { //item is of type 'Clip'

      if ($scope.currSearch.type == "Skater") {
        // show trick name
        if (item.tricks.length > 0) {
          return item.tricks[0].trickTypeRef.name;
        }
      } else if ($scope.currSearch.type == "TrickType") {
        // show skater name
        return item.skaterRef.name;
      }
    }
    return "<--->";
  };

  $scope.skaterTypeahead = function(searchText) {

    function containsText(element) {
      return element.name.toLowerCase().indexOf(searchText.toLowerCase()) >= 0;
    }
    return $scope.skaters.filter(containsText);
  };

  $scope.skaterSelected = function(skater) {


    $scope.currSearch.type = "Skater";
    $scope.currSearch.item = skater;

    $scope.refreshResults($scope.currSearch);

    $scope.searchText = skater.name;
  };

  $scope.skatersTypeaheadBlur = function(index) {

  };

  $scope.updateClipsWithSkaterChoice = function(skater) {

    $scope.currSearch.type = "Skater";
    $scope.currSearch.item = skater;

    $scope.refreshResults($scope.currSearch); 

    $scope.searchText = skater.name;   
  }

  $scope.musicTypeahead = function(searchText) {
    var musicQuery = genericSongsQuery();

    // confine search to results matching searchText
    musicQuery.searchTerms = searchText;
    musicQuery.searchField = "name";


    return APIService.fetchItems(musicQuery, true).then(function(songs) {
      return songs;
    });
  };

  $scope.musicSelected = function(song) {
    console.log("music selected");
    $scope.music.currentSong = song;
    $scope.music.searchText = song.name;
    $scope.playlist.song = song;
  };

  $scope.musicTypeaheadBlur = function(index) {
    var validSong = false;
    for (var i = 0; i < $scope.music.songs.length; i++) {      
      if ($scope.music.songs[i].name == $scope.music.searchText) {
        validSong = true;
      }
    }

    // unset current song if we have to
    if (!validSong) {
      console.log("no valid song found");
      $scope.music.currentSong = null;
    }
  };

  $scope.playSearchResult = function(searchResultIndex) {
    console.log("play search result");

    $scope.playlist.temp = $scope.searchClips[searchResultIndex];
    
  };

  $scope.selectClip = function(clipIndex) {
    if (clipIndex == $scope.playlist.postion) {
      // toggle playstate of that clip...
      console.log("somehow activate toggle play pause of the current clip...");
    } else {
      $scope.playstate.playUponCued = true;
      $scope.playlist.position = clipIndex;
    };


    /*
    if ($scope.currClip && $scope.currClip != clip) {
      $scope.currClip.selected = false;
    }
    clip.selected = true;

    $scope.currClip = clip;
    YoutubeService.cueClip(clip);
    */
  };

  function genericSongsQuery() {
    var musicQuery = {entity : "Song"};
    musicQuery.select = "name artist fileNameOGG fileNameMP3 score votes";
    return musicQuery;
  }
}