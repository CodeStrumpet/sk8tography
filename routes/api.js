/*
 * Serve JSON to our AngularJS client
 */
var mongoose = require('mongoose');
var Track = mongoose.model("Track");
var VideoSegment = mongoose.model("VideoSegment");
var Clip = mongoose.model("Clip");
var Video = mongoose.model("Video");
var Skater = mongoose.model("Skater");
var User = mongoose.model("User");
var TrickType = mongoose.model("TrickType");
var Feedback = mongoose.model("Feedback");
var Trick = mongoose.model("Trick");
var Tag = mongoose.model("Tag");
var UserEdit = mongoose.model("UserEdit");
var Song = mongoose.model("Song");
var Playlist = mongoose.model("Playlist");

var videoHelper = require('../helpers/video');

var constantsPath = '../public/js/SharedConstants';
var consts = require(constantsPath).Constantsinople;



// POST

exports.addVideo = function(req, res) {
  var videoData = req.body;

  var  newVideo = new Video({
    name: videoData.name,
    year: videoData.year,
    infoUrl: videoData.infoUrl,
    purchaseUrl: videoData.purchaseUrl
  });


  newVideo.save(function (saveErr) {
    if (saveErr) {
      console.log("saveErr: " + saveErr);
      res.json({
        error : saveErr
      });
    } else {
      res.json({
      video : newVideo
      });
    }
  });  
};

exports.addSkater = function(req, res) {
  var skaterData = req.body;

  var  newSkater = new Skater({
    name: skaterData.name,
    isGoofy : skaterData.isGoofy
  });


  newSkater.save(function (saveErr) {
    if (saveErr) {
      console.log("saveErr: " + saveErr);
      res.json({
        error : saveErr
      });
    } else {
      res.json({
        skater : newSkater
      });
    }
  });  
};

exports.addPlaylist = function(req, res) {
  var playlistData = req.body;

  var clips = [];

  for (var i = 0; i < playlistData.clips.length; i++) {
    clips.push(mongoose.Types.ObjectId(playlistData.clips[i]));
  }

  var song = mongoose.Types.ObjectId(playlistData.song);


  var newPlaylist = new Playlist({
    title: playlistData.title,
    clips: clips,
    song: song
  });

  newPlaylist.save(function (saveErr) {
    if (saveErr) {
      console.log("saveErr: " + saveErr);
      res.json({
        error : saveErr
      });
    } else {
      res.json({
        playlist : newPlaylist
      });
    }
  });  
};

exports.addTrickType = function(req, res) {
  var trickTypeData = req.body;

  var newTrickType = new TrickType({
    name: trickTypeData.name,
    otherNames: trickTypeData.otherNames,
    categories: trickTypeData.categories
  });

  newTrickType.save(function (saveErr) {
    if (saveErr) {
      console.log("saveErr: " + saveErr);
      res.json({
        error : saveErr
      });
    } else {
      res.json({
        trickType : newTrickType
      });
    }
  });  

};


exports.addVideoSegment = function(req, res) {

  var videoSegmentURL = req.body.videoSegment.url;

  var socketClientSessionId = req.body.socketSessionId;
  
  if (req.body.videoSegment.videoRef) {
    var videoRef =  mongoose.Types.ObjectId(req.body.videoSegment.videoRef);
  }

  if (req.body.videoSegment.skaterRef) {
    var skaterRef = mongoose.Types.ObjectId(req.body.videoSegment.skaterRef);
  }

  require('async').series({
    validateURL : function(callback) {
      
      var check = require('validator').check;
      var err = null;
      try {
        check(videoSegmentURL).isUrl();
      } catch (e) {
        err = "invalid URL";
      }
      callback(err, null); 
    },

    findExisting : function(callback) {
      var err = null;
      VideoSegment.findOne({url : videoSegmentURL}, function(fetchErr, videoSegment) {
        if (fetchErr) {
          err = "db error";
        } else if (videoSegment) {
          err = "video segment already exists";
        }
        callback(err, null);
      });    
    },

    newSegment : function(callback) {
      var err = null;
      var sourceId = videoHelper.videoSegmentSourceId(videoSegmentURL);

      // only accept video segments with valid sourceId
      if (sourceId == null) {
        err = "invalid url (source id not found)";
        callback(err, null);
        return;
      }


      var newVideoSegment = new VideoSegment({
        _id: sourceId,
        url: videoSegmentURL, 
        videoRef: videoRef,
        source :videoHelper.videoSource(videoSegmentURL),
        fileFormat : consts.VideoFileFormat.MP4,
        status : consts.VideoStatus.ADDED
      });   

      // add items to extraInfo if appropriate
      var extraInfo = newVideoSegment.extraInfo;      

      if (skaterRef) {
        extraInfo.skaterRef = skaterRef;
      }

      newVideoSegment.save(function (saveErr) {
        if (saveErr) {
          console.log("saveErr: " + saveErr);
          err = "error saving videoSegment";
        }

        callback(err, newVideoSegment);
      });
    }
  },

  // send result back to client
  function(err, results) {
    if (err) {
      console.log("error: " + err);
      res.json({
        error: err
      });
    } else {
      res.json(results.newSegment);

      // kick off child process to actually download and import the video
      console.log("kick off import of the video segment");
      videoHelper.importVideoSegment(results.newSegment, socketClientSessionId);
    }
  });
};


