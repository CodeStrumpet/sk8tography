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

  var consts = require(constantsPath).Constantsinople;

  console.log("One possible video status is: " + consts.VideoStatus.AVAILABLE);

  var testVideo = new Video({url: videoURL, 
    source :consts.VideoSource.YOUTUBE, 
    fileFormat : consts.VideoFileFormat.MP4
  });

  console.log("video filename: " + testVideo.fileName());
  

  /* TODO
    - check if video is already in db
      > if so, return error
    - if not, add video with status downloading
    - return video
  */


  res.json(true);

  videoHelper.importVideo(videoURL);
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

