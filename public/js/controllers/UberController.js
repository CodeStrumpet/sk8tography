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
  $scope.newPlaylist = {};


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

  // fetch top playlists so we can show something in the explore tab
  APIService.fetchItems(topPlaylistsQuery(), true).then(function(playlists) {
    $scope.playlists = playlists;
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
    }
  };

  $scope.playSearchResult = function(searchResultIndex) {
    console.log("play search result");

    $scope.playlist.temp = $scope.searchClips[searchResultIndex];
    
  };

  $scope.setNewPlaylist = function(thePlaylist) {

    // first clear whatever we currently have in terms of a playlist
    //$scope.clearPlaylist();

    $scope.playlist.purgedItems = $scope.playlist.items;

    // now introduce the new playlist
    $scope.playlist.position = -1;
    $scope.playlist.items = thePlaylist.clips;
    $scope.playlist.song = thePlaylist.song;
    $scope.playlist.title = thePlaylist.title;
  };

  $scope.clearPlaylist = function() {

    if ($scope.newPlaylist) {
      $scope.newPlaylist.title = null;      
    }
    if ($scope.music) {
      $scope.music.searchText = null;
    }
  };

  $scope.savePlaylist = function() {
    console.log("save playlist");

    var clipIds = [];
    for (var i = 0; i < $scope.playlist.items.length; i++) {
      if ($scope.playlist.items[i]._id) {
        clipIds.push($scope.playlist.items[i]._id);
      }
    }

    $scope.newPlaylist.clips = clipIds;
    $scope.newPlaylist.song = $scope.playlist.song._id;

    $http.post('/api/addPlaylist', $scope.newPlaylist).
      success(function(data) {
        if (data.error) {
          console.log("add Playlist failed: " + data.error);
        } else {
          console.log("add Playlist returned success.");
          console.log(data.playlist);
          $scope.playlist._id = data.playlist._id;
        }
    });
  };

  $scope.selectClip = function(clipIndex) {
    if (clipIndex == $scope.playlist.postion) {
      // toggle playstate of that clip...
      console.log("somehow activate toggle play pause of the current clip...");
    } else {
      $scope.playstate.playUponCued = true;
      $scope.playlist.position = clipIndex;
    };
  };

  $scope.savePlaylistEnabled = function() {
    return !$scope.playlist._id && $scope.playlist.items.length > 0 && $scope.newPlaylist.title && $scope.newPlaylist.title.length > 0 && $scope.playlist.song;
  };

  function genericSongsQuery() {
    var musicQuery = {entity : "Song"};
    musicQuery.select = "name artist fileNameOGG fileNameMP3 score votes";
    return musicQuery;
  }

  function topPlaylistsQuery() {
    var playlistQuery = {entity : "Playlist"};
    playlistQuery.select = "title song clips";
    playlistQuery.populate = "clips song";
    return playlistQuery; 
  }
}