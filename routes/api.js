/*
 * Serve JSON to our AngularJS client
 */
var mongoose = require('mongoose');
var Track = mongoose.model("Track");
var VideoSegment = mongoose.model("VideoSegment");
var Clip = mongoose.model("Clip");
var Video = mongoose.model("Video");

var videoHelper = require('../helpers/video');

var constantsPath = '../public/js/SharedConstants';


// PUT

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


exports.addVideoSegment = function(req, res) {

  var videoSegmentURL = req.body.url;
  
  if (req.body.videoRef) {
    var videoRef =  mongoose.Types.ObjectId(req.body.videoRef);
  }

  var consts = require(constantsPath).Constantsinople;

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
      videoHelper.importVideoSegment(results.newSegment);
    }
  });
};


// GET

exports.videoSegments = function (req, res) {

  var vidsCallback = function (err, videoSegments) {
    res.json({
      videoSegments : videoSegments
    });
  };


  VideoSegment
  .find()
  .limit(20)
  .sort('-updated')
  .exec(vidsCallback);

};

exports.clips = function (req, res) {

  var clipsCallback = function (err, clips) {
    res.json({
      clips : clips
    });
  };

  Clip
  .find()
  .limit(20)
  .sort('-updated')
  .exec(clipsCallback);

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