exports.login = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // attempt to authenticate user
  User.getAuthenticated(username, password, function(err, user, reason) {
    var response = {};

    if (err) {
      response.error = err;
    } else if (user) {
      response.user = user;
    } else {
      // otherwise we can determine why we failed
      var reasons = User.failedLogin;
      switch (reason) {
        case reasons.NOT_FOUND:
        case reasons.PASSWORD_INCORRECT:
          response.error = "login failed";
            // note: these cases are usually treated the same - don't tell
            // the user *why* the login failed, only that it did
            break;
        case reasons.MAX_ATTEMPTS:
          response.error  = "too many failed login attempts";
            // send email or otherwise notify user that account is
            // temporarily locked
            break;
      }
    }
    res.json(response);
  });

};


exports.signup = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  // create a new user
  var newUser = new User({
    username: username,
    password: password,
    email: email
  });

  // save user to database
  newUser.save(function(err) {
    if (err) {
      console.log(err);
      res.json({        
        error: "sign in failed"  // TODO send back more useful error
      });
    } else {
      res.json({
        user : newUser
      });
    }
  });
};

exports.feedback = function (req, res) {

  var feedbackObj = req.body.feedback;

  var newFeedback = new Feedback(feedbackObj);

  // save feedback to database
  newFeedback.save(function(err) {
    if (err) {
      console.log(err);
      res.json({
        error: "feedback failed"  // TODO send back more useful error
      });
    } else {
      res.json({
        feedback : newFeedback
      });
    }
  });
};


exports.upload = function(req, res) {
  console.log("upload!!");
  //console.log(req.body);
  //console.log(req.files);

  var files = [];
  if (req.files.uploadedFile) {
    console.log('uploaded File');
    files.push(req.files.uploadedFile);
  }

  if (req.files.uploadedFiles) {

    for (var i = 0; i < req.files.uploadedFiles.length; i++) {
      files.push(req.files.uploadedFiles[i]);
    }
  }

  var fs = require('fs');

  var msgs = [];

  for (var i = 0; i < files.length; i++) {
    // get the temporary location of the file
    var tmp_path = files[i].path;

    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = './uploads/' + files[i].name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) {
          msgs.push(JSON.stringify(err));          
        }


        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
          if (err) {
            msgs.push(JSON.stringify(err));          
          } else {
            msgs.push('File uploaded to: ' + target_path);
          }          
        });
    });
  }

  res.json({msgs: "unclear at this point whether the upload was successful"});
};

