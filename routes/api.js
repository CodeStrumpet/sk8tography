/*
 * Serve JSON to our AngularJS client
 */
var mongoose = require('mongoose');
var Track = mongoose.model("Track");
var Video = mongoose.model("Video");

var videoHelper = require('../helpers/video');

var constantsPath = '../public/js/SharedConstants';


// PUT

exports.addVideo = function(req, res) {

  var videoURL = req.body.url;
  var respJSON = {};

  // make sure URL is valid
  var check = require('validator').check;
  try {
    check(videoURL).isUrl();
  } catch (e) {
    respJSON.error = "invalid URL";
    res.json(respJSON);
    return;
  }

  var consts = require(constantsPath).Constantsinople;

  Video.findOne({url : videoURL}, function(err, video) {
    
    if (err) {
      respJSON.error = "db error";
      res.json(respJSON);
    } else if (video) {
      respJSON.error = "video already exists";
      res.json(respJSON);
    } else {

      // video didn't exist, so we create it

      var newVideo = new Video({
        url: videoURL, 
        source :consts.VideoSource.YOUTUBE, 
        fileFormat : consts.VideoFileFormat.MP4,
        status : consts.VideoStatus.ADDED
      });   

      newVideo.save(function (err) {
        if (err) {
          respJSON.error = "db error";
          res.json(respJSON);
          return;
        }

        // send back video to indicate success...
        res.json(newVideo);

        // kick off child process to actually download and import the video
        console.log("kick off import of the video");
        videoHelper.importVideo(newVideo);

      });
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

