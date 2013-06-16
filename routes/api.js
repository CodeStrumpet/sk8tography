/*
 * Serve JSON to our AngularJS client
 */
var mongoose = require('mongoose');
var Track = mongoose.model("Track");
var Video = mongoose.model("Video");

var videoHelper = require('../helpers/video');

var constantsPath = '../public/js/SharedConstants';


// PUT

exports.processVideo = function(req, res) {

  var videoId = req.body.videoId;

  require('async').series({

    checkVideoId : function(callback) {
      var err = null;
      if (videoId == null) {
        err = "invalid video id";
      }
      callback(err, null);
    },

    findVideo : function(callback) {
      var vidCallback = function (err, video) {

        if (err) {
          callback(err, null);
        } else {
          callback(null, video);
        }
      };

      Video
      .findById(videoId)
      .exec(vidCallback);
    },

    deleteExistingClips : function(callback) {

    }
  },

  function(err, results) {
    if (err) {
      res.json({
        error: err
      });
    } else {
      res.json({
        video: results.findVideo
      });

      var processCallback = function(err, result) {
        console.log("process video callback");
      };

      videoHelper.processVideo(results.findVideo, processCallback);
    }
  });
};


exports.addVideo = function(req, res) {

  var videoURL = req.body.url;

  var consts = require(constantsPath).Constantsinople;

  require('async').series({
    validateURL : function(callback) {
      
      var check = require('validator').check;
      var err = null;
      try {
        check(videoURL).isUrl();
      } catch (e) {
        err = "invalid URL";
      }
      callback(err, null); 
    },

    findExisting : function(callback) {
      var err = null;
      Video.findOne({url : videoURL}, function(fetchErr, video) {
        if (fetchErr) {
          err = "db error";
        } else if (video) {
          err = "video already exists";
        }
        callback(err, null);
      });    
    },

    newVideo : function(callback) {
      var err = null;
      var sourceId = videoHelper.videoSourceId(videoURL);

      // only accept videos with valid sourceId
      if (sourceId == null) {
        err = "invalid url (source id not found)";
        callback(err, null);
        return;
      }

      var newVideo = new Video({
        _id: sourceId,
        url: videoURL, 
        source :videoHelper.videoSource(videoURL),
        fileFormat : consts.VideoFileFormat.MP4,
        status : consts.VideoStatus.ADDED
      });   

      newVideo.save(function (saveErr) {
        if (saveErr) {
          console.log("saveErr: " + saveErr);
          err = "error saving video";
        }

        callback(err, newVideo);
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
      res.json(results.newVideo);

      // kick off child process to actually download and import the video
      console.log("kick off import of the video");
      videoHelper.importVideo(results.newVideo);
    }
  });
};


// GET

exports.videos = function (req, res) {

  var vidsCallback = function (err, videos) {
    res.json({
      videos : videos
    });
  };


  Video
  .find()
  .limit(20)
  .sort('-updated')
  .exec(vidsCallback);

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