exports.uploadSongs = function(req, res) {
  console.log("upload songs!!");
  console.log(req.body);
  console.log(req.files);

  var files = [];
  if (req.files.uploadedFile) {
    files.push(req.files.uploadedFile);
  }

  if (req.files.uploadedFiles) {
    for (var i = 0; i < req.files.uploadedFiles.length; i++) {
      files.push(req.files.uploadedFiles[i]);
    }
  }

  // kind of a hack to deal with string object sent w/ xhr request
  var filesInfo = JSON.parse(req.body.filesInfo);

  var fs = require('fs');

  var msgs = [];

  var processingFns = [];

  for (var i = 0; i < files.length; i++) {
    var x = function () {
      var file = files[i];
      var fileInfo = filesInfo[i];
      processingFns.push(function(callback) {      

        // get the temporary location of the file
        var tmp_path = file.path;

        // set where the file should actually exists - in this case it is in the "images" directory
        var target_path = './audio/' + file.name;

        // move the file from the temporary location to the intended location
        fs.rename(tmp_path, target_path, function(err) {
          if (err) {
            callback(err, null);            
          } else {

            // add song to db
            //console.log(JSON.stringify(file));
            //console.log(JSON.stringify(fileInfo));

            var newSong = new Song({
              name: fileInfo.title,
              fileNameMP3: file.name,
              artist: fileInfo.artist
            });

            newSong.save(function (saveErr) {
              if (saveErr) {
                callback(saveErr, null);
              } else {
                callback(null, newSong);
              }
            });             
          }

          // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
          fs.unlink(tmp_path, function() {
            if (err) {
              msgs.push(JSON.stringify(err));          
            } else {
              msgs.push('File uploaded to: ' + target_path);
            }          
          });
        });

      });
    }();
  }

  require('async').parallel(processingFns, function(err, results) {
    console.log("Err: " + err);
    console.log("results: " + results);
  });



  res.json({msgs: "unclear at this point whether the upload was successful"});
};


// GET

exports.checkDemoPass = function(req, res) {

  var nconf = require('nconf');

  var response = {};

  var pass = req.query.pass;
  if (pass == nconf.get('DEMO_PASS')) {
    response.valid = true;
  } else {
    response.valid = false;
  }
  res.json(response);
};

exports.videoSegments = function (req, res) {

  var vidsCallback = function (err, videoSegments) {
    res.json({
      videoSegments : videoSegments
    });
  };

  var searchTerms = req.query.q;

  var query = VideoSegment.find();

  if (typeof(searchTerms) != 'undefined') {
    var re = new RegExp('\\b' + searchTerms, 'i');

    query.where('sourceTitle').regex(re);

  } else {
    query.limit(20);    
    query.sort('-updated');
  }    

  query.exec(vidsCallback);  

};

exports.clips = function (req, res) {

  var segmentId = req.query.segmentId;

  var clipsCallback = function (err, clips) {
    res.json({
      clips : clips
    });
  };

  var query = Clip.find();

  if (segmentId) {
    query.where('videoSegmentId', segmentId);
    query.sort('startTime');

  } else {
    query.limit(20);
    query.sort('-updated');
  }

  query.exec(clipsCallback);

};

exports.videos = function (req, res) {
  var videosCallback = function (err, videos) {
    console.log("num videos: " + videos.length);
    res.json({
      videos : videos
    });
  };

  var searchTerms = req.query.q;

  console.log("searchTerms: " + searchTerms);

  var query = Video.
  find()
  .limit(20);


  if (typeof(searchTerms) != 'undefined') {
    var re = new RegExp('\\b' + searchTerms, 'i');

    query.where('name').regex(re);

  } else {
    query.sort('-updated')
  }
  
  query.exec(videosCallback);  
};

exports.skaters = function (req, res) {
  var skatersCallback = function (err, skaters) {
    console.log("num skaters: " + skaters.length);
    res.json({
      skaters : skaters
    });
  };


  var searchTerms = req.query.q;
  var skaterId = req.query._id;

  console.log("searchTerms: " + searchTerms + " _id: " + skaterId);

  if (skaterId) {
    
    Skater.findById(skaterId).exec(skatersCallback);

  } else {
    var query = Skater.
    find()
    .limit(20);

    if (typeof(searchTerms) != 'undefined') {
      var re = new RegExp('\\b' + searchTerms, 'i');

      query.where('name').regex(re);

    } else {
      query.sort('-updated')
    }    
    query.exec(skatersCallback);  
  }
};

exports.trickTypes = function (req, res) {
  
  var trickTypesCallback = function (err, trickTypes) {
    res.json({
      trickTypes : trickTypes
    });
  };


  var searchTerms = req.query.q;
  var trickTypeId = req.query._id;

  console.log("searchTerms: " + searchTerms + " _id: " + trickTypeId);

  if (trickTypeId) {
    console.log("finding by ID: " + trickTypeId);
    TrickType.findById(trickTypeId).exec(trickTypesCallback);

  } else {
    var query = TrickType.
    find()
    .limit(20);

    if (typeof(searchTerms) != 'undefined') {
      var re = new RegExp('\\b' + searchTerms, 'i');

      query.where('name').regex(re);

    } else {
      query.sort('-updated')
    }    
    query.exec(trickTypesCallback);  
  }
};


exports.skaterClips = function(req, res) {

  Clip.find().distinct("skaterRef", function(error, skaterRefs) {
    if (error) {
      res.json({error : error});
      return;
    } else {

      Clip.find().exec(function(error, clips) {
        if (error) {
          res.json({error : error});
          return;

        } else {          
          var skatersObj = {};
          for (var i = 0; i < skaterRefs.length; i++) {
            skatersObj[skaterRefs[i]] = 1;
          }
          var reducedClips = [];
          for (var i = 0; i < clips.length; i++) {
            if (skatersObj[clips[i].skaterRef]) { // check if there is still a skater with this clip's skaterRef
              delete skatersObj[clips[i].skaterRef]; // we remove the skater
              reducedClips.push(clips[i]);
            } 
          }
          res.json({results : reducedClips});
        }

      });
    }
  });
}
  /*

  This could theoretically be done with a map-reduce function. here is the start of that...

  var o = {};
  o.map = function () { emit(this.skaterRef, this.thumbFileName) }
  o.reduce = function (k, vals) {
    return vals[0];
  }
  o.verbose = true;

  Clip.mapReduce(o, function (err, model, stats) {

    console.log("err: " + err);
    for (var i = 0; i < model.length; i++) {
      console.log("model: " + JSON.stringify(model[i]));      
    }
  });


  */
/*
  Clip.find().distinct('skaterRef', function(error, skaterRefs) {
    if (error) {
      // todo call error function with res and error params
      res.json({error: error});
    } else {
      Clip.find().where('skaterRef').in(skaterRefs).exec(function (error, clips) {
        if (error) {
          res.json({error: error});
        } else {
          res.json({results:clips});
        }
      });
    }
  });
*/


exports.activeTrickTypes = function(req, res) {

  TrickType.activeTrickTypes(function(err, results) {
    if (err) {
      res.json({error : err});      
    } else {      
      res.json({
        results : results
      });
    }
  });
};


// PUT

exports.fetchResults = function (req, res) {

  var response = {};

  var modelMappings = {
    "Skater" : Skater,
    "Clip" : Clip,
    "TrickType" : TrickType,
    "Video" : Video,
    "Feedback" : Feedback,
    "Song" : Song,
    "Playlist" : Playlist
  };

  var queryObj = req.body.q;

  var entity = modelMappings[queryObj.entity];

  // exit early if it is an invalid query
  if (!entity) {
    response.error = "invalid entity";
    res.json(response);
    return;
  } 

  var fetchCallback = function (err, results) {
    console.log("num results: " + results.length);
    
    res.json({
      results : results
    });
  };

  var searchTerms = queryObj.searchTerms;
  var objectId = queryObj._id;
  var searchConditions = queryObj.conditions;
  var searchField = queryObj.searchField;

  console.log("searchTerms: " + searchTerms + " _id: " + objectId);

  if (objectId) {
    
    entity.findById(objectId).exec(fetchCallback);

  } else {

    var query = entity.find();

    // add the search conditions if they exist
    if (searchConditions) {
      for (var i = 0; i < searchConditions.length; i++) {
        query.where(searchConditions[i].path, searchConditions[i].val);
      }
    }

    // set the fields to retrieve
    if (queryObj.select) {
      console.log("select: " + JSON.stringify(queryObj.select));
      query.select(queryObj.select);
    } else {
      // will the default be to just select everything??
      //query.select("name");
    }

    // try to populate subfields if possible
    if (queryObj.populate) {
      query.populate(queryObj.populate);
    }

    if (typeof(searchTerms) != 'undefined' && typeof(searchField) != 'undefined') {
      var re = new RegExp('\\b' + searchTerms, 'i');

      query.where(searchField).regex(re);

    } else {
        query.sort({name : 1});

        //query.sort('-updated')
    }    
    query.exec(fetchCallback);  
  }
};

exports.processVideoSegment = function(req, res) {

  var videoSegmentId = req.body.videoSegmentId;

  require('async').series({

    checkId : function(callback) {
      var err = null;
      if (videoSegmentId == null) {
        err = "invalid video segment id";
      }
      callback(err, null);
    },

    findSegment : function(callback) {
      var vidCallback = function (err, videoSegment) {

        if (err) {          
          callback(err, null);
        } else {
          callback(null, videoSegment);
        }
      };

      VideoSegment
      .findById(videoSegmentId)
      .exec(vidCallback);
    },

    deleteExistingClips : function(callback) {
      callback(null, null);
    }
  },

  function(err, results) {
    if (err) {
      res.json({
        error: err
      });
    } else {
      res.json({
        videoSegment: results.findSegment
      });

      var processCallback = function(err, result) {
        if (err) {
          console.log("process video err: " + err);  
        } else {
          console.log("process video succeeded");
        }        
      };

      videoHelper.processVideoSegment(results.findSegment, processCallback);
    }
  });
};

function modelForObjType(objType) {

  if (objType === consts.ObjType.CLIP) {
    return Clip;
  } 
  return null;
}

exports.likeItem = function(req, res) {
  var objId = req.body.objId;
  var objType = req.body.objType;
  var userId = req.body.userId;

  var model = modelForObjType(objType);

  model.findOne({_id: objId}, function(err,obj) {
    if (err) {
      res.json({
        error : err
      });
    } else {
      if (obj.votes.indexOf(userId) >= 0) {
        console.log("user id was found, not allowing the vote...");
        res.json({
          error : "user already voted"
        });
      } else {

        obj.score++;
        obj.votes.push(mongoose.Types.ObjectId(userId));
        obj.save(function (err) {
          if (err) {
            res.json({
              error : err
            });
          } else {
            res.json({
              score : obj.score
            });
          }
        });        
      }
    }
  });
};



exports.updateClip = function(req, res) {
  var clip = req.body.clip;

  var clipCallback = function (err, dbClip) {
    if (err) { 
      console.log("retrieval error: " + err);
      res.json({
        error : err
      });         
    } else {      
      dbClip.updated = new Date().toISOString();

      // add the skaterRef to the dbClip
      if (clip.skaterRef) {
        dbClip.skaterRef = clip.skaterRef;

        // use this opportunity to set a thumbnail for the skater if it isn't already set
        Skater.findOne({_id: clip.skaterRef}, function (err, skater) {
          if (skater) {
            if (!skater.thumbFileName) {
              skater.thumbFileName = clip.thumbFileName;

              skater.save(function (err) {
                if (err) {
                  console.log("error saving new thumb with skater");
                }
              });
            }
          }
        });
      }

      console.log("editUserRef: " + JSON.stringify(clip.editUserRef));

      if (clip.editUserRef) {

        // should we check if the userRef is valid or something? Maybe in the objectId creation part??                

        //var feedbackObj = req.body.feedback;
        var userObjId = mongoose.Types.ObjectId(clip.editUserRef);
        var userEditObj = {editUser : userObjId};

        var newUserEdit = new UserEdit(userEditObj);
        dbClip.edits.push(newUserEdit);

        console.log("added a userEdit to dbClip.edits");
      }


      // merge or replace the clips existing tricks with the one passed in the request body
      dbClip.mergeTricks(clip.tricks, clip);

      if (dbClip.tricks.length > 0 || dbClip.skaterRef) {
        dbClip.status = consts.ClipStatus.TAGGED;
      }

      dbClip.save(function (saveErr) {
        if (saveErr) {
          res.json({
            error : saveErr
          });         
        } else {
          res.json({
            clip : dbClip
          });
        }
      });
    }
  };

  Clip.findById(clip._id).exec(clipCallback);
};



// ============================================================
// ============================================================


// GET

exports.posts = function (req, res) {  
  Track.find({}, function (err, posts) {
        res.json({
          posts: posts
        });
  });
};

exports.post = function (req, res) {
  Track.findOne({_id: req.params.id}, function(err,obj) {
    console.log('returns the post: ' + obj);
  res.json({
    post: obj
    });
});
};
// POST

exports.addPost = function (req, res) {
  var newTrack = new Track(req.body);
  newTrack.save();
  console.log("post added: " + req.body);
  res.json(req.body);
};


// PUT

exports.editPost = function (req, res) {
  //console.log("edit post: " + req.body.title);
  Track.findByIdAndUpdate(req.params.id, { 
    $set: { text: req.body.text, title: req.body.title }}, {upsert:true}, function (err, user) {
      return res.json(true);
    }
  );
};

exports.deletePost = function (req, res) {
  Track.remove({_id: req.params.id}, function (err) {
    if (!err) {
      console.log('no delete post error');
      res.json(true);
    }
    else {
      console.log('delete post error');
      res.json(false);
    }
  });
};

